// Shared service metadata for the report's "how MakeFlow helps" CTAs and the
// recommendation cards' service tags, so both stay in sync with one source
// of truth instead of duplicating labels/URLs in two components.
export const SERVICE_LINKS = {
  aiso: { label: 'AI Search Optimisation', cta: 'https://makeflow.com.au/contact?s=aiso' },
  automation: { label: 'AI Automation', cta: 'https://makeflow.com.au/contact?s=automation' },
  chatbot: { label: 'AI Chatbots', cta: 'https://makeflow.com.au/contact?s=chatbot' },
  custom: { label: 'Custom AI Solutions', cta: 'https://makeflow.com.au/contact' },
};

export function serviceLink(key) {
  return SERVICE_LINKS[key] || null;
}

/** Adds report context to a MakeFlow contact link so an enquiry arrives with its report attached. */
export function withReportContext(url, report) {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'ai-visibility-report');
    if (report?.id) u.searchParams.set('ref', report.id);
    if (report?.overall_score != null) u.searchParams.set('score', report.overall_score);
    return u.toString();
  } catch {
    return url;
  }
}
