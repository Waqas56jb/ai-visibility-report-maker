/** Shared field validation used by every auth page. */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function passwordRules(password) {
  return {
    length: (password || '').length >= 8,
    number: /\d/.test(password || ''),
    upper: /[A-Z]/.test(password || ''),
    symbol: /[^A-Za-z0-9]/.test(password || ''),
  };
}

export function passwordScore(password) {
  const rules = passwordRules(password);
  return Object.values(rules).filter(Boolean).length;
}

export function passwordValid(password) {
  return passwordScore(password) === 4;
}

export function strengthLabel(score) {
  if (score <= 1) return 'Weak';
  if (score === 2) return 'Fair';
  if (score === 3) return 'Good';
  return 'Strong';
}
