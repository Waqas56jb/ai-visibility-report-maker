import test from 'node:test';
import assert from 'node:assert/strict';
import { levenshteinRatio, mentionedInText, normalizeName, similar } from '../src/lib/fuzzy.js';

test('normalizeName drops legal suffixes, punctuation and filler words', () => {
  assert.equal(normalizeName('MakeFlow Pty Ltd'), 'makeflow');
  assert.equal(normalizeName('The Smith & Sons, Limited'), 'smith sons');
  assert.equal(normalizeName(null), '');
});

test('similar treats legal-suffix variants as the same business', () => {
  assert.equal(similar('MakeFlow Pty Ltd', 'MakeFlow'), true);
  assert.equal(similar('MakeFlow', 'Makeflow'), true);
  assert.equal(similar('MakeFlow', 'Acme Plumbing'), false);
  assert.equal(similar('', 'MakeFlow'), false);
});

test('mentionedInText finds an exact name in an answer', () => {
  const hit = mentionedInText('MakeFlow', [], 'makeflow.com.au', 'I would start with MakeFlow.');
  assert.equal(hit.mentioned, true);
  assert.equal(hit.matched_by, 'exact');
});

test('mentionedInText matches a declared name variant', () => {
  const hit = mentionedInText('MakeFlow', ['Make Flow Automation'], '', 'Try Make Flow Automation.');
  assert.equal(hit.mentioned, true);
});

test('mentionedInText falls back to the domain stem', () => {
  const hit = mentionedInText('Totally Different Name', [], 'makeflow.com.au', 'See makeflow for details.');
  assert.equal(hit.mentioned, true);
  assert.equal(hit.matched_by, 'domain');
});

test('mentionedInText does not invent a mention', () => {
  const miss = mentionedInText('MakeFlow', [], 'makeflow.com.au', 'Acme Plumbing and Beta Works are the two picks.');
  assert.equal(miss.mentioned, false);
  assert.equal(miss.matched_by, null);
});

test('levenshteinRatio is normalised to 0..1', () => {
  assert.equal(levenshteinRatio('MakeFlow', 'MakeFlow'), 1);
  assert.ok(levenshteinRatio('MakeFlow', 'Acme') < 0.5);
});
