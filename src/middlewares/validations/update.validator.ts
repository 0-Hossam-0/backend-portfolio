import { z } from 'zod';

export const UpdateSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }),
  postDate: z
    .string()
    .or(z.date())
    .refine((val) => new Date(val).toString() !== 'Invalid Date', {
      message: 'Invalid date format',
    }),
  description: z.string().trim().min(1, { message: 'Description is required' }),
});

export type Update = z.infer<typeof UpdateSchema>;
