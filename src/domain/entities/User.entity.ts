import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['USER', 'ADMIN', 'MENTOR']),
  phone: z.string().nullable().optional(), // Aceita string, null ou undefined
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

