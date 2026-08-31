import test from 'node:test';
import assert from 'node:assert/strict';
import { domainOf, normalizeUrl, originOf, stripWww } from '../src/lib/url.js';

test('stripWww lowercases and drops the www prefix only', () => {
  assert.equal(stripWww('WWW.MakeFlow.com.au'), 'makeflow.com.au');
  assert.equal(stripWww('wwwx.makeflow.com.au'), 'wwwx.makeflow.com.au');
  assert.equal(stripWww(null), '');
});

test('normalizeUrl adds a scheme, strips tracking params and trims trailing slashes', () => {
  assert.equal(normalizeUrl('makeflow.com.au'), 'https://makeflow.com.au');
  assert.equal(normalizeUrl('https://makeflow.com.au/'), 'https://makeflow.com.au');
  assert.equal(normalizeUrl('https://makeflow.com.au/plans/'), 'https://makeflow.com.au/plans');
  assert.equal(normalizeUrl('https://makeflow.com.au/?utm_source=x&keep=1'), 'https://makeflow.com.au/?keep=1');
  assert.equal(normalizeUrl('https://makeflow.com.au/a#top'), 'https://makeflow.com.au/a');
});

test('normalizeUrl returns empty rather than throwing on junk', () => {
  assert.equal(normalizeUrl(''), '');
  assert.equal(normalizeUrl(null), '');
  assert.equal(normalizeUrl('http://'), '');
});

test('domainOf is what mention matching keys on', () => {
  assert.equal(domainOf('https://www.MakeFlow.com.au/plans'), 'makeflow.com.au');
  assert.equal(domainOf('makeflow.com.au'), 'makeflow.com.au');
  assert.equal(domainOf('not a url at all'), '');
  assert.equal(domainOf(''), '');
});

test('originOf keeps the scheme and host only', () => {
  assert.equal(originOf('https://www.makeflow.com.au/a/b?c=1'), 'https://www.makeflow.com.au');
  assert.equal(originOf('makeflow.com.au'), 'https://makeflow.com.au');
  assert.equal(originOf(''), '');
});
