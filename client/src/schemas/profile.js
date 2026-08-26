import { z } from 'zod';

export const profileSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required.'),
  last_name: z.string().trim().min(1, 'Last name is required.'),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
});

export const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required.'),
    new_password: z.string().min(8, 'New password must be at least 8 characters.'),
    confirm: z.string().min(1, 'Confirm your password.'),
  })
  .refine((d) => d.new_password === d.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  });
