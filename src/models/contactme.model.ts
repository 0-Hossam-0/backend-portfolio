import { z } from 'zod';

export const ContactMeSchema = z.object({
  name: z.string({ message: 'Name is required' }).trim().min(1, 'Name cannot be empty'),
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .min(1, 'Email cannot be empty')
    .email('Please enter a valid email address'),
  subject: z.string({ message: 'Subject is required' }).trim().min(1, 'Subject cannot be empty'),
  message: z.string({ message: 'Body is required' }).trim().min(1, 'Body cannot be empty'),
});

export type ContactMe = z.infer<typeof ContactMeSchema>;
