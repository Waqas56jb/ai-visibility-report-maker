const cache = new Map();
const TTL = 24 * 60 * 60 * 1000;

export function getCrawlCache(domain) {
  const row = cache.get(domain);
  if (!row) return null;
  if (Date.now() - row.at > TTL) {
    cache.delete(domain);
    return null;
  }
  return row.data;
}

export function setCrawlCache(domain, data) {
  cache.set(domain, { at: Date.now(), data });
}
