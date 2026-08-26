import { domainOf, normalizeUrl } from './url.js';

function mapChecks(ai) {
  if (!ai) return ai;
  const checks = (ai.checks || []).map((c) => {
    if (Array.isArray(c)) return c;
    return [c.status, c.label, c.evidence, `${c.points_awarded ?? 0}/${c.points_max ?? 0}`];
  });
  return { ...ai, checks };
}

function mapRecs(recs) {
  return (recs || []).map((r) => ({
    ...r,
    why: r.why || r.why_it_matters,
    how: r.how || r.what_to_do,
    impact: r.impact || r.expected_impact,
    service: r.service || r.service_key,
  }));
}

function mapGaps(gaps) {
  return (gaps || []).map((g) => ({
    ...g,
    named_instead: g.named_instead || g.competitors_named || [],
  }));
}

function usageCost(row) {
  const fromMetrics = Number(row.metrics?.token_cost_usd);
  if (Number.isFinite(fromMetrics) && fromMetrics > 0) return fromMetrics;
  const entries = Array.isArray(row.token_usage) ? row.token_usage : [];
  return entries.reduce((sum, e) => sum + (Number(e.cost) || 0), 0);
}

function mapReport(row) {
  if (!row) return null;
  return {
    id: row.id,
    business_id: row.business_id,
    business_name: row.business_name,
    website: row.website,
    industry: row.industry,
    city_region: row.city_region,
    country: row.country,
    tracked_competitors: row.competitors || [],
    competitors: row.result_competitors || row.competitors_result || [],
    key_services: row.key_services || [],
    modes: row.modes || { browsing: true, knowledge: true },
    notify_email: row.notify_email,
    status: row.status,
    progress_step: row.progress_step,
    error: row.error,
    overall_score: row.overall_score,
    score_band: row.score_band,
    readability_score: row.readability_score,
    score_by_mode: row.score_by_mode,
    score_by_category: row.score_by_category,
    metrics: row.metrics,
    weights: row.metrics?.weights || [],
    ai_readiness: mapChecks(row.ai_readiness),
    competitors_result: row.result_competitors,
    gaps: mapGaps(row.gaps),
    recommendations: mapRecs(row.recommendations),
    how_makeflow_helps: row.how_makeflow_helps,
    executive_summary: row.executive_summary,
    notes: row.notes || '',
    pdf_url: row.pdf_url,
    is_public: row.is_public,
    truncated: row.truncated,
    created_at: row.created_at,
    completed_at: row.completed_at,
  };
}

function mapAdminReport(row, profile = null) {
  const base = mapReport(row);
  if (!base) return null;
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
  return {
    ...base,
    user_id: row.user_id,
    lead_name: name || profile?.email || '',
    lead_email: profile?.email || '',
    query_count: row.metrics?.query_count ?? 0,
    cost: Number(usageCost(row).toFixed(4)),
    token_usage: Array.isArray(row.token_usage) ? row.token_usage : [],
    prompt_versions: row.prompt_versions || {},
    public_url: `${process.env.CLIENT_ORIGIN || ''}/report/${row.id}`,
  };
}

function mapQueryRow(q) {
  const ex = q.extraction || {};
  return {
    id: q.id,
    text: q.text,
    category: q.category,
    topic: q.topic,
    intent: q.intent,
    mode: q.mode,
    mentioned: !!ex.target_mentioned,
    position: ex.target_position ?? null,
    cited: !!ex.target_cited,
    sentiment: ex.target_sentiment || null,
    competitors: ex.competitors_named || [],
    error: q.error || null,
  };
}

export { normalizeUrl, domainOf, mapReport, mapAdminReport, mapQueryRow, usageCost };
