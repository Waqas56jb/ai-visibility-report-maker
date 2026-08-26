import PQueue from 'p-queue';
import { supabase } from '../supabase.js';
import { STAGES } from '../config/weights.js';
import { UsageTracker, hasOpenAI } from '../services/openai.js';
import { crawlWebsite } from './crawler.js';
import { understandBusiness } from './understandBusiness.js';
import { generateQueries } from './generateQueries.js';
import { runVisibilityTests } from './runVisibilityTests.js';
import { analyseCompetitors, scoreReport } from './score.js';
import { buildGapList } from './buildGapList.js';
import { writeRecommendations, mapToServices } from './writeRecommendations.js';
import { renderPdf } from './renderPdf.js';

const queue = new PQueue({ concurrency: 2 });
const running = new Set();

export function startPipeline(reportId) {
  if (running.has(reportId)) return;
  running.add(reportId);
  queue.add(() => run(reportId)).finally(() => running.delete(reportId));
}

async function setStep(id, step) {
  await supabase.from('reports').update({ progress_step: step, status: 'processing' }).eq('id', id);
}

async function patch(id, fields) {
  await supabase.from('reports').update(fields).eq('id', id);
}

async function run(reportId) {
  const { data: report, error } = await supabase.from('reports').select('*').eq('id', reportId).maybeSingle();
  if (error || !report) return;

  const usage = new UsageTracker();
  const prompt_versions = {};
  let truncated = false;

  try {
    await patch(reportId, { status: 'processing', progress_step: STAGES[0], error: null });

    await setStep(reportId, 'crawling');
    const crawl = await crawlWebsite(report.website);
    await patch(reportId, {
      site_profile_raw: { domain: crawl.domain, crawl_status: crawl.crawl_status, page_count: (crawl.pages || []).length },
      ai_readiness: { score: crawl.readability_score, checks: crawl.checks, audit_incomplete: crawl.audit_incomplete },
      readability_score: crawl.readability_score,
    });

    if (!hasOpenAI()) throw new Error('OPENAI_API_KEY is missing');

    await setStep(reportId, 'generating_queries');
    const summary = await understandBusiness(report, crawl, usage);
    prompt_versions.business_summary = 'business_summary.v1';
    const queries = await generateQueries(report, summary, usage);
    prompt_versions.query_generation = 'query_generation.v1';
    await patch(reportId, { business_summary: summary });

    try {
      await supabase.from('report_queries').delete().eq('report_id', reportId);
      if (queries.length) {
        await supabase.from('report_queries').insert(
          queries.map((q) => ({
            report_id: reportId,
            text: q.text,
            category: q.category,
            topic: q.topic,
            intent: q.intent,
          }))
        );
      }
    } catch {
      /* table may not exist yet */
    }

    await setStep(reportId, 'testing');
    const rows = await runVisibilityTests(report, summary, queries, usage);
    truncated = usage.truncated;
    prompt_versions.mention_extraction = 'mention_extraction.v1';

    try {
      await supabase.from('report_queries').delete().eq('report_id', reportId);
      if (rows.length) {
        await supabase.from('report_queries').insert(
          rows.map((q) => ({
            report_id: reportId,
            text: q.text,
            category: q.category,
            topic: q.topic || null,
            intent: q.intent || null,
            mode: q.mode,
            raw_answer: String(q.raw_answer || '').slice(0, 8000),
            citations: q.citations || [],
            extraction: q.extraction,
            error: q.error || null,
          }))
        );
      }
    } catch (err) {
      console.warn('report_queries persist', err.message);
    }

    await setStep(reportId, 'scoring');
    const competitorAnalysis = analyseCompetitors(report, summary, rows, crawl.readability_score || 0);
    const scored = scoreReport({ rows, crawl, competitorAnalysis });
    const gaps = buildGapList(rows);
    competitorAnalysis.target.est_score = scored.overall_score;

    await setStep(reportId, 'writing_recommendations');
    const citationDomains = [
      ...new Set(rows.filter((r) => r.mode === 'browsing').flatMap((r) => r.citations || [])),
    ].slice(0, 20);
    const recs = await writeRecommendations({
      summary,
      scored,
      crawl,
      competitors: competitorAnalysis.competitors,
      gaps,
      usage,
      citationDomains,
    });
    prompt_versions.recommendations = 'recommendations.v1';
    const how_makeflow_helps = mapToServices(recs.recommendations);

    await setStep(reportId, 'generating_pdf');
    const payload = {
      overall_score: scored.overall_score,
      score_band: scored.score_band,
      readability_score: scored.readability_score,
      score_by_mode: scored.score_by_mode,
      score_by_category: scored.score_by_category,
      metrics: scored.metrics,
      recommendations: recs.recommendations,
      executive_summary: recs.summary,
    };
    const pdf_url = await renderPdf(report, payload);

    const genericAdvice = rows.filter((r) => r.extraction?.answer_recommends_providers === false && !r.error).length;

    await patch(reportId, {
      status: 'completed',
      progress_step: 'completed',
      completed_at: new Date().toISOString(),
      overall_score: scored.overall_score,
      score_band: scored.score_band,
      readability_score: scored.readability_score,
      score_by_mode: scored.score_by_mode,
      score_by_category: scored.score_by_category,
      metrics: {
        ...scored.metrics,
        truncated,
        generic_advice_count: genericAdvice,
        query_count: queries.length,
        token_cost_usd: Number(usage.cost.toFixed(4)),
      },
      ai_readiness: {
        score: crawl.readability_score,
        checks: crawl.checks,
        audit_incomplete: crawl.audit_incomplete,
      },
      result_competitors: competitorAnalysis.competitors,
      gaps,
      recommendations: recs.recommendations,
      how_makeflow_helps,
      executive_summary: recs.summary,
      pdf_url,
      token_usage: usage.entries,
      prompt_versions,
      truncated,
      error: crawl.audit_incomplete ? 'Site could not be fully crawled; readiness audit is incomplete.' : null,
    });
  } catch (err) {
    console.error('pipeline failed', reportId, err);
    await patch(reportId, {
      status: 'failed',
      progress_step: 'failed',
      error: err.message || 'Report generation failed.',
      token_usage: usage.entries,
    });
  }
}

export async function resumeInFlight() {
  const { data } = await supabase.from('reports').select('id').in('status', ['queued', 'processing']);
  (data || []).forEach((row) => startPipeline(row.id));
}

export { queue };
