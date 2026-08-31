import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyFuzzy,
  buildRows,
  cantBrowse,
  changedRows,
  emptyExtraction,
  isRetryableTestError,
  modesFor,
  normalizeIndex,
  pendingRows,
  progressCounts,
  queriesFromRows,
  rowKey,
  testsFinished,
  toDbRow,
} from '../src/lib/visibilityRows.js';

const SUMMARY = { canonical_name: 'MakeFlow', name_variants: ['Make Flow'] };
const Q = [
  { text: 'best plumber in Sydney', category: 'commercial', topic: 'plumbing', intent: 'hire' },
  { text: 'emergency plumber near me', category: 'commercial', topic: 'plumbing', intent: 'hire' },
];

test('modesFor defaults to both modes and honours explicit opt-outs', () => {
  assert.deepEqual(modesFor({}), ['browsing', 'knowledge']);
  assert.deepEqual(modesFor({ modes: { browsing: false } }), ['knowledge']);
  assert.deepEqual(modesFor({ modes: { knowledge: false } }), ['browsing']);
  assert.deepEqual(modesFor({ modes: { browsing: false, knowledge: false } }), []);
});

test('buildRows produces one row per query per mode', () => {
  const rows = buildRows(Q, {});
  assert.equal(rows.length, 4);
  assert.deepEqual(
    rows.map((r) => r.mode),
    ['browsing', 'knowledge', 'browsing', 'knowledge']
  );
  assert.equal(rows[0].raw_answer, '');
  assert.equal(rows[0].extraction, null);
});

test('buildRows carries answered rows across a slice resume', () => {
  const existing = [
    { text: Q[0].text, mode: 'browsing', raw_answer: 'MakeFlow is great', citations: ['https://a'], extraction: null },
  ];
  const rows = buildRows(Q, {}, existing);
  assert.equal(rows.length, 4);
  assert.equal(rows[0].raw_answer, 'MakeFlow is great');
  assert.equal(rows[0].category, 'commercial', 'metadata is backfilled from the query');
  assert.equal(rows[1].raw_answer, '', 'the unanswered mode is still empty');
});

test('buildRows ignores stored rows that have no mode', () => {
  const seeded = [{ text: Q[0].text, mode: '', raw_answer: 'stale' }];
  const rows = buildRows(Q, {}, seeded);
  assert.equal(rows.every((r) => r.raw_answer === ''), true);
});

test('pendingRows retries transient failures but not permanent ones', () => {
  const rows = [
    { text: 'a', mode: 'browsing', raw_answer: 'done' },
    { text: 'b', mode: 'browsing', raw_answer: '', error: null },
    { text: 'c', mode: 'browsing', raw_answer: '', error: 'OpenAI 429' },
    { text: 'd', mode: 'browsing', raw_answer: '', error: 'The operation was aborted' },
    { text: 'e', mode: 'browsing', raw_answer: '', error: 'truncated_cost' },
  ];
  assert.deepEqual(pendingRows(rows).map((r) => r.text), ['b', 'c', 'd']);
});

test('isRetryableTestError classifies the errors the pipeline actually raises', () => {
  for (const m of ['OpenAI 429', 'OpenAI 503', 'fetch failed', 'ETIMEDOUT', 'The operation timed out', 'aborted']) {
    assert.equal(isRetryableTestError(m), true, m);
  }
  for (const m of ['truncated_cost', 'OPENAI_API_KEY is missing', '', null]) {
    assert.equal(isRetryableTestError(m), false, String(m));
  }
});

test('testsFinished needs every row to be answered, failed or attempted', () => {
  assert.equal(testsFinished([]), false);
  assert.equal(testsFinished(null), false);
  assert.equal(testsFinished([{ raw_answer: 'x' }, { raw_answer: '' }]), false);
  assert.equal(testsFinished([{ raw_answer: 'x' }, { error: 'boom' }, { attempted: true }]), true);
});

test('progressCounts reports what the client renders as "n/total"', () => {
  const rows = [{ raw_answer: 'x' }, { error: 'boom' }, { raw_answer: '', error: null }];
  assert.deepEqual(progressCounts(rows), { tests_done: 2, tests_total: 3 });
  assert.deepEqual(progressCounts(null), { tests_done: 0, tests_total: 0 });
});

test('queriesFromRows dedupes by text and keeps metadata', () => {
  const out = queriesFromRows([
    { text: 'a', category: 'c', topic: 't', intent: 'i', mode: 'browsing' },
    { text: 'a', category: 'c', topic: 't', intent: 'i', mode: 'knowledge' },
    { text: '', mode: 'browsing' },
    { text: 'b', category: 'd' },
  ]);
  assert.deepEqual(out.map((q) => q.text), ['a', 'b']);
  assert.equal(out[0].topic, 't');
});

test('normalizeIndex counts how many businesses are named before the target', () => {
  assert.equal(normalizeIndex('MakeFlow', 'MakeFlow is the pick.'), 1);
  assert.equal(normalizeIndex('MakeFlow', 'Acme Corp, then Beta Works, then MakeFlow.'), 3);
  assert.equal(normalizeIndex('MakeFlow', 'nobody here'), null);
});

test('cantBrowse spots the refusal boilerplate', () => {
  assert.equal(cantBrowse("I can't browse the web right now."), true);
  assert.equal(cantBrowse("I don't have access to the internet."), true);
  assert.equal(cantBrowse('Here are three plumbers in Sydney.'), false);
  assert.equal(cantBrowse(undefined), false);
});

test('applyFuzzy promotes a missed mention and records the position', () => {
  const row = {
    mode: 'browsing',
    raw_answer: 'Acme Corp is solid, and Make Flow is another option.',
    extraction: emptyExtraction(),
  };
  applyFuzzy(row, SUMMARY, 'https://makeflow.com.au');
  assert.equal(row.extraction.target_mentioned, true);
  assert.equal(row.extraction.matched_by, 'fuzzy');
});

test('applyFuzzy does not overwrite a mention the model already found', () => {
  const row = {
    mode: 'browsing',
    raw_answer: 'MakeFlow first.',
    extraction: emptyExtraction({ target_mentioned: true, target_position: 1, matched_by: 'model' }),
  };
  applyFuzzy(row, SUMMARY, 'https://makeflow.com.au');
  assert.equal(row.extraction.matched_by, 'model');
  assert.equal(row.extraction.target_position, 1);
});

test('applyFuzzy clears the recommendation flag when knowledge mode refuses', () => {
  const row = {
    mode: 'knowledge',
    raw_answer: "I can't browse the web, so I have no current list.",
    extraction: emptyExtraction({ answer_recommends_providers: true }),
  };
  applyFuzzy(row, SUMMARY, 'https://makeflow.com.au');
  assert.equal(row.extraction.answer_recommends_providers, false);
});

test('rowKey matches the (mode, text) identity the unique index uses', () => {
  assert.equal(rowKey({ mode: 'browsing', text: 'a' }), 'browsing::a');
  assert.equal(rowKey({ text: 'a' }), '::a', 'a query-seed row keys on empty mode, never null');
});

test('toDbRow never writes a null mode and clamps the answer', () => {
  const db = toDbRow('rep-1', { text: 'a', raw_answer: 'x'.repeat(9000) });
  assert.equal(db.mode, '');
  assert.equal(db.report_id, 'rep-1');
  assert.equal(db.raw_answer.length, 8000);
  assert.deepEqual(db.citations, []);
  assert.equal(db.extraction, null);
});

test('changedRows only re-sends rows whose stored shape moved', () => {
  const rows = buildRows(Q, {});
  const first = changedRows('rep-1', rows, new Map());
  assert.equal(first.rows.length, 4);

  const second = changedRows('rep-1', rows, first.sent);
  assert.equal(second.rows.length, 0, 'an unchanged set costs no write');

  rows[2].raw_answer = 'MakeFlow is great';
  const third = changedRows('rep-1', rows, second.sent);
  assert.equal(third.rows.length, 1);
  assert.equal(third.rows[0].text, Q[1].text);
  assert.equal(third.rows[0].mode, 'browsing');
});

test('changedRows skips rows with no text', () => {
  const { rows } = changedRows('rep-1', [{ mode: 'browsing' }, { text: 'a', mode: 'browsing' }], new Map());
  assert.equal(rows.length, 1);
});
