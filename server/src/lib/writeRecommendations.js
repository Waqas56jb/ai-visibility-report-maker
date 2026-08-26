import { completeJson } from '../services/openai.js';
import { Recommendations } from '../services/schemas.js';
import { settings } from '../config/env.js';
import { SERVICES, serviceKeysWithDescriptions } from '../config/services.js';

function grounded(rec, inputs) {
  const why = rec.why_it_matters || '';
  if (/\d/.test(why)) return true;
  const hay = why.toLowerCase();
  if ((inputs.checklistKeys || []).some((k) => hay.includes(String(k).toLowerCase()))) return true;
  if ((inputs.competitorNames || []).some((n) => n && hay.includes(String(n).toLowerCase()))) return true;
  return false;
}

export async function writeRecommendations({ summary, scored, crawl, competitors, gaps, usage, citationDomains }) {
  const vars = {
    business_summary: summary,
    overall: scored.overall_score,
    band: scored.score_band,
    score_by_mode: scored.score_by_mode,
    score_by_category: scored.score_by_category,
    metrics: scored.metrics,
    ai_readiness: crawl.checks,
    competitors,
    gaps_top_15: gaps.slice(0, 15),
    competitor_citation_domains: citationDomains || [],
    service_keys_with_descriptions: serviceKeysWithDescriptions(),
    rewrite_note: '',
  };

  let { data } = await completeJson({
    promptStem: 'recommendations',
    schema: Recommendations,
    schemaName: 'Recommendations',
    model: settings().modelStrong,
    temperature: 0.3,
    max_tokens: 3500,
    stage: 'recommendations',
    usage,
    vars,
  });

  const inputs = {
    checklistKeys: (crawl.checks || []).map((c) => c.key),
    competitorNames: (competitors || []).map((c) => c.name),
  };
  const bad = (data.recommendations || []).map((r, i) => (!grounded(r, inputs) ? i + 1 : null)).filter(Boolean);
  if (bad.length) {
    const retry = await completeJson({
      promptStem: 'recommendations',
      schema: Recommendations,
      schemaName: 'Recommendations',
      model: settings().modelStrong,
      temperature: 0.2,
      max_tokens: 3500,
      stage: 'recommendations_rewrite',
      usage,
      vars: {
        ...vars,
        rewrite_note: `Recommendation ${bad.join(', ')} was not grounded; rewrite citing a specific number or check.`,
      },
    });
    data = retry.data;
  }

  const recommendations = (data.recommendations || []).slice(0, 10).map((r) => ({
    ...r,
    title: r.title,
    why: r.why_it_matters,
    how: r.what_to_do,
    impact: r.expected_impact,
    service: r.service_key,
  }));

  return { summary: data.summary || '', recommendations };
}

export function mapToServices(recommendations) {
  const groups = Object.keys(SERVICES).map((key) => ({
    service_key: key,
    ...SERVICES[key],
    items: recommendations.filter((r) => (r.service || r.service_key) === key).map((r) => r.title),
  }));
  return groups.filter((g) => g.items.length);
}
