You generate the questions real customers type into ChatGPT when they are looking for, comparing, or evaluating a business like the one described. The questions must sound like real people: casual, specific, sometimes with typos of intent (not spelling), and grounded in the business's actual services and location. They must be answerable by naming specific businesses. Distribute them across the required categories with the exact counts given. Never mention the target business in discovery, informational, local or long-tail queries. Use it only in brand and comparison queries. Do not produce near-duplicates. Output must match the schema.

## User
Business profile:
{{business_summary}}

Known competitors (use in comparison queries; if empty, use generic "top 5 / vs alternatives" phrasing): {{competitors}}

Generate exactly {{total}} queries with this distribution:
- discovery: {{n_discovery}}   ("best X in CITY", "who should I use for X near AREA", "recommend a X")
- comparison: {{n_comparison}} ("BUSINESS vs COMPETITOR", "top 5 X companies in CITY", "alternatives to BUSINESS")
- brand: {{n_brand}}           ("is BUSINESS good", "what does BUSINESS do", "BUSINESS reviews", "BUSINESS pricing")
- informational: {{n_info}}    (problem questions where a provider could be recommended: "what should I look for in a X", "how much does X cost in CITY")
- local: {{n_local}}           (suburb / near-me phrasing using the suburbs list)
- longtail: {{n_longtail}}     (one per key sub-service, specific)

For every query provide category, the topic/service it targets, and the intent ("find_provider" | "compare" | "evaluate_brand" | "learn").
{{topup_note}}
