import { CATEGORY_WEIGHT } from '../config/weights.js';
import { opportunity } from './score.js';

export function buildGapList(rows) {
  const gaps = [];
  for (const row of rows) {
    if (!opportunity(row)) continue;
    if (row.extraction?.target_mentioned) continue;
    const cw = CATEGORY_WEIGHT[row.category] || 1;
    const comps = row.extraction.competitors_named || [];
    const value = cw * (1 + 0.5 * comps.length) * (row.mode === 'browsing' ? 1.2 : 1);
    gaps.push({
      category: row.category,
      question: row.text,
      named_instead: comps.slice(0, 4),
      mode: row.mode,
      excerpt: String(row.raw_answer || '').replace(/\s+/g, ' ').trim().slice(0, 160),
      value,
    });
  }
  gaps.sort((a, b) => b.value - a.value);
  return gaps;
}
