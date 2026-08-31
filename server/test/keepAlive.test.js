import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeadline, pipelineSliceMs, SliceYield } from '../src/lib/keepAlive.js';

function withEnv(vars, fn) {
  const saved = {};
  for (const [k, v] of Object.entries(vars)) {
    saved[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test('the slice is short on Vercel and long locally', () => {
  withEnv({ VERCEL: '1', PIPELINE_SLICE_MS: undefined }, () => {
    assert.equal(pipelineSliceMs(), 45_000, 'must stay under the 60s function maxDuration');
  });
  withEnv({ VERCEL: undefined, PIPELINE_SLICE_MS: undefined }, () => {
    assert.equal(pipelineSliceMs(), 8 * 60_000);
  });
});

test('PIPELINE_SLICE_MS overrides both, and junk values are ignored', () => {
  withEnv({ VERCEL: '1', PIPELINE_SLICE_MS: '20000' }, () => assert.equal(pipelineSliceMs(), 20_000));
  withEnv({ VERCEL: '1', PIPELINE_SLICE_MS: 'nope' }, () => assert.equal(pipelineSliceMs(), 45_000));
  withEnv({ VERCEL: '1', PIPELINE_SLICE_MS: '0' }, () => assert.equal(pipelineSliceMs(), 45_000));
});

test('createDeadline reports the time left and honours a reserve', () => {
  const d = createDeadline(10_000);
  assert.ok(d.remaining() > 9_000 && d.remaining() <= 10_000);
  assert.equal(d.hit(0), false);
  assert.equal(d.hit(9_000), false);
  assert.equal(d.hit(11_000), true, 'a reserve larger than the remaining time trips it');
});

test('an already-expired deadline is hit immediately', () => {
  const d = createDeadline(-1);
  assert.equal(d.hit(0), true);
  assert.ok(d.remaining() <= 0);
});

test('SliceYield carries the partial rows and is distinguishable from a real error', () => {
  const rows = [{ text: 'a' }];
  const e = new SliceYield(rows);
  assert.ok(e instanceof Error);
  assert.equal(e.name, 'SliceYield');
  assert.equal(e.yield, true);
  assert.equal(e.rows, rows);
  assert.equal(new SliceYield().rows, null);
});
