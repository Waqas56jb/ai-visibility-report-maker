export const WEIGHTS = {
  mention: 0.35,
  prominence: 0.2,
  citation: 0.1,
  sentiment: 0.1,
  competitive: 0.1,
  readiness: 0.15,
};

export const MODE_WEIGHT = { browsing: 0.6, knowledge: 0.4 };

export const POSITION_POINTS = { 1: 100, 2: 80, 3: 60, 4: 40 };

export const SENTIMENT_POINTS = { positive: 100, neutral: 60, negative: 0, not_mentioned: 0 };

export const BANDS = [
  [20, 'Invisible'],
  [40, 'Barely visible'],
  [60, 'Getting there'],
  [80, 'Visible'],
  [100, 'Leading'],
];

export const CATEGORY_WEIGHT = {
  discovery: 3,
  comparison: 3,
  local: 2,
  longtail: 2,
  informational: 1,
  brand: 2,
};

export const QUERY_DISTRIBUTION = {
  discovery: 10,
  comparison: 6,
  brand: 6,
  informational: 6,
  local: 7,
  longtail: 7,
};

export function bandOf(score) {
  const n = Number(score) || 0;
  for (const [max, label] of BANDS) {
    if (n <= max) return label;
  }
  return 'Leading';
}

export const STAGES = [
  'crawling',
  'generating_queries',
  'testing',
  'scoring',
  'writing_recommendations',
  'generating_pdf',
];
