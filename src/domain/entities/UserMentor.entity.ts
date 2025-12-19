import { z } from 'zod';
import { Mentor, MentorSchema } from './Mentor.entity';

export const UserMentorSchema = z.object({
  id: z.string(),
  mentorId: z.string(),
  userId: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  subscriptionId: z.string().optional(),
  mentor: MentorSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserMentor = z.infer<typeof UserMentorSchema>;
