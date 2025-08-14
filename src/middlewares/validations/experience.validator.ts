import { z } from 'zod';

export const ExperienceSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long' }),
  technologies: z.array(z.string().trim()).nonempty({ message: 'At least one technology is required' }),
  provider: z.string().min(1, { message: 'Provider is required' }),
  startDate: z
    .string()
    .or(z.date())
    .refine((val) => new Date(val).toString() !== 'Invalid Date', {
      message: 'Invalid date format',
    }),
  completionDate: z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (val === undefined || val === null) return true;
        return new Date(val).toString() !== 'Invalid Date';
      },
      {
        message: 'Invalid date format',
      }
    ),
  description: z.string().min(100, { message: 'Description must be at least 100 characters long' }),
});

export type Experience = z.infer<typeof ExperienceSchema>;
