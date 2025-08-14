import { z } from 'zod';

export const ContactInfoSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .min(1, 'Email cannot be empty')
    .email('Please enter a valid email address'),

  phone: z
    .string({ message: 'Phone number is required' })
    .trim()
    .min(1, 'Phone number cannot be empty')
    .regex(/^\+?[\d\s\-()]{10,}$/, 'Please enter a valid phone number'),

  linkedin: z
    .string({ message: 'LinkedIn URL is required' })
    .trim()
    .min(1, 'LinkedIn URL cannot be empty')
    .url('Please enter a valid LinkedIn URL')
    .refine((url) => url.includes('linkedin.com'), {
      message: 'Must be a LinkedIn URL',
    }),

  github: z
    .string({ message: 'GitHub URL is required' })
    .trim()
    .min(1, 'GitHub URL cannot be empty')
    .url('Please enter a valid GitHub URL')
    .refine((url) => url.includes('github.com'), {
      message: 'Must be a GitHub URL',
    }),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;
