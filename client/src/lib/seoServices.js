import { DEFAULT_CONTENT } from './siteDefaults.js';
import { Gauge, Globe2, MapPin, PenLine, Quote, ScanSearch } from 'lucide-react';

// Service titles come from the CMS (content.servicesPage.items) so they stay
// editable. Icon, grouping and deliverables are presentation, attached by slug:
// an item the CMS renames still renders, just without them.
export const slug = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const SERVICE_DETAIL = {
  'seo-audit-ai-visibility': {
    group: 'foundations',
    icon: ScanSearch,
    points: [
      'Technical, content and backlink audit in one document',
      'Your AI visibility score across ChatGPT browsing and knowledge',
      'A ranked fix list, not a data dump',
    ],
  },
  'technical-seo': {
    group: 'foundations',
    icon: Gauge,
    points: [
      'Core Web Vitals, crawl budget and indexing fixed',
      'Schema and structured data on every key page',
      'Crawler access for Googlebot, GPTBot and the rest',
    ],
  },
  'local-seo': {
    group: 'rank',
    icon: MapPin,
    points: [
      'Google Business Profile set up and managed',
      'Suburb and service-area pages that actually convert',
      'Reviews and consistent citations across directories',
    ],
  },
  'content-on-page-seo': {
    group: 'rank',
    icon: PenLine,
    points: [
      'Keyword and intent mapping for every service you sell',
      'Service pages, FAQs and articles written from your expertise',
      'Titles, headings and internal links done properly',
    ],
  },
  'aeo-answer-engine-optimisation': {
    group: 'ai',
    icon: Quote,
    points: [
      'Question-led pages written to be quoted verbatim',
      'Content shaped for AI Overviews and featured snippets',
      'FAQ and HowTo schema an engine can parse',
    ],
  },
  'geo-generative-engine-optimisation': {
    group: 'ai',
    icon: Globe2,
    points: [
      'Entity and business-detail consistency across trusted sources',
      'Third-party mentions, directories and digital PR',
      'llms.txt and a citation footprint AI models draw on',
    ],
  },
};

export const SERVICE_GROUPS = [
  {
    key: 'foundations',
    eyebrow: 'Foundations',
    title: 'Measure it, then fix what is broken',
    body: 'Nothing ranks on a site search engines cannot crawl, and nothing improves that is not measured first.',
  },
  {
    key: 'rank',
    eyebrow: 'Rank on Google',
    title: 'Win the map pack and the page',
    body: 'Local and content SEO for the searches that bring paying customers, not vanity traffic.',
  },
  {
    key: 'ai',
    eyebrow: 'AI search',
    title: 'Be the answer, not just a link',
    body: 'AI Overviews and ChatGPT now answer before anyone clicks. This is how you get named in them.',
  },
];

// The site is SEO only. A CMS still holding the old agency list (automation,
// chatbots, voice, CRM, web builds) must not leak back onto the page, so those
// titles are dropped, and an empty result falls back to the SEO defaults.
const NOT_SEO = /automat|chat ?bot|voice|crm|web ?design|website|custom|integration|develop/i;

export function seoOnly(items = []) {
  const kept = (items || []).filter((s) => s?.title && !NOT_SEO.test(s.title));
  return kept.length ? kept : DEFAULT_CONTENT.servicesPage.items;
}

export function enrichServices(items = []) {
  return seoOnly(items).map((item, i) => ({ ...item, n: i + 1, ...(SERVICE_DETAIL[slug(item.title)] || {}) }));
}
