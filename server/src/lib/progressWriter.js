/**
 * Coalescing writer for pipeline progress.
 *
 * `mark()` is synchronous and never blocks its caller, so a worker that has just
 * finished an OpenAI call can report progress and immediately pick up the next
 * query instead of holding a concurrency slot open for a database round trip.
 * Writes are throttled by elapsed time and never overlap: while one is in
 * flight, later marks collapse into a single follow-up write.
 */
export function createProgressWriter({
  write,
  intervalMs = 2500,
  now = () => Date.now(),
  setTimer = (fn, ms) => setTimeout(fn, ms).unref?.(),
} = {}) {
  let latest = null;
  let inFlight = null;
  let lastAt = -Infinity;
  let pending = false;
  let armed = false;

  async function drain() {
    while (pending) {
      pending = false;
      const payload = latest;
      lastAt = now();
      try {
        await write(payload);
      } catch (err) {
        console.warn('progress write', err?.message || err);
      }
    }
    inFlight = null;
  }

  function kick() {
    if (!inFlight) inFlight = drain();
    return inFlight;
  }

  return {
    mark(payload) {
      latest = payload;
      pending = true;
      if (inFlight) return;
      const wait = intervalMs - (now() - lastAt);
      if (wait <= 0) {
        kick();
        return;
      }
      if (armed) return;
      armed = true;
      setTimer(() => {
        armed = false;
        if (pending) kick();
      }, wait);
    },
    /** Force the newest payload out and wait for it — used at stage boundaries. */
    async flush(payload) {
      if (payload !== undefined) latest = payload;
      if (latest === null) return;
      pending = true;
      await kick();
    },
    async settle() {
      await inFlight;
    },
  };
}
