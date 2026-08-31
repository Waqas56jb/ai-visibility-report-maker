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
  automation: 'Can you automate our repetitive work?',
  voice: 'What can an AI voice agent do?',
  chatbots: 'Can you build a chatbot like this?',
  crm: 'How does lead and CRM automation work?',
  web: 'Do you build websites too?',
  custom: 'Can you build AI into our own product?',
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
      "Hi. I'm MakeFlow's assistant. I can walk you through what we build — automation, voice agents, chatbots, CRM work, custom AI — or the free AI visibility report. Pick a question below or type your own.",
    chips: c('services', 'automation', 'free'),
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
      'MakeFlow is an Australian AI automation agency. We build the systems that run your business — workflow automation, AI voice agents, chatbots, lead and CRM automation, websites and custom AI — and we get you named by AI assistants when customers ask who to use. The free report is the measuring half of that.',
    chips: c('services', 'automation', 'free'),
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
      "Yes, genuinely free — one full report per email every 30 days, no card needed. It is how our engagements start: fixing what it finds, and the automation we build on top, is the paid work, quoted from what your report actually shows.",
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
  /* The agency services. These sit ahead of the generic `services` rule so a tie
     between "do you do automation" and the catch-all lands on the specific answer. */
  {
    id: 'automation',
    strong: [
      'workflow automation',
      'automation',
      'automate',
      'automating',
      'no code',
      'zapier',
      'n8n',
      'make com',
      'repetitive',
      'admin work',
      'manual work',
      'back office',
      'busy work',
      'data entry',
    ],
    keys: [
      'automation',
      'automate',
      'workflow',
      'workflows',
      'manual',
      'repetitive',
      'admin',
      'admin work',
      'data entry',
      'spreadsheet',
      'save time',
      'time consuming',
      'by hand',
      'internal',
      'operations',
      'ops',
    ],
    answer:
      'AI Workflow Automation is our bread and butter: the repetitive work your team does by hand every week, running itself instead. We map the repeat jobs end to end before building anything, wire AI and no-code tooling between the apps you already pay for, then hand over docs so your team owns it rather than us.',
    chips: c('crm', 'custom', 'process'),
  },
  {
    id: 'voice',
    strong: [
      'voice agent',
      'voice ai',
      'ai voice',
      'phone agent',
      'answer the phone',
      'answering calls',
      'answer calls',
      'call answering',
      'receptionist',
      'missed call',
      'phone calls',
      'inbound call',
      'voice bot',
    ],
    keys: [
      'voice',
      'phone',
      'call',
      'calls',
      'caller',
      'ring',
      'answering',
      'receptionist',
      'appointment',
      'booking',
      'book jobs',
      'after hours',
      'voicemail',
    ],
    answer:
      'An AI phone agent that picks up every call, day, night and weekends. It answers the usual questions in your own words, books straight into your calendar, and every call is transcribed and logged. Missed calls stop being lost jobs.',
    chips: c('chatbots', 'crm', 'process'),
  },
  {
    id: 'chatbots',
    strong: [
      'chatbot',
      'chat bot',
      'chatbots',
      'live chat',
      'website chat',
      'instagram',
      'messenger',
      'whatsapp',
      'facebook',
      'bot like this',
      'bot on my site',
      'social chat',
    ],
    keys: [
      'chatbot',
      'chat bot',
      'chat',
      'bot',
      'widget',
      'instagram',
      'messenger',
      'whatsapp',
      'dm',
      'social',
      'like you',
      'like this one',
      'answer visitors',
    ],
    answer:
      'Like this one, only trained on your real services, pricing and policies, and running across your website, Instagram and Messenger from a single brain. It answers instantly and captures the lead before they click away. Rule-based like me, or model-backed if you want it to handle anything.',
    chips: c('crm', 'voice', 'process'),
  },
  {
    id: 'crm',
    strong: [
      'crm',
      'lead automation',
      'lead management',
      'follow up',
      'follow ups',
      'nurture',
      'hubspot',
      'pipedrive',
      'go high level',
      'gohighlevel',
      'salesforce',
      'enquiry',
      'enquiries',
      'pipeline',
      'leads slipping',
    ],
    keys: [
      'crm',
      'lead',
      'leads',
      'enquiry',
      'enquiries',
      'inquiry',
      'follow up',
      'nurture',
      'pipeline',
      'contacts',
      'hubspot',
      'pipedrive',
      'salesforce',
      'database',
      'form',
      'forms',
      'quote request',
      'chase',
    ],
    answer:
      'Lead & CRM Automation: every enquiry captured, from every channel, follow-up sequences that run on schedule without anyone remembering, and clean records in the CRM you already use. No enquiry slips through the cracks.',
    chips: c('automation', 'chatbots', 'process'),
  },
  {
    id: 'web',
    strong: [
      'web design',
      'website design',
      'web development',
      'build a website',
      'build me a website',
      'build websites',
      'build sites',
      'need a website',
      'want a website',
      'make a website',
      'new website',
      'new site',
      'redesign',
      'rebuild',
      'landing page',
      'wordpress',
      'webflow',
      'shopify',
    ],
    keys: [
      'website',
      'site',
      'web',
      'design',
      'develop',
      'development',
      'page',
      'pages',
      'hosting',
      'responsive',
      'mobile',
    ],
    answer:
      'Yes. Fast, responsive, accessible sites, new build or rebuild, with AI-readable structure baked in from day one rather than bolted on later. That means the AEO and GEO work has something solid to stand on instead of fighting the platform.',
    chips: c('aeo', 'custom', 'process'),
  },
  {
    id: 'custom',
    strong: [
      'custom development',
      'custom ai',
      'custom build',
      'integration',
      'integrate',
      'api',
      'bespoke',
      'saas',
      'build ai into',
      'ai into our',
      'own product',
      'our product',
      'our app',
      'our platform',
      'internal tool',
      'build an app',
    ],
    keys: [
      'custom',
      'integration',
      'integrate',
      'api',
      'app',
      'product',
      'platform',
      'software',
      'system',
      'bespoke',
      'from scratch',
      'developer',
      'engineering',
    ],
    answer:
      'AI Integration & Custom Development: AI built directly into the product you already run, or a new one built from scratch around it. It is our deepest, most tailored engagement, so it starts with a conversation about what you have rather than a price off a list.',
    chips: c('automation', 'web', 'contact'),
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
      'Measure, prioritise, build, re-measure. Start with the free report, we walk the results with you and agree the shortest path, then we build in stages so you see something move early instead of at the end. Then we run the report again, because the score is the scoreboard.',
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
      'Nine, in three groups. Get found: AI visibility, AEO and GEO. Run it for you: workflow automation, AI voice agents, chatbots, and lead & CRM automation. Build it properly: web design and custom AI development. Which of those sounds like your problem?',
    chips: c('automation', 'voice', 'chatbots'),
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
      "MakeFlow is an Australian AI automation agency: automation, voice agents, chatbots, CRM and custom AI, plus the visibility work behind this report. I'm a scripted assistant on this page, not a person — for anything I can't answer, a human picks it up by email.",
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
    answer: `Book a call from the button in the menu at the top, or email ${EMAIL}. Tell us which service you are circling — automation, voice, chat, CRM, a site, custom AI — and we will scope it on the call. Running the free report first makes it a lot more useful.`,
    chips: c('services', 'process', 'plans'),
  },
  {
    id: 'thanks',
    strong: ['thanks', 'thank you', 'cheers', 'appreciate'],
    keys: ['thanks', 'thank you', 'cheers', 'ta', 'appreciate', 'awesome', 'great', 'perfect'],
    exactish: true,
    answer: 'No worries. Anything else — the report, or the automation side of what we build?',
    chips: c('services', 'free', 'contact'),
  },
  {
    id: 'bye',
    strong: ['bye', 'goodbye', 'see ya', 'no thanks'],
    keys: ['bye', 'goodbye', 'see ya', 'later', 'thats all', 'no thanks'],
    exactish: true,
    answer: `All good — the free report is one click away whenever you want it, and ${EMAIL} reaches a human about any of the build work.`,
    chips: c('services', 'free', 'contact'),
  },
];

export const FALLBACK = {
  answer: `That one is outside what I've been set up to answer. Email ${EMAIL} and a human will come back to you — or try one of these:`,
  chips: c('services', 'automation', 'free', 'contact'),
};

export const OPENING = {
  answer:
    'Hi. MakeFlow builds AI systems for businesses — workflow automation, voice agents, chatbots, lead and CRM automation, websites and custom AI — and runs the free AI visibility report. Ask me anything, or start here:',
  chips: c('services', 'automation', 'free'),
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
