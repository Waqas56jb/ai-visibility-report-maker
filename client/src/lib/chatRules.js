/**
 * Rule-based chatbot knowledge.
 *
 * No model, no API call, no key: every answer here is written by hand and matched
 * by keyword, so the bot can never invent a price, a statistic or a promise. Each
 * rule carries its own follow-up chips, which is what keeps a scripted bot useful —
 * the visitor is always shown the next question it can actually answer.
 *
 * Keeping the answers here (rather than inside the component) means copy edits are
 * a one-file change and the matcher stays testable on its own.
 */

export const EMAIL = 'hello@makeflow.com.au';

/* Chips are referenced by id so an answer can point at another rule without
   repeating its wording. */
export const CHIPS = {
  services: 'What services do you offer?',
  technical: 'What does technical SEO fix?',
  local: 'Can you help me rank in Google Maps?',
  content: 'Do you write the content too?',
  seoOnly: 'Do you do anything besides SEO?',
  aeo: 'What is the difference between SEO, AEO and GEO?',
  process: 'How does working with you start?',
  checks: 'What does the report check?',
  engines: 'Which AI does it test?',
  free: 'Is it really free?',
  time: 'How long does it take?',
  score: 'How is the score worked out?',
  improve: 'How do I improve my score?',
  plans: 'What do the paid plans cover?',
  pdf: 'What do I get at the end?',
  accuracy: 'Will the score change if I re-run it?',
  competitors: 'Do you track competitors?',
  contact: 'How do I talk to someone?',
  privacy: 'What do you do with my data?',
  account: 'Do I need an account?',
};

const c = (...keys) => keys.map((k) => CHIPS[k]);

export const RULES = [
  {
    id: 'greeting',
    strong: ['hi', 'hello', 'hey', 'gday', "g'day", 'good morning', 'good afternoon', 'hiya'],
    keys: ['hi', 'hello', 'hey', 'yo', 'gday', "g'day", 'good morning', 'good afternoon', 'hiya'],
    exactish: true,
    answer:
      "Hi. I'm MakeFlow's assistant. I can walk you through the SEO work (technical, local, content, AEO and GEO) or the free search and AI visibility report. Pick a question below or type your own.",
    chips: c('services', 'local', 'free'),
  },
  {
    id: 'what',
    strong: ['what is this', 'what is ai visibility', 'what is makeflow', 'what does makeflow do'],
    keys: [
      'what is this',
      'what do you do',
      'what is ai visibility',
      'what is makeflow',
      'what does makeflow do',
      'explain',
      'purpose',
      'what is the point',
    ],
    answer:
      'MakeFlow is an independent SEO practice in Australia. I get businesses found on Google, in the map pack, and named by AI assistants like ChatGPT when customers ask who to use. The free report is the measuring half of that.',
    chips: c('services', 'local', 'free'),
  },
  {
    id: 'checks',
    strong: ['what does the report check', 'what does it check', 'how does it work', 'how does the report work', 'methodology'],
    keys: [
      'what does the report check',
      'what does it check',
      'how does it work',
      'how does the report work',
      'methodology',
      'what does the report do',
      'what happens',
      'process',
      'test',
      'questions',
    ],
    answer:
      "We crawl your site, write 30 to 50 questions a real customer would ask in your industry and location, then run every one of them through ChatGPT twice — once with web browsing on, once from the model's own knowledge. We record whether you get named, where in the answer, and who gets named instead.",
    chips: c('engines', 'score', 'time'),
  },
  {
    id: 'engines',
    strong: ['chatgpt', 'gemini', 'perplexity', 'claude', 'copilot', 'openai', 'which ai', 'what ai', 'which model', 'engines'],
    keys: [
      'which ai',
      'what ai',
      'chatgpt',
      'gemini',
      'perplexity',
      'claude',
      'copilot',
      'google',
      'engines',
      'which model',
      'openai',
    ],
    answer:
      'ChatGPT only, in two modes: with web browsing on, and from its own knowledge. We report the two separately so you can see which one is carrying you. We would rather do one engine properly than spread a thin score across five.',
    chips: c('checks', 'score', 'accuracy'),
  },
  {
    id: 'time',
    strong: ['how long', 'how fast', 'how many minutes'],
    keys: ['how long', 'how fast', 'time', 'minutes', 'quick', 'wait', 'duration', 'take'],
    answer:
      'Usually 2 to 3 minutes. You watch the run happen live on screen, and the finished report is emailed to you as a PDF with a shareable link.',
    chips: c('pdf', 'free', 'checks'),
  },
  {
    id: 'free',
    strong: ['free', 'cost', 'price', 'pricing', 'how much', 'credit card'],
    keys: [
      'free',
      'cost',
      'price',
      'pricing',
      'how much',
      'pay',
      'payment',
      'credit card',
      'card',
      'charge',
      'expensive',
      'cheap',
      'catch',
    ],
    answer:
      "Yes, genuinely free — one full report per email every 30 days, no card needed. It is how my work starts: fixing what it finds is the paid SEO work, quoted from what your report actually shows.",
    chips: c('plans', 'services', 'contact'),
  },
  {
    id: 'plans',
    strong: ['plans', 'plan', 'packages', 'package', 'starter', 'growth', 'scale', 'subscription', 'retainer', 'tiers'],
    keys: [
      'plans',
      'plan',
      'packages',
      'package',
      'starter',
      'growth',
      'scale',
      'subscription',
      'monthly',
      'retainer',
      'tiers',
    ],
    answer:
      'Three. Starter is the free report itself. Growth adds a monthly re-scan, up to 3 competitors tracked, schema and crawler fixes, and rewritten FAQ and service pages. Scale is the full service: weekly re-scans with alerts, unlimited competitors and locations, monthly AI-first content, and automation wired into your site. Prices are quoted per business, not listed. Automation, voice agents and custom builds are scoped separately from these.',
    chips: c('services', 'improve', 'contact'),
  },
  {
    id: 'score',
    strong: ['score', 'scoring', 'metrics', 'weighted', 'rating'],
    keys: [
      'score',
      'scoring',
      'how is the score',
      'metrics',
      'weighted',
      'out of 100',
      'grade',
      'rating',
      'calculated',
      'worked out',
    ],
    answer:
      'Six weighted metrics: mention rate, prominence in the answer, AI-readiness of your site, citation rate, sentiment, and competitive position. The report shows each one on its own, plus your score split by mode and by question category — so you can see exactly which part is dragging.',
    chips: c('improve', 'accuracy', 'pdf'),
  },
  {
    id: 'improve',
    strong: ['improve', 'boost', 'recommendations', 'low score', 'bad score', 'what next', 'next step'],
    keys: [
      'improve',
      'improve my score',
      'fix',
      'better',
      'increase',
      'raise',
      'boost',
      'what next',
      'next step',
      'recommendations',
      'low score',
      'bad score',
    ],
    answer:
      'The report ranks your gaps in the order worth fixing. Typically that means making the site readable to AI crawlers (schema, llms.txt, crawler access), rewriting FAQ and service pages to answer real questions directly, and tidying your listings and citations — that is our AEO and GEO work. MakeFlow can do it, or you can take the report and do it yourself.',
    chips: c('aeo', 'services', 'process'),
  },
  {
    id: 'accuracy',
    strong: ['change', 'vary', 'again', 're run', 'rerun', 'accurate', 'accuracy', 'reliable', 'consistent', 'same result'],
    keys: [
      'change',
      'vary',
      'different',
      'again',
      're-run',
      'rerun',
      'accurate',
      'accuracy',
      'reliable',
      'same result',
      'consistent',
      'trust the score',
    ],
    answer:
      'A little, yes. AI answers are never identical twice, so treat each score as a snapshot and watch the trend across runs rather than reading too much into one number. Every run uses the same question set and scoring, so the numbers stay comparable.',
    chips: c('score', 'plans', 'checks'),
  },
  {
    id: 'pdf',
    strong: ['pdf', 'what do i get', 'deliverable', 'shareable', 'report contents'],
    keys: [
      'pdf',
      'what do i get',
      'deliverable',
      'output',
      'email me',
      'report contents',
      'whats in the report',
      'what is in the report',
      'share',
      'shareable',
    ],
    answer:
      'An A4 PDF plus a shareable link: overall score, mention rate, position, citations, readiness, score by mode and category, competitor share of voice, your biggest gaps, and what to do about them in order.',
    chips: c('score', 'competitors', 'free'),
  },
  {
    id: 'competitors',
    strong: ['competitor', 'rivals', 'share of voice', 'benchmark'],
    keys: ['competitor', 'competitors', 'rivals', 'share of voice', 'who else', 'compare', 'benchmark'],
    answer:
      'Yes. Every answer we collect is scanned for who else gets named, so the report shows competitor share of voice beside your own. Growth tracks up to 3 competitors on an ongoing basis; Scale is unlimited.',
    chips: c('plans', 'improve', 'services'),
  },
  /* The SEO services. These sit ahead of the generic `services` rule so a tie
     between "do you do local seo" and the catch-all lands on the specific answer. */
  {
    id: 'technical',
    strong: [
      'technical seo',
      'site speed',
      'page speed',
      'slow site',
      'site is slow',
      'slow website',
      'core web vitals',
      'indexing',
      'not indexed',
      'crawl',
      'crawling',
      'sitemap',
      'robots txt',
      'site audit',
      'seo audit',
    ],
    keys: ['technical', 'speed', 'slow', 'index', 'indexed', 'crawl', 'sitemap', 'robots', 'audit', 'errors', 'broken', 'redirect', 'https'],
    answer:
      'Technical SEO is the foundation: I fix what stops Google and AI crawlers reading your site. Crawling and indexing issues, slow pages and Core Web Vitals, broken redirects, missing schema, and crawler rules that shut AI assistants out. You get a ranked fix list first, then I do the fixes.',
    chips: c('local', 'content', 'process'),
  },
  {
    id: 'local',
    strong: [
      'local seo',
      'google maps',
      'map pack',
      'google business profile',
      'business profile',
      'gbp',
      'google my business',
      'near me',
      'reviews',
      'citations',
      'suburb',
    ],
    keys: ['local', 'maps', 'map', 'nearby', 'near', 'suburb', 'suburbs', 'city', 'area', 'reviews', 'review', 'listing', 'listings', 'directory', 'directories'],
    answer:
      'Yes. Local SEO is how you win the map pack when someone searches "near me" or your suburb. I set up and manage your Google Business Profile, build suburb and service-area pages that convert, and get your reviews and directory citations consistent everywhere.',
    chips: c('technical', 'content', 'process'),
  },
  {
    id: 'content',
    strong: [
      'content',
      'on page',
      'on page seo',
      'keywords',
      'keyword research',
      'blog',
      'blog posts',
      'articles',
      'copywriting',
      'service pages',
      'meta description',
      'title tags',
    ],
    keys: ['content', 'write', 'writing', 'copy', 'blog', 'article', 'articles', 'keyword', 'keywords', 'pages', 'headings', 'titles', 'faq'],
    answer:
      'Yes. I map the keywords and questions your customers actually search, then write or rewrite the service pages, FAQs and articles to answer them, with titles, headings and internal links done properly. It is written from your expertise, so it reads like you and ranks.',
    chips: c('aeo', 'local', 'process'),
  },
  {
    id: 'seoOnly',
    strong: [
      'automation',
      'automate',
      'chatbot',
      'chat bot',
      'voice agent',
      'ai voice',
      'phone agent',
      'receptionist',
      'crm',
      'web design',
      'build a website',
      'build me a website',
      'new website',
      'custom development',
      'custom ai',
      'app development',
      'besides seo',
      'other than seo',
      'anything else',
      'google ads',
      'social media',
    ],
    keys: ['automation', 'chatbot', 'bot', 'voice', 'crm', 'website', 'develop', 'development', 'app', 'software', 'ads', 'ppc', 'social', 'other', 'else'],
    answer:
      'No, I only do SEO, on purpose. Technical SEO, local SEO, on-page and content, plus AEO and GEO so AI assistants name you too. Doing one thing means it gets done properly. If you need something else, I am happy to point you to someone good.',
    chips: c('services', 'free', 'contact'),
  },
  {
    id: 'aeo',
    strong: [
      'aeo',
      'geo',
      'seo',
      'answer engine',
      'generative engine',
      'answer engine optimisation',
      'generative engine optimisation',
      'schema',
      'structured data',
      'llms txt',
      'search engine optimisation',
      'ai overviews',
    ],
    keys: [
      'aeo',
      'geo',
      'seo',
      'schema',
      'structured data',
      'markup',
      'citations',
      'entity',
      'rank',
      'ranking',
      'search',
      'difference between',
    ],
    answer:
      'Three different jobs. SEO wins you a position on a results page. AEO makes your content the answer an engine quotes back. GEO gets you into what the model itself knows and cites, through entities, third-party mentions and a citation footprint. Most businesses need all three; the free report tells you which one is costing you most right now.',
    chips: c('improve', 'services', 'checks'),
  },
  {
    id: 'process',
    strong: [
      'how do we start',
      'how do i start',
      'your process',
      'the process',
      'how do you work',
      'get started',
      'getting started',
      'onboarding',
      'engagement',
      'work with you',
      'working with you',
      'hire you',
      'next steps',
      'project timeline',
      'how long does a project',
    ],
    keys: [
      'start',
      'started',
      'begin',
      'onboarding',
      'engagement',
      'process',
      'hire',
      'timeline',
      'stages',
      'steps',
      'scope',
      'proposal',
      'contract',
    ],
    answer:
      'Measure, prioritise, fix, re-measure. Start with the free report, I walk the results with you and agree the shortest path, then I fix in stages so you see something move early instead of at the end. Then I run the report again, because the score is the scoreboard.',
    chips: c('free', 'services', 'contact'),
  },
  {
    id: 'services',
    strong: [
      'services',
      'what else',
      'what do you offer',
      'what can you do',
      'full list',
      'everything you do',
      'ai agency',
      'agency',
    ],
    keys: [
      'services',
      'service',
      'offer',
      'offerings',
      'what else',
      'anything else',
      'other things',
      'help with',
      'work',
      'agency',
      'do for me',
      'do for us',
    ],
    answer:
      'Five, all SEO. Technical SEO, local SEO, on-page and content, plus AEO and GEO so AI assistants like ChatGPT name you too. Most jobs start with an audit so I fix the right thing first. Which of those sounds like your problem?',
    chips: c('technical', 'local', 'content'),
  },
  {
    id: 'blocked',
    strong: ['robots', 'robots txt', 'crawler', 'noindex', 'cloudflare'],
    keys: ['robots', 'robots.txt', 'crawler', 'crawlers', 'blocked', 'block', 'firewall', 'cloudflare', 'noindex'],
    answer:
      'We still run the visibility test. The readiness score reflects only what we could actually see, and the report names the crawler rules that are shutting AI systems out — usually one of the quickest things to fix.',
    chips: c('score', 'improve', 'checks'),
  },
  {
    id: 'account',
    strong: ['account', 'sign up', 'signup', 'log in', 'login', 'register', 'password', 'dashboard'],
    keys: ['account', 'sign up', 'signup', 'log in', 'login', 'register', 'password', 'history', 'dashboard'],
    answer:
      'You can run the free report without an account. Making one lets you keep your report history and re-run later — use the Log in link in the menu at the top.',
    chips: c('free', 'privacy', 'contact'),
  },
  {
    id: 'privacy',
    strong: ['privacy', 'my data', 'your data', 'personal data', 'gdpr', 'delete my data', 'spam', 'unsubscribe', 'personal information'],
    keys: [
      'privacy',
      'data',
      'gdpr',
      'delete my data',
      'spam',
      'unsubscribe',
      'personal information',
      'store',
      'secure',
      'safe',
    ],
    answer:
      `We collect what you type into the report form plus basic usage data, use it to run and send your report, and we don't sell it. You can ask us to delete it any time at ${EMAIL}. The full detail is on our Privacy Policy page, linked in the footer.`,
    chips: c('contact', 'free', 'account'),
  },
  {
    id: 'who',
    strong: ['who are you', 'who is makeflow', 'are you a bot', 'are you human', 'real person', 'australian'],
    keys: [
      'who are you',
      'who is makeflow',
      'about',
      'based',
      'located',
      'location',
      'australia',
      'australian',
      'team',
      'are you a bot',
      'are you human',
      'real person',
      'ai',
    ],
    answer:
      "MakeFlow is my independent SEO practice in Australia: technical, local, on-page and content SEO, plus AEO and GEO. I'm a scripted assistant on this page, not a person. For anything I can't answer, a human picks it up by email.",
    chips: c('services', 'process', 'contact'),
  },
  {
    id: 'contact',
    strong: ['contact', 'book a call', 'talk to someone', 'talk to a human', 'consultation', 'email', 'phone', 'quote'],
    keys: [
      'contact',
      'talk to someone',
      'talk to a human',
      'speak to',
      'call',
      'book a call',
      'meeting',
      'consultation',
      'email',
      'phone',
      'quote',
      'pricing call',
    ],
    answer: `Book a call from the button in the menu at the top, or email ${EMAIL}. Tell me what you want to rank for and where, and I will scope it on the call. Running the free report first makes it a lot more useful.`,
    chips: c('services', 'process', 'plans'),
  },
  {
    id: 'thanks',
    strong: ['thanks', 'thank you', 'cheers', 'appreciate'],
    keys: ['thanks', 'thank you', 'cheers', 'ta', 'appreciate', 'awesome', 'great', 'perfect'],
    exactish: true,
    answer: 'No worries. Anything else about the report or the SEO work?',
    chips: c('services', 'free', 'contact'),
  },
  {
    id: 'bye',
    strong: ['bye', 'goodbye', 'see ya', 'no thanks'],
    keys: ['bye', 'goodbye', 'see ya', 'later', 'thats all', 'no thanks'],
    exactish: true,
    answer: `All good. The free report is one click away whenever you want it, and ${EMAIL} reaches a human about any of the SEO work.`,
    chips: c('services', 'free', 'contact'),
  },
];

export const FALLBACK = {
  answer: `That one is outside what I've been set up to answer. Email ${EMAIL} and a human will come back to you — or try one of these:`,
  chips: c('services', 'local', 'free', 'contact'),
};

export const OPENING = {
  answer:
    'Hi. MakeFlow is an SEO practice: technical, local, on-page and content, AEO and GEO, plus the free search and AI visibility report. Ask me anything, or start here:',
  chips: c('services', 'local', 'free'),
};

function normalise(s) {
  return ` ${String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

/* Matches a key as a whole word or phrase, tolerating a plural on the last word so
   "competitors" hits "competitor" and "voice agents" hits "voice agent". */
function hits(hay, key) {
  const needle = normalise(key).trim();
  if (!needle) return false;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\s${escaped}(?:s|es)?\\s`).test(hay);
}

const STRONG = 6; // distinctive to one rule — "gemini", "pdf", "privacy"
const PHRASE = 4; // multi-word, shared vocabulary — "how does it work"
const WORD = 2; // single common word — "test", "fix", "again"
const THRESHOLD = 4; // one common word alone is not enough to claim an answer

/**
 * Scores every rule against the text and returns the best one, or the fallback.
 * `strong` keys are terms that belong to exactly one rule, so "do you test gemini"
 * lands on engines rather than on the generic "test" in checks. `exactish` rules
 * (greetings, thanks) only fire on short messages, so "hi, how much is it" is
 * priced rather than greeted.
 */
export function matchRule(text) {
  const hay = normalise(text);
  const words = hay.trim().split(' ').filter(Boolean).length;
  let best = null;
  let bestScore = 0;

  for (const rule of RULES) {
    if (rule.exactish && words > 4) continue;
    let score = 0;
    for (const key of rule.strong || []) if (hits(hay, key)) score += STRONG;
    for (const key of rule.keys) {
      if (!hits(hay, key)) continue;
      score += key.trim().includes(' ') ? PHRASE : WORD;
    }
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  }

  return bestScore >= THRESHOLD && best ? best : FALLBACK;
}
