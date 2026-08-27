export function pipelineSliceMs() {
  const fromEnv = Number(process.env.PIPELINE_SLICE_MS);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  return process.env.VERCEL ? 45_000 : 8 * 60_000;
}

export function createDeadline(ms = pipelineSliceMs()) {
  const end = Date.now() + ms;
  return {
    remaining() {
      return end - Date.now();
    },
    hit(reserveMs = 0) {
      return Date.now() + reserveMs >= end;
    },
  };
}

export class SliceYield extends Error {
  constructor(rows = null) {
    super('pipeline slice yielded');
    this.name = 'SliceYield';
    this.yield = true;
    this.rows = rows;
  }
}

export function keepAlive(promise) {
  promise.catch((err) => {
    if (err?.yield) return;
    console.error('pipeline', err);
  });
  if (!process.env.VERCEL) return promise;
  import('@vercel/functions')
    .then((mod) => {
      if (typeof mod.waitUntil === 'function') mod.waitUntil(promise);
    })
    .catch(() => {});
  return promise;
}
