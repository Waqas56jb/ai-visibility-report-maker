// SEO only. Keys are what the recommendations model tags each fix with; the
// admin panel can rename a service but not add non-SEO ones (see applySaved).
export const SERVICES = {
  technical: {
    name: 'Technical SEO',
    description: 'Crawling, indexing, speed and schema fixed so Google and AI crawlers can read every page.',
    cta: 'https://makeflow.com.au/services',
  },
  local: {
    name: 'Local SEO',
    description: 'Google Business Profile, reviews and suburb pages that win the map pack.',
    cta: 'https://makeflow.com.au/services',
  },
  content: {
    name: 'On-page & content SEO',
    description: 'Service pages, FAQs and on-page structure written around what customers actually search.',
    cta: 'https://makeflow.com.au/services',
  },
  aiso: {
    name: 'AEO & GEO',
    description: 'Get named in AI Overviews, ChatGPT and Perplexity answers, not just ranked on Google.',
    cta: 'https://makeflow.com.au/services',
  },
};

export const SERVICE_KEYS = Object.keys(SERVICES);

export function serviceKeysWithDescriptions() {
  return Object.entries(SERVICES)
    .map(([key, s]) => `${key}: ${s.name}. ${s.description}`)
    .join('\n');
}
