import { completeJson } from '../services/openai.js';
import { QuerySet } from '../services/schemas.js';
import { settings } from '../config/env.js';
import { QUERY_DISTRIBUTION } from '../config/weights.js';
import { levenshteinRatio } from './fuzzy.js';

function distFor(total) {
  const base = QUERY_DISTRIBUTION;
  const baseTotal = Object.values(base).reduce((s, n) => s + n, 0);
  if (total === baseTotal) return { ...base };
  const scale = total / baseTotal;
  const out = {};
  let used = 0;
  const keys = Object.keys(base);
  keys.forEach((k, i) => {
    if (i === keys.length - 1) out[k] = Math.max(1, total - used);
    else {
      out[k] = Math.max(1, Math.round(base[k] * scale));
      used += out[k];
    }
  });
  return out;
}

function clean(queries, summary) {
  const name = (summary.canonical_name || '').toLowerCase();
  const out = [];
  for (const q of queries || []) {
    const text = String(q.text || '').trim();
    if (!text) continue;
    const dup = out.some((x) => levenshteinRatio(x.text, text) > 0.85);
    if (dup) continue;
    const mentions = q.mentions_target || (name && text.toLowerCase().includes(name));
    if (mentions && !['brand', 'comparison'].includes(q.category)) continue;
    out.push({ ...q, text, mentions_target: Boolean(mentions) });
  }
  return out;
}

export async function generateQueries(report, summary, usage) {
  const total = settings().maxQueries;
  const d = distFor(total);
  const vars = {
    business_summary: summary,
    competitors: (report.competitors || []).join(', ') || 'none',
    total,
    n_discovery: d.discovery,
    n_comparison: d.comparison,
    n_brand: d.brand,
    n_info: d.informational,
    n_local: d.local,
    n_longtail: d.longtail,
    topup_note: '',
  };

  const first = await completeJson({
    promptStem: 'query_generation',
    schema: QuerySet,
    schemaName: 'QuerySet',
    model: settings().modelMini,
    temperature: 0.4,
    max_tokens: 3000,
    stage: 'generate_queries',
    usage,
    vars,
  });

  let queries = clean(first.data.queries, summary);

  if (queries.length < total) {
    const missing = {};
    for (const [k, n] of Object.entries(d)) {
      const have = queries.filter((q) => q.category === k).length;
      if (have < n) missing[k] = n - have;
    }
    const need = Object.values(missing).reduce((s, n) => s + n, 0);
    if (need > 0 && !usage.wouldExceed()) {
      const top = await completeJson({
        promptStem: 'query_generation',
        schema: QuerySet,
        schemaName: 'QuerySet',
        model: settings().modelMini,
        temperature: 0.4,
        max_tokens: 2000,
        stage: 'generate_queries_topup',
        usage,
        vars: {
          ...vars,
          total: need,
          n_discovery: missing.discovery || 0,
          n_comparison: missing.comparison || 0,
          n_brand: missing.brand || 0,
          n_info: missing.informational || 0,
          n_local: missing.local || 0,
          n_longtail: missing.longtail || 0,
          topup_note: 'This is a top-up. Only generate the missing category counts above. Do not repeat existing queries.',
        },
      });
      queries = clean([...queries, ...(top.data.queries || [])], summary);
    }
  }

  return queries.slice(0, total);
}
