// Imported eagerly (not via dynamic import()) so `waitUntil` is registered
// synchronously, before the caller sends its HTTP response. A dynamic
// import() here would resolve on a later microtask/tick — by the time it
// runs, Vercel may already be tearing down the invocation because the
// response was already flushed, so the background pipeline job never
// actually gets registered with waitUntil and can be killed mid-run.
let waitUntilFn = null;
if (process.env.VERCEL) {
  try {
    // eslint-disable-next-line global-require
    ({ waitUntil: waitUntilFn } = await import('@vercel/functions'));
  } catch {
    waitUntilFn = null;
  }
}

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
  if (typeof waitUntilFn === 'function') waitUntilFn(promise);
  return promise;
}
