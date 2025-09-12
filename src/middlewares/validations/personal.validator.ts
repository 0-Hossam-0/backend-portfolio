import { z } from 'zod';

export const personalSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  title: z.string().trim().min(1, 'Title is required'),
  bio: z.string().trim().min(1, 'Bio is required'),
  skills: z.array(z.string().trim().min(1, 'Each skill is required')).min(1, 'Skills are required'),
  location: z.string().trim().min(1, 'Location is required'),
});

export type PersonalType = z.infer<typeof personalSchema>;
