import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgressWriter } from '../src/lib/progressWriter.js';

/** Hand-driven clock plus a timer queue, so throttling is tested without waiting. */
function harness({ writeImpl } = {}) {
  let clock = 0;
  const timers = [];
  const writes = [];
  const writer = createProgressWriter({
    intervalMs: 1000,
    now: () => clock,
    setTimer: (fn, ms) => timers.push({ at: clock + ms, fn }),
    write: async (payload) => {
      writes.push(payload);
      if (writeImpl) await writeImpl(payload);
    },
  });
  return {
    writer,
    writes,
    advance(ms) {
      clock += ms;
      const due = timers.filter((t) => t.at <= clock);
      timers.length = 0;
      due.forEach((t) => t.fn());
    },
    pendingTimers: () => timers.length,
  };
}

test('mark returns synchronously and does not await the write', async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const h = harness({ writeImpl: () => gate });

  h.writer.mark(['a']);
  assert.deepEqual(h.writes, [['a']], 'the first mark writes immediately');

  h.writer.mark(['a', 'b']);
  h.writer.mark(['a', 'b', 'c']);
  assert.equal(h.writes.length, 1, 'marks during an in-flight write never block or stack');

  release();
  await h.writer.settle();
  assert.equal(h.writes.length, 2, 'the queued marks collapse into one follow-up write');
  assert.deepEqual(h.writes[1], ['a', 'b', 'c'], 'and that write carries the newest payload');
});

test('writes are throttled by elapsed time, not by call count', async () => {
  const h = harness();
  h.writer.mark([1]);
  await h.writer.settle();
  assert.equal(h.writes.length, 1);

  h.writer.mark([2]);
  h.writer.mark([3]);
  await h.writer.settle();
  assert.equal(h.writes.length, 1, 'still inside the interval');

  h.advance(1000);
  await h.writer.settle();
  assert.equal(h.writes.length, 2);
  assert.deepEqual(h.writes[1], [3]);
});

test('a throttled mark is not dropped — a trailing timer flushes it', async () => {
  const h = harness();
  h.writer.mark([1]);
  await h.writer.settle();

  h.writer.mark([2]);
  assert.equal(h.pendingTimers(), 1, 'the deferred write is armed');
  h.advance(1000);
  await h.writer.settle();
  assert.deepEqual(h.writes.at(-1), [2]);
});

test('flush forces a write through the throttle and awaits it', async () => {
  const h = harness();
  h.writer.mark([1]);
  await h.writer.settle();

  await h.writer.flush([1, 2]);
  assert.equal(h.writes.length, 2);
  assert.deepEqual(h.writes[1], [1, 2]);
});

test('flush with no payload re-sends the latest mark', async () => {
  const h = harness();
  h.writer.mark(['only']);
  await h.writer.flush();
  assert.deepEqual(h.writes.at(-1), ['only']);
});

test('flush is a no-op when nothing was ever marked', async () => {
  const h = harness();
  await h.writer.flush();
  assert.equal(h.writes.length, 0);
});

test('a failing write is swallowed and does not wedge later writes', async () => {
  let fail = true;
  const h = harness({
    writeImpl: () => {
      if (fail) throw new Error('supabase down');
      return undefined;
    },
  });

  await h.writer.flush(['a']);
  fail = false;
  h.advance(1000);
  await h.writer.flush(['b']);
  assert.deepEqual(h.writes, [['a'], ['b']]);
});
