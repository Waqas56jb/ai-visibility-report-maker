const buckets = new Map();
let lastSweep = Date.now();

function sweep(now) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, times] of buckets) {
    const fresh = times.filter((t) => now - t < 15 * 60 * 1000);
    if (!fresh.length) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}

export function hitWindow(key, windowMs, max) {
  const now = Date.now();
  sweep(now);
  const times = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (times.length >= max) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((times[0] + windowMs - now) / 1000)),
    };
  }
  times.push(now);
  buckets.set(key, times);
  return { ok: true };
}

export function apiRateLimit(req, res, next) {
  const url = req.originalUrl || req.url || '';
  if (req.method === 'GET' && (/\/api\/health(?:\?|$)/.test(url) || /\/api\/public\/site(?:\?|$)/.test(url))) {
    return next();
  }
  const ip = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim() || req.ip || 'unknown';
  const hit = hitWindow(`api:${ip}`, 60 * 1000, 80);
  if (!hit.ok) {
    res.set('Retry-After', String(hit.retryAfterSec));
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment and try again.',
      retryAfterSec: hit.retryAfterSec,
    });
  }
  next();
}
