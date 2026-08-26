export const EXCLUDED_NAMES = [
  'google',
  'yelp',
  'yellow pages',
  'yellowpages',
  'truelocal',
  'facebook',
  'wikipedia',
  'hipages',
  'oneflare',
  'productreview',
  'product review',
  'linkedin',
  'chatgpt',
  'openai',
];

const EXCLUDED_RE = /directory|listing|review site|gov\.au|wikipedia|yellow.?pages/i;

export function isExcludedEntity(name) {
  const n = String(name || '').toLowerCase().trim();
  if (!n) return true;
  if (EXCLUDED_NAMES.some((x) => n === x || n.includes(x))) return true;
  return EXCLUDED_RE.test(n);
}
