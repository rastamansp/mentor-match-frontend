import { z } from 'zod';

export const SessionSchema = z.object({
  id: z.string(),
  mentorId: z.string(),
  mentorName: z.string(),
  mentorAvatar: z.string().url().nullable().optional(),
  userId: z.string(),
  date: z.string().refine((val) => {
    // Aceita tanto ISO datetime quanto apenas data (YYYY-MM-DD)
    if (val.includes('T')) {
      return true; // É um ISO datetime válido
    }
    // Valida formato de data YYYY-MM-DD
    return /^\d{4}-\d{2}-\d{2}$/.test(val);
  }, 'Formato de data inválido'),
  time: z.string(),
  topic: z.string(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  price: z.number().positive(),
  createdAt: z.string().datetime(),
});

export type Session = z.infer<typeof SessionSchema>;

