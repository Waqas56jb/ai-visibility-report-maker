export function stripWww(host) {
  return String(host || '').toLowerCase().replace(/^www\./, '');
}

export function normalizeUrl(raw, { keepWww = true } = {}) {
  let input = String(raw || '').trim();
  if (!input) return '';
  if (!/^https?:\/\//i.test(input)) input = `https://${input}`;
  let u;
  try {
    u = new URL(input);
  } catch {
    return '';
  }
  u.hash = '';
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach((k) =>
    u.searchParams.delete(k)
  );
  u.hostname = u.hostname.toLowerCase();
  if (!keepWww) u.hostname = stripWww(u.hostname);
  let href = u.toString();
  if (href.endsWith('/') && u.pathname === '/') href = href.slice(0, -1);
  else href = href.replace(/\/+$/, '');
  return href;
}

export function domainOf(raw) {
  try {
    return stripWww(new URL(normalizeUrl(raw)).hostname);
  } catch {
    return '';
  }
}

export function originOf(raw) {
  try {
    const u = new URL(normalizeUrl(raw));
    return `${u.protocol}//${u.host}`;
  } catch {
    return '';
  }
}
