import { z } from 'zod';

const emailField = z
  .string()
  .trim()
  .min(1, 'Enter a valid email.')
  .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email.');

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Please enter your password.'),
  remember_me: z.boolean().optional(),
});

export const signupSchema = z
  .object({
    first_name: z.string().trim().min(1, 'First name is required.'),
    last_name: z.string().trim().min(1, 'Last name is required.'),
    email: emailField,
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirm_password: z.string().min(1, 'Confirm your password.'),
    company_name: z.string().optional(),
    accept_terms: z.boolean().refine((v) => v === true, 'Please accept the terms.'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  });

export const forgotSchema = z.object({
  email: emailField,
});

export const resetConfirmSchema = z
  .object({
    new_password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirm: z.string().min(1, 'Confirm your password.'),
  })
  .refine((d) => d.new_password === d.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  });
