export function bandOf(score) {
  if (score <= 20) return 'Invisible';
  if (score <= 40) return 'Barely visible';
  if (score <= 60) return 'Getting there';
  if (score <= 80) return 'Visible';
  return 'Leading';
}

function hash(str) {
  let h = 0;
  for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

const clamp = (n, min, max) => Math.max(min, Math.min(max, Math.round(n)));

export const STAGES = [
  'crawling',
  'generating_queries',
  'testing',
  'scoring',
  'writing_recommendations',
  'generating_pdf',
];

export function generateReportResult({ business_name, website, city_region, competitors = [], key_services = [] }) {
  const h = hash(business_name + website);
  const overall = clamp(16 + (h % 48), 8, 78);
  const readability = clamp(30 + ((h >> 3) % 50), 20, 85);
  const mention = clamp(overall * 0.9 + (h % 8) - 4, 5, 90);
  const rivals = (competitors.length ? competitors.map((c) => (typeof c === 'string' ? c : c.name)) : ['Bright Ledger Advisory', 'Keystone Tax Partners', 'QuayCounts']).slice(0, 3);
  const city = city_region || 'your city';
  const serviceHint = key_services[0] || 'your main service';

  return {
    overall_score: overall,
    score_band: bandOf(overall),
    readability_score: readability,
    score_by_mode: [
      { name: 'ChatGPT (browsing)', value: clamp(overall + 4, 5, 90) },
      { name: 'ChatGPT (knowledge)', value: clamp(overall - 6, 4, 85) },
    ],
    score_by_category: [
      { name: 'Discovery', value: clamp(overall * 0.55, 4, 70) },
      { name: 'Comparison', value: clamp(overall * 0.7, 6, 75) },
      { name: 'Brand', value: clamp(overall + 28, 20, 92) },
      { name: 'Informational', value: clamp(overall * 0.4, 4, 60) },
      { name: 'Local / near-me', value: clamp(overall * 0.6, 5, 70) },
      { name: 'Long-tail service', value: clamp(overall * 0.75, 8, 78) },
    ],
    metrics: {
      mention_rate: mention,
      mention_label: `${Math.max(1, Math.round(mention / 4))} of 42 queries`,
      avg_position: Number((1.8 + ((h >> 2) % 20) / 10).toFixed(1)),
      citations: clamp((h >> 7) % 18, 0, 40),
      sentiment: overall > 45 ? 'Positive' : overall > 25 ? 'Neutral' : 'Mixed',
      weights: [
        { name: 'Mention rate', weight: '35%', score: mention },
        { name: 'Prominence', weight: '20%', score: clamp(overall * 0.7, 8, 85) },
        { name: 'AI-readiness', weight: '15%', score: readability },
        { name: 'Citation rate', weight: '10%', score: clamp((h >> 7) % 18, 0, 40) },
        { name: 'Sentiment', weight: '10%', score: clamp(overall + 10, 20, 80) },
        { name: 'Competitive position', weight: '10%', score: clamp(overall - 5, 8, 70) },
      ],
    },
    ai_readiness: {
      score: readability,
      checks: [
        ['pass', 'HTTPS & canonical tags', 'Site served over HTTPS with valid canonicals', '5/5'],
        ['fail', 'Structured data (JSON-LD)', 'No Organization or LocalBusiness schema found', '0/20'],
        ['partial', 'Correct schema types', 'Only WebPage type detected', '3/10'],
        ['fail', 'FAQ content', 'No FAQ section on service pages', '0/10'],
        ['fail', 'llms.txt / ai.txt', 'Neither file present at root', '0/10'],
        ['pass', 'AI crawlers allowed', 'GPTBot not blocked in robots.txt', '15/15'],
        ['pass', 'Server-rendered content', 'Key text present in raw HTML', '10/10'],
        ['partial', 'Clear service pages', 'Services listed but under 120 words', '6/15'],
        ['pass', 'NAP consistency', 'Name, address, phone consistent', '5/5'],
        ['fail', 'Sitemap', 'sitemap.xml returns 404', '0/5'],
      ],
    },
    result_competitors: [
      { name: business_name, mention_rate: mention, avg_position: 2.7, share_of_voice: clamp(mention * 0.35, 4, 40), est_score: overall, you: true },
      { name: rivals[0], mention_rate: clamp(mention + 38, 40, 92), avg_position: 1.4, share_of_voice: 31, est_score: clamp(overall + 45, 50, 95), you: false },
      { name: rivals[1] || 'Keystone Tax Partners', mention_rate: clamp(mention + 24, 30, 85), avg_position: 2.1, share_of_voice: 24, est_score: clamp(overall + 32, 40, 88), you: false },
    ],
    competitors_result: undefined,
    gaps: [
      { category: 'Discovery', question: `Best ${serviceHint} in ${city}?`, named_instead: rivals },
      { category: 'Comparison', question: `Top 5 ${serviceHint} firms in ${city}`, named_instead: rivals.slice(0, 2) },
      { category: 'Local', question: `${serviceHint} near ${city}`, named_instead: [rivals[0]] },
    ],
    recommendations: [
      { title: 'Add LocalBusiness & Service schema', why: `No structured data tells AI systems what ${business_name} does.`, how: 'Add JSON-LD for Organization/LocalBusiness.', impact: 'high', effort: 'low', service: 'aiso' },
      { title: 'Publish FAQ pages per service', why: 'Informational queries scored poorly.', how: 'Write 6 to 10 Q&As per service with FAQPage schema.', impact: 'high', effort: 'medium', service: 'aiso' },
      { title: 'Get listed where ChatGPT looks', why: 'Browsing answers cited directories you are missing from.', how: 'Claim profiles and keep NAP identical.', impact: 'medium', effort: 'low', service: 'automation' },
      { title: 'Answer instantly with a site assistant', why: 'AI-driven visitors have no way to convert.', how: 'Deploy a chatbot trained on your FAQ.', impact: 'low', effort: 'low', service: 'chatbot' },
    ],
    pdf_url: null,
  };
}
