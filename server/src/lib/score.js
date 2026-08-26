import { isExcludedEntity } from '../config/exclusions.js';
import { WEIGHTS, MODE_WEIGHT, POSITION_POINTS, SENTIMENT_POINTS, bandOf } from '../config/weights.js';
import { normalizeName, similar } from './fuzzy.js';

function opportunity(row) {
  if (row.error || !row.extraction) return false;
  if (row.extraction.answer_recommends_providers === false) return false;
  return true;
}

function posPoints(pos, mentioned) {
  if (!mentioned) return 0;
  if (!pos) return 20;
  if (pos >= 5) return 20;
  return POSITION_POINTS[pos] ?? 20;
}

export function analyseCompetitors(report, summary, rows, readinessScore) {
  const opp = rows.filter(opportunity);
  const counts = new Map();

  function bump(name) {
    const key = normalizeName(name);
    if (!key || isExcludedEntity(name)) return;
    if (similar(name, summary.canonical_name, 0.88)) return;
    const cur = counts.get(key) || { name, mentions: 0, positions: [], citations: 0 };
    cur.mentions += 1;
    counts.set(key, cur);
  }

  opp.forEach((row) => {
    (row.extraction.competitors_named || []).forEach((n) => bump(n));
  });

  (report.competitors || []).forEach((n) => {
    const name = typeof n === 'string' ? n : n.name;
    if (!name) return;
    const key = normalizeName(name);
    if (!counts.has(key)) counts.set(key, { name, mentions: 0, positions: [], citations: 0, user: true });
    else counts.get(key).user = true;
  });

  const ranked = [...counts.values()].sort((a, b) => b.mentions - a.mentions || (b.user ? 1 : 0) - (a.user ? 1 : 0));
  const kept = [
    ...ranked.filter((c) => c.user),
    ...ranked.filter((c) => !c.user),
  ]
    .filter((c, i, arr) => arr.findIndex((x) => x.name === c.name) === i)
    .slice(0, 5);

  const totalMentions = opp.reduce((s, r) => s + (r.extraction.competitors_named || []).filter((n) => !isExcludedEntity(n)).length + (r.extraction.target_mentioned ? 1 : 0), 0) || 1;

  const targetMentions = opp.filter((r) => r.extraction.target_mentioned).length;
  const target = {
    name: summary.canonical_name || report.business_name,
    mention_rate: Math.round((targetMentions / Math.max(1, opp.length)) * 100),
    avg_position: avg(opp.filter((r) => r.extraction.target_mentioned).map((r) => r.extraction.target_position)),
    share_of_voice: Math.round((targetMentions / totalMentions) * 100),
    est_score: null,
    citation_count: opp.filter((r) => r.mode === 'browsing' && r.extraction.target_cited).length,
    you: true,
  };

  const competitors = kept.map((c) => {
    const hits = opp.filter((r) => (r.extraction.competitors_named || []).some((n) => similar(n, c.name, 0.88)));
    const mention_rate = Math.round((hits.length / Math.max(1, opp.length)) * 100);
    return {
      name: c.name,
      mention_rate,
      avg_position: avg(hits.map((r, i) => i + 1)) || 2.5,
      share_of_voice: Math.round((hits.length / totalMentions) * 100),
      est_score: Math.round(mention_rate * 0.35 + 40 * 0.2 + readinessScore * 0.15),
      you: false,
    };
  });

  return { target, competitors: [target, ...competitors], totalMentions, opportunityRows: opp.length };
}

function avg(nums) {
  const n = nums.filter((x) => typeof x === 'number' && x > 0);
  if (!n.length) return null;
  return Number((n.reduce((s, x) => s + x, 0) / n.length).toFixed(1));
}

export function scoreReport({ rows, crawl, competitorAnalysis }) {
  const opp = rows.filter(opportunity);
  const noOpp = rows.filter((r) => r.extraction && r.extraction.answer_recommends_providers === false && !r.error).length;

  function modeRows(mode) {
    return opp.filter((r) => r.mode === mode);
  }

  function mentionRate(list) {
    if (!list.length) return 0;
    return list.filter((r) => r.extraction.target_mentioned).length / list.length;
  }

  const browse = modeRows('browsing');
  const knowledge = modeRows('knowledge');
  const mention_score =
    (mentionRate(browse) * (MODE_WEIGHT.browsing || 0.6) + mentionRate(knowledge) * (MODE_WEIGHT.knowledge || 0.4)) * 100;

  const prominence_score = opp.length
    ? opp.reduce((s, r) => s + posPoints(r.extraction.target_position, r.extraction.target_mentioned), 0) / opp.length
    : 0;

  const citation_score = browse.length
    ? (browse.filter((r) => r.extraction.target_cited).length / browse.length) * 100
    : 0;

  const mentioned = opp.filter((r) => r.extraction.target_mentioned);
  const sentiment_score = mentioned.length
    ? mentioned.reduce((s, r) => s + (SENTIMENT_POINTS[r.extraction.target_sentiment] ?? 0), 0) / mentioned.length
    : 0;

  const targetSov = competitorAnalysis.target.share_of_voice || 0;
  const topComp = Math.max(0, ...competitorAnalysis.competitors.filter((c) => !c.you).map((c) => c.share_of_voice || 0));
  const competitive_score = topComp ? Math.min(1, targetSov / topComp) * 100 : 100;

  const readiness_score = crawl.readability_score || 0;

  const overall = Math.round(
    WEIGHTS.mention * mention_score +
      WEIGHTS.prominence * prominence_score +
      WEIGHTS.citation * citation_score +
      WEIGHTS.sentiment * sentiment_score +
      WEIGHTS.competitive * competitive_score +
      WEIGHTS.readiness * readiness_score
  );

  function modeScore(list) {
    const m = mentionRate(list) * 100;
    const p = list.length
      ? list.reduce((s, r) => s + posPoints(r.extraction.target_position, r.extraction.target_mentioned), 0) / list.length
      : 0;
    const c = list[0]?.mode === 'browsing' ? citation_score : 0;
    const s = list.filter((r) => r.extraction.target_mentioned);
    const sent = s.length ? s.reduce((a, r) => a + (SENTIMENT_POINTS[r.extraction.target_sentiment] ?? 0), 0) / s.length : 0;
    return Math.round(
      WEIGHTS.mention * m +
        WEIGHTS.prominence * p +
        WEIGHTS.citation * c +
        WEIGHTS.sentiment * sent +
        WEIGHTS.competitive * competitive_score +
        WEIGHTS.readiness * readiness_score
    );
  }

  const cats = ['discovery', 'comparison', 'brand', 'informational', 'local', 'longtail'];
  const labels = {
    discovery: 'Discovery',
    comparison: 'Comparison',
    brand: 'Brand',
    informational: 'Informational',
    local: 'Local / near-me',
    longtail: 'Long-tail service',
  };

  const score_by_category = cats.map((cat) => {
    const list = opp.filter((r) => r.category === cat);
    const m = mentionRate(list) * 100;
    const p = list.length
      ? list.reduce((s, r) => s + posPoints(r.extraction.target_position, r.extraction.target_mentioned), 0) / list.length
      : 0;
    return { name: labels[cat], value: Math.round(0.64 * m + 0.36 * p) };
  });

  competitorAnalysis.target.est_score = overall;

  const mention_rate = Math.round(mentionRate(opp) * 100);
  return {
    overall_score: overall,
    score_band: bandOf(overall),
    readability_score: readiness_score,
    score_by_mode: [
      { name: 'ChatGPT (browsing)', value: modeScore(browse) },
      { name: 'ChatGPT (knowledge)', value: modeScore(knowledge) },
    ],
    score_by_category,
    metrics: {
      mention_rate,
      mention_label: `${opp.filter((r) => r.extraction.target_mentioned).length} of ${opp.length} queries`,
      avg_position: avg(mentioned.map((r) => r.extraction.target_position)),
      citations: browse.filter((r) => r.extraction.target_cited).length,
      sentiment: sentiment_score >= 80 ? 'Positive' : sentiment_score >= 40 ? 'Neutral' : mentioned.length ? 'Mixed' : '—',
      opportunity_count: opp.length,
      no_opportunity_count: noOpp,
      weights: [
        { name: 'Mention rate', weight: '35%', score: Math.round(mention_score) },
        { name: 'Prominence', weight: '20%', score: Math.round(prominence_score) },
        { name: 'AI-readiness', weight: '15%', score: Math.round(readiness_score) },
        { name: 'Citation rate', weight: '10%', score: Math.round(citation_score) },
        { name: 'Sentiment', weight: '10%', score: Math.round(sentiment_score) },
        { name: 'Competitive position', weight: '10%', score: Math.round(competitive_score) },
      ],
    },
    components: { mention_score, prominence_score, citation_score, sentiment_score, competitive_score, readiness_score },
  };
}

export { opportunity };
