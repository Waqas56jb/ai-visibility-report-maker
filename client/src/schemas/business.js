import { z } from 'zod';

export const businessSchema = z.object({
  business_name: z.string().trim().min(1, 'Business name is required.'),
  website_url: z.string().trim().min(1, 'Website is required.'),
  industry: z.string().optional(),
  city_region: z.string().optional(),
  competitors: z.array(z.string()).optional(),
});
