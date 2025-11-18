import { z } from 'zod';

export const MentorSchema = z.object({
  id: z.number(),
  name: z.string(),
  role: z.string(),
  company: z.string(),
  specialty: z.string(),
  rating: z.number().min(0).max(5),
  reviews: z.number().int().min(0),
  price: z.number().positive(),
  location: z.string(),
  avatar: z.string().url(),
  skills: z.array(z.string()),
  bio: z.string().optional(),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    period: z.string(),
    description: z.string(),
  })).optional(),
  achievements: z.array(z.string()).optional(),
});

export type Mentor = z.infer<typeof MentorSchema>;

