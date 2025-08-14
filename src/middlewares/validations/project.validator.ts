import { z } from 'zod';

export const ProjectSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long' }).trim(),
  technologies: z.array(z.string().trim()).nonempty({ message: 'At least one technology is required' }),
  githubLink: z.string().trim().optional(),
  description: z.string().min(100, { message: 'Description must be at least 100 characters long' }).trim(),
  images: z.array(z.string()).optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
