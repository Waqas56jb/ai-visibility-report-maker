import { z } from 'zod';

function website(val) {
  let url = String(val || '').trim();
  if (!url) return url;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url.replace(/\/+$/, '');
}

export const reportStep1 = z.object({
  business_id: z.string().optional(),
  business_name: z.string().trim().min(1, 'Business name is required.'),
  website_url: z
    .string()
    .trim()
    .min(1, 'Website is required.')
    .transform(website)
    .refine((u) => /^https?:\/\/.+\..+/.test(u), 'Enter a valid website URL.'),
});

export const reportStep2 = z.object({
  industry: z.string().optional(),
  city_region: z.string().optional(),
  country: z.string().optional(),
  competitors: z.array(z.string()).max(3).optional(),
  key_services: z.array(z.string()).max(5).optional(),
});

export const reportStep3 = z.object({
  modes: z.object({
    browsing: z.boolean(),
    knowledge: z.boolean(),
  }),
  notify_email: z.boolean(),
  save_business: z.boolean(),
});

export const reportSchema = z.intersection(reportStep1, z.intersection(reportStep2, reportStep3));
