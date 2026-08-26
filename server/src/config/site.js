export const DEFAULT_THEME = {
  ink: '#0B1020',
  ink2: '#141B33',
  paper: '#F7F8FC',
  text: '#0F172A',
  cyan: '#06B6D4',
  indigo: '#4F46E5',
  violet: '#7C3AED',
  coral: '#F0625A',
  amber: '#F5B84B',
  mint: '#22C55E',
};

export const DEFAULT_CONTENT = {
  brandName: 'MakeFlow',
  documentTitle: 'MakeFlow — AI Visibility Report',
  navCta: 'Check my visibility',
  strip: 'Built on the same methodology used by AI search agencies',
  cities: ['Brisbane', 'Sydney', 'Melbourne', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra'],
  hero: {
    eyebrow: 'Free AI Visibility Report · Tested against ChatGPT',
    headline: 'When customers ask ChatGPT, does it',
    highlight: 'say your name?',
    lead:
      'Thousands of Australians now ask AI assistants for recommendations before they search Google. We run real customer questions through ChatGPT and show you exactly where your business appears — and where your competitors do instead.',
    ctaPrimary: 'Run my free report',
    ctaSecondary: 'See a sample report',
    stat1n: '40+',
    stat1l: 'real questions tested',
    stat2n: '2 modes',
    stat2l: 'browsing & knowledge',
    stat3n: '~3 min',
    stat3l: 'to your score & PDF',
  },
  checker: {
    eyebrow: 'Run the check',
    title: 'Three details. One honest score.',
    lead:
      'Tell us who you are and where your website lives. We crawl it, generate the questions your customers really ask, test them against ChatGPT and hand you a full report — for free.',
    formTitle: 'Check your AI visibility',
    formSub: 'Takes about 3 minutes. No credit card, no spam.',
    submit: 'Run my free report',
  },
  servicesEyebrow: 'How MakeFlow helps',
  servicesTitle: 'Every gap maps to a fix we deliver',
  servicesLead: 'Your report ends with a plan. These are the services behind that plan.',
  services: [
    {
      title: 'AI Search Optimisation',
      body: 'Schema, llms.txt, crawler access, FAQ and service pages written so AI systems can read, trust and cite you.',
      img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'AI Chatbots',
      body: 'Custom assistants on your site and WhatsApp that answer, qualify and book — trained on your real content.',
      img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'AI Automation',
      body: 'Lead routing, review collection and content pipelines that keep your visibility improving without manual work.',
      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    },
  ],
  faqEyebrow: 'FAQ',
  faqTitle: 'Questions before you run it',
  faqs: [
    {
      q: 'Which AI is this tested against?',
      a: 'ChatGPT only, in two modes: with web browsing enabled and from its own knowledge. Both are reported separately so you can see whether your website or your reputation is doing the work.',
    },
    {
      q: 'How long does it take?',
      a: "Usually 2–3 minutes. We crawl your site, generate 30–50 questions, run each twice and score the results. You'll see live progress and we'll email you the link if you ask us to.",
    },
    {
      q: 'Will my score change if I run it again?',
      a: 'Yes, slightly. AI answers are non-deterministic. Treat the score as a snapshot and compare trends over time rather than single points. That is why re-run exists.',
    },
    {
      q: 'What if my site blocks crawlers?',
      a: 'We still run the visibility test. The readiness score reflects what we could observe and the report tells you exactly which crawler rules are blocking AI systems.',
    },
    {
      q: 'Is it really free?',
      a: "Yes. The report is a free lead magnet. If you want us to fix what it finds — schema, pages, listings, a chatbot — that's MakeFlow's paid work.",
    },
    {
      q: 'What does the PDF include?',
      a: 'Overall score, mention rate, position, citations, readiness, score by mode and category, competitor share of voice, highest-value gaps, sequenced recommendations, and how MakeFlow can deliver the work. Formatted for A4.',
    },
    {
      q: 'Do you test Google, Perplexity or Gemini?',
      a: 'Not in this product. One engine, done properly, beats a thin score across five. ChatGPT is the assistant most Australian SMEs hear about from customers today.',
    },
    {
      q: 'Will you spam my email?',
      a: 'We send the report link when you ask. No drip sequences from this form. You can create an account to keep history and re-run later.',
    },
  ],
  cta: {
    eyebrow: 'Ready?',
    title: 'Find out what ChatGPT says about you',
    body: 'Two minutes to fill in. Three minutes to wait. One honest score.',
    button: 'Run my free report',
  },
  footerBlurb:
    'Australian AI studio. We make businesses visible to AI assistants and build the chatbots and automations that turn that visibility into customers.',
  footerCopy: '© 2026 MakeFlow Pty Ltd · makeflow.com.au',
  footerNote: 'Results tested against ChatGPT · Scores vary over time',
};

export function defaultSite() {
  return {
    theme: { ...DEFAULT_THEME },
    content: {
      ...DEFAULT_CONTENT,
      cities: [...DEFAULT_CONTENT.cities],
      faqs: DEFAULT_CONTENT.faqs.map((f) => ({ ...f })),
      services: DEFAULT_CONTENT.services.map((s) => ({ ...s })),
      hero: { ...DEFAULT_CONTENT.hero },
      checker: { ...DEFAULT_CONTENT.checker },
      cta: { ...DEFAULT_CONTENT.cta },
    },
  };
}

export function mergeSite(...layers) {
  const out = defaultSite();
  for (const layer of layers) {
    if (!layer || typeof layer !== 'object') continue;
    if (layer.theme && typeof layer.theme === 'object') Object.assign(out.theme, layer.theme);
    if (layer.content && typeof layer.content === 'object') {
      const { faqs, services, cities, hero, checker, cta, ...rest } = layer.content;
      Object.assign(out.content, rest);
      if (hero && typeof hero === 'object') out.content.hero = { ...out.content.hero, ...hero };
      if (checker && typeof checker === 'object') out.content.checker = { ...out.content.checker, ...checker };
      if (cta && typeof cta === 'object') out.content.cta = { ...out.content.cta, ...cta };
      if (Array.isArray(faqs)) out.content.faqs = faqs.filter((f) => f && (f.q || f.a));
      if (Array.isArray(services)) out.content.services = services.filter((s) => s && (s.title || s.body));
      if (Array.isArray(cities)) out.content.cities = cities.map(String).filter(Boolean);
    }
  }
  return out;
}
