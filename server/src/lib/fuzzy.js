import { ratio, token_set_ratio } from 'fuzzball';

export function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\b(pty ltd|pty\. ltd\.|pty|ltd|limited|the|and|&)\b/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function similar(a, b, threshold = 0.85) {
  const x = normalizeName(a);
  const y = normalizeName(b);
  if (!x || !y) return false;
  if (x === y) return true;
  return ratio(x, y) / 100 >= threshold;
}

export function mentionedInText(name, variants, domain, text, threshold = 0.88) {
  const hay = String(text || '');
  const hayNorm = normalizeName(hay);
  const names = [name, ...(variants || [])].filter(Boolean);
  for (const n of names) {
    const nn = normalizeName(n);
    if (nn && hayNorm.includes(nn)) return { mentioned: true, matched_by: 'exact' };
    if (nn && token_set_ratio(nn, hayNorm) / 100 >= threshold) return { mentioned: true, matched_by: 'fuzzy' };
  }
  if (domain) {
    const stem = String(domain).split('.')[0];
    if (stem.length > 3 && new RegExp(`\\b${stem}\\b`, 'i').test(hay)) {
      return { mentioned: true, matched_by: 'domain' };
    }
  }
  return { mentioned: false, matched_by: null };
}

export function levenshteinRatio(a, b) {
  return ratio(normalizeName(a), normalizeName(b)) / 100;
}
