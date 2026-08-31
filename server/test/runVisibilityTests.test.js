import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

/** Stub the OpenAI service before the module under test resolves it. */
const calls = [];
let answerImpl = async () => ({ raw_answer: 'MakeFlow is a good option.', citations: [], latency_ms: 5 });

mock.module('../src/services/openai.js', {
  exports: {
    answerAsChatGPT: async (args) => {
      calls.push(args);
      return answerImpl(args);
    },
    completeJson: async () => ({
      data: {
        items: [0, 1, 2, 3, 4, 5].map((index) => ({
          index,
          named_entities: ['MakeFlow'],
          target_mentioned: true,
          target_position: 1,
          target_cited: false,
          target_sentiment: 'positive',
          target_description: null,
          competitors_named: [],
          answer_recommends_providers: true,
        })),
      },
    }),
  },
});

const { runVisibilityTests } = await import('../src/lib/runVisibilityTests.js');
const { SliceYield } = await import('../src/lib/keepAlive.js');

const REPORT = { website: 'https://makeflow.com.au', city_region: 'Sydney, NSW' };
const SUMMARY = { canonical_name: 'MakeFlow', name_variants: [], service_area: { city: 'Sydney' } };
const QUERIES = Array.from({ length: 6 }, (_, i) => ({
  text: `query ${i}`,
  category: 'commercial',
  topic: 't',
  intent: 'hire',
}));

function usageStub() {
  return { wouldExceed: () => false, truncated: false, record() {}, entries: [] };
}

test.beforeEach(() => {
  calls.length = 0;
  answerImpl = async () => ({ raw_answer: 'MakeFlow is a good option.', citations: [], latency_ms: 5 });
});

test('runs every query in both modes and returns finished rows', async () => {
  const rows = await runVisibilityTests(REPORT, SUMMARY, QUERIES, usageStub(), {});
  assert.equal(rows.length, 12);
  assert.equal(calls.length, 12);
  assert.equal(rows.every((r) => r.raw_answer), true);
  assert.equal(rows.every((r) => r.extraction?.target_mentioned), true);
  assert.equal(new Set(calls.map((c) => c.mode)).size, 2);
});

test('progress is reported without blocking a worker, and flushed at each phase', async () => {
  const marks = [];
  const flushes = [];
  let inFlight = 0;
  let maxInFlight = 0;

  answerImpl = async () => {
    inFlight += 1;
    maxInFlight = Math.max(maxInFlight, inFlight);
    await new Promise((r) => setTimeout(r, 5));
    inFlight -= 1;
    return { raw_answer: 'MakeFlow is a good option.', citations: [], latency_ms: 5 };
  };

  await runVisibilityTests(REPORT, SUMMARY, QUERIES, usageStub(), {
    onProgress: (rows) => marks.push(rows.filter((r) => r.raw_answer).length),
    flushProgress: async (rows) => flushes.push(rows.filter((r) => r.raw_answer).length),
  });

  assert.equal(marks.length, 12 + 2, 'one mark per answer plus one per extraction batch');
  assert.equal(flushes.length, 2, 'flushed after the answer phase and after extraction');
  assert.equal(flushes.at(-1), 12);
  assert.ok(maxInFlight > 1, `answers ran concurrently (peak ${maxInFlight})`);
});

test('an expired slice yields with the answers so far instead of losing them', async () => {
  answerImpl = async () => {
    await new Promise((r) => setTimeout(r, 5));
    return { raw_answer: 'MakeFlow is a good option.', citations: [], latency_ms: 5 };
  };
  let remaining = 20000;
  const deadline = { remaining: () => (remaining -= 4000), hit: () => remaining <= 0 };

  const err = await runVisibilityTests(REPORT, SUMMARY, QUERIES, usageStub(), { deadline }).then(
    () => null,
    (e) => e
  );

  assert.ok(err instanceof SliceYield, 'the slice yields rather than failing the report');
  assert.ok(err.rows.length === 12);
  const answered = err.rows.filter((r) => r.raw_answer).length;
  assert.ok(answered > 0 && answered < 12, `partial work is preserved (${answered}/12)`);
  assert.ok(calls.length < 12, 'no call is issued once the budget is gone');
});

test('the remaining slice time is passed down as each call budget', async () => {
  const deadline = { remaining: () => 9000, hit: () => false };
  await runVisibilityTests(REPORT, SUMMARY, QUERIES, usageStub(), { deadline });
  assert.equal(calls.every((c) => c.budgetMs === 6500), true, 'budget = remaining minus the save reserve');
});

test('a resumed slice only pays for the queries that are still unanswered', async () => {
  const existing = QUERIES.map((q) => ({
    text: q.text,
    mode: 'browsing',
    raw_answer: 'already done',
    citations: [],
    extraction: { target_mentioned: true },
    error: null,
  }));

  const rows = await runVisibilityTests({ ...REPORT, _existingRows: existing }, SUMMARY, QUERIES, usageStub(), {});
  assert.equal(rows.length, 12);
  assert.equal(calls.length, 6, 'only the knowledge-mode half is re-asked');
  assert.equal(calls.every((c) => c.mode === 'knowledge'), true);
});

test('a transient failure is retried on the next slice, a hard failure is not', async () => {
  const existing = [
    { text: QUERIES[0].text, mode: 'browsing', raw_answer: '', error: 'OpenAI 429' },
    { text: QUERIES[1].text, mode: 'browsing', raw_answer: '', error: 'truncated_cost' },
  ];
  await runVisibilityTests({ ...REPORT, _existingRows: existing }, SUMMARY, QUERIES.slice(0, 2), usageStub(), {});
  const asked = calls.map((c) => `${c.mode}:${c.query}`).sort();
  assert.deepEqual(asked, ['browsing:query 0', 'knowledge:query 0', 'knowledge:query 1']);
});

test('a failing answer marks its row and never breaks the run', async () => {
  answerImpl = async () => {
    throw new Error('OpenAI 500');
  };
  const rows = await runVisibilityTests(REPORT, SUMMARY, QUERIES.slice(0, 2), usageStub(), {}).catch((e) => e);
  assert.ok(rows instanceof SliceYield === false, 'every row was attempted, so the slice completes');
  assert.equal(rows.length, 4);
  assert.equal(rows.every((r) => r.error === 'OpenAI 500'), true);
});

test('the cost ceiling stops further calls and marks the rest truncated', async () => {
  const usage = { ...usageStub(), wouldExceed: () => true };
  const rows = await runVisibilityTests(REPORT, SUMMARY, QUERIES, usage, {});
  assert.equal(calls.length, 0);
  assert.equal(rows.every((r) => r.error === 'truncated_cost'), true);
});

/* Regression: p-queue does not settle the promises of tasks removed by `clear()`,
   so calling it from inside a running task strands the enclosing `addAll` forever.
   On Vercel that means the slice never checkpoints — it just runs until the
   platform kills the function, and every answer computed in it is lost. */
test('a budget that expires mid-run settles instead of hanging the queue', async () => {
  answerImpl = async () => {
    await new Promise((r) => setTimeout(r, 1));
    return { raw_answer: 'MakeFlow is a good option.', citations: [], latency_ms: 1 };
  };
  const many = Array.from({ length: 40 }, (_, i) => ({
    text: `wide ${i}`,
    category: 'commercial',
    topic: 't',
    intent: 'hire',
  }));
  // 80 rows. The budget is tied to progress rather than the clock so the tail of
  // the queue is deterministically still unstarted at the moment it runs out.
  const deadline = {
    remaining: () => (calls.length >= 12 ? 2500 + 100 : 2500 + 60_000),
    hit: () => false,
  };

  const settled = await Promise.race([
    runVisibilityTests(REPORT, SUMMARY, many, usageStub(), { deadline }).then(
      () => 'settled',
      (err) => (err instanceof SliceYield ? 'settled' : `threw ${err.message}`)
    ),
    new Promise((r) => setTimeout(() => r('HUNG'), 3000)),
  ]);

  assert.equal(settled, 'settled', 'runVisibilityTests must always settle so the slice can checkpoint');
  assert.ok(calls.length >= 12, 'work was dispatched before the budget ran out');
  assert.ok(calls.length < 80, 'and the rest was left pending for the next slice');
});
