# Prompt golden set

Run `npm run prompt:test` after changing extraction prompts.

Each fixture is a ChatGPT-style answer plus the expected `target_mentioned` flag.

| # | Target | Expected mentioned | Notes |
|---|---|---|---|
| 1 | Harbourview Accountants | true | Named in a list |
| 2 | Harbourview Accountants | false | Competitors only |
| 3 | Smith Plumbing | true | Fuzzy domain match |
| 4 | Bright Ledger | false | Generic advice, no providers |
| 5 | QuayCounts | true | Variant without Pty Ltd |
