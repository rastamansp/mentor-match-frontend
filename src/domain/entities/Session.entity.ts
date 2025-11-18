import { z } from 'zod';

export const SessionSchema = z.object({
  id: z.string(),
  mentorId: z.number(),
  mentorName: z.string(),
  mentorAvatar: z.string().url(),
  userId: z.string(),
  date: z.string().datetime(),
  time: z.string(),
  topic: z.string(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  price: z.number().positive(),
  createdAt: z.string().datetime(),
});

export type Session = z.infer<typeof SessionSchema>;

