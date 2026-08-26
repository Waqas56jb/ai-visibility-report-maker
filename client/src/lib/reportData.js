export const reportData = {
  score: 23,
  readability: 44,
  queries: 42,
  date: '26 Aug 2026',
  mode: [
    ['ChatGPT (browsing)', 27],
    ['ChatGPT (knowledge)', 19],
  ],
  cats: [
    ['Discovery', 12],
    ['Comparison', 18],
    ['Brand', 68],
    ['Informational', 9],
    ['Local / near-me', 15],
    ['Long-tail service', 22],
  ],
  weights: [
    ['Mention rate', '35%', 26],
    ['Prominence', '20%', 18],
    ['AI-readiness', '15%', 44],
    ['Citation rate', '10%', 7],
    ['Sentiment', '10%', 60],
    ['Competitive position', '10%', 21],
  ],
  kpis: [
    ['Mention rate', '11 of 42 queries', 26, 'megaphone'],
    ['Average position', 'when mentioned', 2.7, 'list-ordered'],
    ['Citations', 'browsing answers linked you', 3, 'link'],
    ['Sentiment', 'across 11 mentions', 'Positive', 'smile'],
  ],
  checks: [
    ['pass', 'HTTPS & canonical tags', 'Site served over HTTPS with valid canonicals', '5/5'],
    ['fail', 'Structured data (JSON-LD)', 'No Organization or LocalBusiness schema found on any page', '0/20'],
    ['partial', 'Correct schema types', 'Only WebPage type detected; no Service or FAQPage', '3/10'],
    ['fail', 'FAQ content', 'No FAQ section on service pages', '0/10'],
    ['fail', 'llms.txt / ai.txt', 'Neither file present at root', '0/10'],
    ['pass', 'AI crawlers allowed', 'GPTBot and OAI-SearchBot not blocked in robots.txt', '15/15'],
    ['pass', 'Server-rendered content', 'Key text present in raw HTML', '10/10'],
    ['partial', 'Clear service pages', 'Services listed but under 120 words each', '6/15'],
    ['pass', 'NAP consistency', 'Name, address, phone consistent on 9/9 pages', '5/5'],
    ['fail', 'Sitemap', 'sitemap.xml returns 404', '0/5'],
  ],
  comps: [
    ['Harbourview Accountants', 26, 2.7, 9, 23, true],
    ['Bright Ledger Advisory', 71, 1.4, 31, 78, false],
    ['Keystone Tax Partners', 57, 2.1, 24, 64, false],
    ['QuayCounts', 43, 2.6, 17, 52, false],
    ['Riverside CPA', 31, 3.0, 12, 41, false],
  ],
  gaps: [
    ['Discovery', 'Best accountant for a small business in Brisbane?', ['Bright Ledger Advisory', 'Keystone Tax Partners', 'QuayCounts']],
    ['Comparison', 'Top 5 accounting firms in Brisbane for startups', ['Bright Ledger Advisory', 'QuayCounts', 'Riverside CPA']],
    ['Local', 'Accountant near Fortitude Valley for BAS lodgement', ['Keystone Tax Partners']],
    ['Discovery', 'Who should I use for Xero bookkeeping in Brisbane?', ['Bright Ledger Advisory', 'QuayCounts']],
    ['Informational', 'What should I look for in a small-business accountant?', ['Bright Ledger Advisory']],
    ['Long-tail', 'Brisbane accountant who handles SMSF audits', ['Riverside CPA', 'Keystone Tax Partners']],
  ],
  recs: [
    ['Add LocalBusiness & Service schema', 'You were absent from 8 of 10 discovery queries. No structured data tells AI systems what you do or where.', 'Add JSON-LD for Organization/AccountingService with services, areas served and reviews on every service page.', 'high', 'low', 'aiso'],
    ['Publish FAQ pages per service', 'Informational queries scored 9/100. Competitors cited had FAQ content matching the question wording.', 'Write 6–10 Q&As per service using the exact phrasing from the gap list; mark up with FAQPage schema.', 'high', 'medium', 'aiso'],
    ['Expand thin service pages', "Service pages average 90 words. ChatGPT described competitors' services in detail and yours vaguely.", 'Rewrite each service page to 400+ words in plain language: who it\'s for, what\'s included, outcomes.', 'high', 'medium', 'aiso'],
    ['Get listed where ChatGPT looks', "Browsing answers cited 3 directories for competitors that don't list you.", 'Claim profiles on the sources cited in competitor answers and keep NAP identical to the site.', 'medium', 'low', 'automation'],
    ['Add llms.txt and sitemap', 'Both missing; readiness score capped at 44.', 'Publish llms.txt summarising services and locations; fix the 404 sitemap and submit it.', 'medium', 'low', 'aiso'],
    ['Surface reviews on-site', 'Sentiment was positive but ChatGPT had only 2 review sources to draw on.', 'Automate review requests after each engagement and embed AggregateRating markup.', 'medium', 'low', 'automation'],
    ['Create a comparison page', 'You appeared in only 1 of 6 comparison queries.', 'Publish an honest "Harbourview vs alternatives" page covering pricing model, specialisations and turnaround.', 'medium', 'medium', 'aiso'],
    ['Answer instantly with a site assistant', 'Visitors arriving from AI answers ask specific questions; the site has no way to respond.', 'Deploy a chatbot trained on your services and FAQ to qualify and book consultations.', 'low', 'low', 'chatbot'],
  ],
  help: {
    aiso: ['AI Search Optimisation', 'Make your site readable, trustworthy and citable by AI systems.', 'search-check'],
    automation: ['AI Automation', 'Reviews, listings and content that keep improving your visibility on autopilot.', 'workflow'],
    chatbot: ['AI Chatbots', 'Turn AI-driven visitors into booked calls.', 'bot'],
  },
};

export const sampleReport = {
  business_name: 'Harbourview Accountants',
  website: 'https://harbourviewaccountants.com.au',
  industry: 'Accounting',
  city_region: 'Brisbane',
  created_at: '2026-08-26T00:00:00.000Z',
  overall_score: reportData.score,
  score_band: 'Barely visible',
  readability_score: reportData.readability,
  executive_summary:
    'ChatGPT almost never recommends Harbourview for discovery or comparison questions. You appear on brand searches, but competitors with clearer service pages and schema take the shortlist when a customer has not heard of you yet.',
  metrics: {
    mention_rate: 26,
    mention_label: '11 of 42 queries',
    avg_position: 2.7,
    citations: 3,
    sentiment: 'Positive',
    opportunity_count: 42,
    weights: reportData.weights.map((w) => ({ name: w[0], weight: w[1], score: w[2] })),
  },
  score_by_mode: reportData.mode.map((m) => ({ name: m[0], value: m[1] })),
  score_by_category: reportData.cats.map((m) => ({ name: m[0], value: m[1] })),
  weights: reportData.weights.map((w) => ({ name: w[0], weight: w[1], score: w[2] })),
  ai_readiness: { checks: reportData.checks },
  competitors: reportData.comps.map((c) => ({
    name: c[0],
    mention_rate: c[1],
    avg_position: c[2],
    share_of_voice: c[3],
    est_score: c[4],
    you: c[5],
  })),
  gaps: reportData.gaps.map((g) => ({
    category: g[0],
    question: g[1],
    named_instead: g[2],
    mode: 'browsing',
  })),
  recommendations: reportData.recs.map((r) => ({
    title: r[0],
    why: r[1],
    how: r[2],
    impact: r[3],
    effort: r[4],
    service: r[5],
  })),
};

export function bandOf(s) {
  if (s <= 20) {
    return ['Invisible', 'b1', 'ChatGPT almost never names you. Customers asking for recommendations are being sent elsewhere.'];
  }
  if (s <= 40) {
    return ['Barely visible', 'b2', 'You appear occasionally, usually for brand queries. Discovery and comparison questions go to competitors.'];
  }
  if (s <= 60) {
    return ['Getting there', 'b3', 'You show up in a fair share of answers but rarely first.'];
  }
  if (s <= 80) {
    return ['Visible', 'b4', 'ChatGPT recommends you regularly. Now win prominence.'];
  }
  return ['Leading', 'b4', 'You are the default recommendation in your niche.'];
}
