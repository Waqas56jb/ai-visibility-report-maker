import test from 'node:test';
import assert from 'node:assert/strict';
import {
  answerTimeoutMs,
  extractResponseText,
  fill,
  isTimeout,
  loadPrompt,
  retryable,
  UsageTracker,
} from '../src/services/openai.js';

test('answerTimeoutMs falls back to the normal per-mode timeout', () => {
  assert.equal(answerTimeoutMs(true, undefined), 22000);
  assert.equal(answerTimeoutMs(false, undefined), 18000);
  assert.equal(answerTimeoutMs(true, Infinity), 22000);
});

test('answerTimeoutMs clamps to the time left in the slice', () => {
  assert.equal(answerTimeoutMs(true, 9000), 9000, 'a short budget wins over the normal timeout');
  assert.equal(answerTimeoutMs(true, 40000), 22000, 'a long budget never extends it');
  assert.equal(answerTimeoutMs(false, 12345.9), 12345, 'timeouts stay whole milliseconds');
});

test('answerTimeoutMs never returns a timeout too small to be worth issuing', () => {
  assert.equal(answerTimeoutMs(true, 500), 3000);
  assert.equal(answerTimeoutMs(true, -5000), 3000);
});

test('isTimeout recognises the abort a slice boundary produces', () => {
  assert.equal(isTimeout({ name: 'TimeoutError', message: 'The operation was aborted due to timeout' }), true);
  assert.equal(isTimeout({ name: 'AbortError', message: 'aborted' }), true);
  assert.equal(isTimeout({ name: 'Error', message: 'OpenAI 500' }), false);
  assert.equal(isTimeout(null), false);
});

test('retryable retries throttling and server faults but never a slice timeout', () => {
  assert.equal(retryable(429, new Error('too many requests')), true);
  assert.equal(retryable(503, new Error('bad gateway')), true);
  assert.equal(retryable(400, new Error('bad request')), false);
  assert.equal(retryable(undefined, new Error('fetch failed')), true);
  assert.equal(retryable(undefined, new Error('schema-parse failure')), true);
  assert.equal(
    retryable(undefined, { name: 'TimeoutError', message: 'The operation was aborted due to timeout' }),
    false,
    'retrying inside an expired slice would only overrun the function'
  );
});

test('fill substitutes vars, applies fallbacks and JSON-encodes objects', () => {
  assert.equal(fill('Hi {{ name }}', { name: 'Ada' }), 'Hi Ada');
  assert.equal(fill('Hi {{ name | "there" }}', {}), 'Hi there');
  assert.equal(fill('Hi {{ name | "there" }}', { name: '' }), 'Hi there');
  assert.equal(fill('{{ missing }}', {}), '');
  assert.equal(fill('{{ list }}', { list: ['a', 'b'] }), '["a","b"]');
});

test('loadPrompt splits the system and user halves of a prompt file', () => {
  const p = loadPrompt('mention_extraction');
  assert.equal(p.version, 'mention_extraction.v1');
  assert.ok(p.system.length > 0);
  assert.ok(p.user.includes('{{'), 'the user half keeps its template holes');
});

test('extractResponseText joins output chunks and dedupes citations', () => {
  const out = extractResponseText({
    output: [
      {
        content: [
          { type: 'output_text', text: 'First line', annotations: [{ url: 'https://a.com' }, { url: 'https://a.com' }] },
          { type: 'output_text', text: 'Second line', annotations: [{ url: 'https://b.com' }, { type: 'x' }] },
        ],
      },
    ],
  });
  assert.equal(out.text, 'First line\nSecond line');
  assert.deepEqual(out.citations, ['https://a.com', 'https://b.com']);
});

test('extractResponseText falls back to output_text and tolerates an empty response', () => {
  assert.deepEqual(extractResponseText({ output_text: 'plain' }), { text: 'plain', citations: [] });
  assert.deepEqual(extractResponseText({}), { text: '', citations: [] });
});

test('UsageTracker accumulates cost and trips the budget guard', () => {
  const u = new UsageTracker();
  u.maxCost = 0.1;
  u.maxCalls = 3;
  assert.equal(u.cost, 0);
  assert.equal(u.truncated, false);

  u.record({ stage: 'answer_browsing', model: 'gpt-4o-mini', prompt_tokens: 1000, completion_tokens: 1000 });
  assert.equal(u.entries.length, 1);
  assert.ok(u.cost > 0);
  assert.equal(u.truncated, false);

  u.record({ stage: 'answer_browsing', model: 'gpt-4o', prompt_tokens: 20000, completion_tokens: 10000 });
  assert.ok(u.cost >= 0.1);
  assert.equal(u.truncated, true, 'cost ceiling reached');
});

test('UsageTracker also stops on the call ceiling', () => {
  const u = new UsageTracker();
  u.maxCost = 1000;
  u.maxCalls = 2;
  u.record({ stage: 's', model: 'gpt-4o-mini' });
  assert.equal(u.wouldExceed(0), false);
  u.record({ stage: 's', model: 'gpt-4o-mini' });
  assert.equal(u.truncated, true);
  assert.equal(u.wouldExceed(0), true);
});
