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
import { sendCompletedReportEmail } from './mailer.js';
import { settings } from '../config/env.js';
import { createDeadline, keepAlive, SliceYield } from './keepAlive.js';
import { loadQueryRows, saveQueryRows, testsFinished } from './reportQueries.js';

const queue = new PQueue({ concurrency: 2 });
const running = new Map();

export function startPipeline(reportId) {
  if (running.has(reportId)) return running.get(reportId);
  const job = queue
    .add(() => runLocked(reportId))
    .finally(() => running.delete(reportId));
  running.set(reportId, job);
  keepAlive(job);
  return job;
}

async function acquireLock(id, ttlMs = 50_000) {
  const cutoff = new Date(Date.now() - ttlMs).toISOString();
  const { data, error } = await supabase
    .from('reports')
    .update({ pipeline_lock_at: new Date().toISOString() })
    .eq('id', id)
    .or(`pipeline_lock_at.is.null,pipeline_lock_at.lt."${cutoff}"`)
    .select('id')
    .maybeSingle();
  if (error) {
    console.warn('pipeline lock', error.message);
    return true;
  }
  return Boolean(data);
}

async function releaseLock(id) {
  await supabase.from('reports').update({ pipeline_lock_at: null }).eq('id', id);
}

async function runLocked(reportId) {
  const got = await acquireLock(reportId);
  if (!got) return;
  try {
    await run(reportId);
  } finally {
    await releaseLock(reportId);
  }
}

async function setStep(id, step) {
  await supabase.from('reports').update({ progress_step: step, status: 'processing' }).eq('id', id);
}

async function patch(id, fields) {
  await supabase.from('reports').update(fields).eq('id', id);
}

function crawlFromReport(report) {
  const raw = report.site_profile_raw || {};
  const ai = report.ai_readiness || {};
  return {
    domain: raw.domain,
    crawl_status: raw.crawl_status,
    pages: raw.pages || [],
    readability_score: report.readability_score || ai.score || 0,
    checks: ai.checks || [],
    audit_incomplete: !!ai.audit_incomplete,
  };
}

function restoreUsage(report) {
  const usage = new UsageTracker();
  if (Array.isArray(report.token_usage)) usage.entries.push(...report.token_usage);
  return usage;
}

async function run(reportId) {
  const { data: report, error } = await supabase.from('reports').select('*').eq('id', reportId).maybeSingle();
  if (error || !report) return;
  if (report.status === 'completed') return;

  const usage = restoreUsage(report);
  const prompt_versions = report.prompt_versions || {};
  const deadline = createDeadline();
  let truncated = !!report.truncated;

  try {
    if (report.status === 'queued' || !report.progress_step || report.progress_step === 'queued') {
      await patch(reportId, { status: 'processing', progress_step: STAGES[0], error: null });
    }

    let crawl = crawlFromReport(report);
    if (!report.site_profile_raw || !report.ai_readiness) {
      await setStep(reportId, 'crawling');
      crawl = await crawlWebsite(report.website);
      await patch(reportId, {
        site_profile_raw: {
          domain: crawl.domain,
          crawl_status: crawl.crawl_status,
          page_count: (crawl.pages || []).length,
          pages: (crawl.pages || []).slice(0, 8),
        },
        ai_readiness: { score: crawl.readability_score, checks: crawl.checks, audit_incomplete: crawl.audit_incomplete },
        readability_score: crawl.readability_score,
        token_usage: usage.entries,
      });
    }

    if (!hasOpenAI()) throw new Error('OPENAI_API_KEY is missing');

    let summary = report.business_summary;
    let queries = [];
    const existingRows = await loadQueryRows(reportId);
    if (existingRows.length) {
      const seen = new Set();
      queries = existingRows
        .filter((r) => {
      if (!r.text || seen.has(r.text)) return false;
      seen.add(r.text);
      return true;
    })
        .map((r) => ({ text: r.text, category: r.category, topic: r.topic, intent: r.intent }));
    }

    if (!summary || !queries.length) {
      await setStep(reportId, 'generating_queries');
      summary = summary || (await understandBusiness(report, crawl, usage));
      prompt_versions.business_summary = 'business_summary.v1';
      if (!queries.length) {
        queries = await generateQueries(report, summary, usage);
        prompt_versions.query_generation = 'query_generation.v1';
        await saveQueryRows(reportId, queries);
      }
      await patch(reportId, { business_summary: summary, prompt_versions, token_usage: usage.entries });
    }

    let rows = existingRows.filter((r) => r.mode);
    if (!testsFinished(rows)) {
      await setStep(reportId, 'testing');
      let writes = 0;
      try {
        rows = await runVisibilityTests(
          { ...report, _existingRows: rows.length ? rows : existingRows },
          summary,
          queries,
          usage,
          {
            deadline,
            onProgress: async (current) => {
              writes += 1;
              if (writes % 4 !== 0) return;
              await saveQueryRows(reportId, current);
              await patch(reportId, {
                token_usage: usage.entries,
                metrics: {
                  ...(report.metrics || {}),
                  tests_done: current.filter((r) => r.raw_answer || r.error).length,
                  tests_total: current.length,
                },
              });
            },
          }
        );
      } catch (err) {
        if (err instanceof SliceYield) {
          const current = err.rows || rows;
          await saveQueryRows(reportId, current);
          await patch(reportId, {
            status: 'processing',
            progress_step: 'testing',
            token_usage: usage.entries,
            truncated: usage.truncated,
            metrics: {
              ...(report.metrics || {}),
              tests_done: current.filter((r) => r.raw_answer || r.error).length,
              tests_total: current.length,
            },
          });
          return;
        }
        throw err;
      }
      await saveQueryRows(reportId, rows);
    }

    if (deadline.hit(12000)) throw new SliceYield();

    truncated = usage.truncated;
    prompt_versions.mention_extraction = 'mention_extraction.v1';

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
        tests_done: rows.length,
        tests_total: rows.length,
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

    try {
      const { data: done } = await supabase.from('reports').select('*').eq('id', reportId).maybeSingle();
      if (done && done.notify_email !== false && settings().emailOnComplete !== false) {
        const mailed = await sendCompletedReportEmail(done);
        if (mailed?.sent) {
          await patch(reportId, { email_sent_at: new Date().toISOString() });
        }
      }
    } catch (err) {
      console.warn('report email failed', reportId, err.message);
    }
  } catch (err) {
    if (err instanceof SliceYield) {
      await patch(reportId, { status: 'processing', token_usage: usage.entries });
      return;
    }
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
