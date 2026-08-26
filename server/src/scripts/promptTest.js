import { mentionedInText } from '../lib/fuzzy.js';

const fixtures = [
  {
    target: 'Harbourview Accountants',
    variants: ['Harbourview'],
    domain: 'harbourview.com.au',
    answer: 'For tax in Brisbane I would look at Harbourview Accountants, then Bright Ledger.',
    expect: true,
  },
  {
    target: 'Harbourview Accountants',
    variants: ['Harbourview'],
    domain: 'harbourview.com.au',
    answer: 'Bright Ledger and Keystone Tax Partners are the usual recommendations.',
    expect: false,
  },
  {
    target: 'Smith Plumbing',
    variants: [],
    domain: 'smithplumbing.com.au',
    answer: 'Call smithplumbing if you need a blocked drain on the northside.',
    expect: true,
  },
  {
    target: 'Bright Ledger',
    variants: [],
    domain: 'brightledger.com.au',
    answer: 'Look for a registered tax agent, compare fees, and ask about BAS lodgement.',
    expect: false,
  },
  {
    target: 'QuayCounts Pty Ltd',
    variants: ['QuayCounts'],
    domain: 'quaycounts.com.au',
    answer: 'QuayCounts is often named for bookkeeping in the inner city.',
    expect: true,
  },
];

let failed = 0;
for (const f of fixtures) {
  const got = mentionedInText(f.target, f.variants, f.domain, f.answer).mentioned;
  const ok = got === f.expect;
  if (!ok) {
    failed += 1;
    console.error('FAIL', f.target, 'expected', f.expect, 'got', got);
  } else {
    console.log('ok', f.target, f.expect);
  }
}
if (failed) process.exit(1);
console.log('prompt:test passed');
