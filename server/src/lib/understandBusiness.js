import { completeJson } from '../services/openai.js';
import { BusinessSummary } from '../services/schemas.js';
import { settings } from '../config/env.js';
import { trimSiteProfile } from './crawler.js';

export async function understandBusiness(report, crawl, usage) {
  const blocked = crawl.crawl_status === 'blocked';
  const { data } = await completeJson({
    promptStem: 'business_summary',
    schema: BusinessSummary,
    schemaName: 'BusinessSummary',
    model: settings().modelMini,
    temperature: 0,
    max_tokens: 1200,
    stage: 'understand_business',
    usage,
    vars: {
      domain: crawl.domain,
      business_name: report.business_name,
      industry: report.industry || 'not provided',
      location: report.city_region || 'not provided',
      competitors: (report.competitors || []).join(', ') || 'none',
      blocked_note: blocked
        ? 'No website content was retrievable. Build the profile from the business name, industry and location only, and set confidence ≤ 0.4.'
        : '',
      site_profile_raw: blocked
        ? { crawl_status: 'blocked', user_provided: { business_name: report.business_name } }
        : trimSiteProfile(crawl, {
            business_name: report.business_name,
            industry: report.industry,
            location: report.city_region,
            competitors: report.competitors || [],
          }),
    },
  });
  if (blocked) data.confidence = Math.min(data.confidence ?? 0.4, 0.4);
  return data;
}
