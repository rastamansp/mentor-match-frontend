import { z } from 'zod';
import { CreateSessionDto } from '../dto/CreateSessionDto';

export const CreateSessionSchema = z.object({
  mentorId: z.number().int().positive(),
  date: z.string().datetime(),
  time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:MM)'),
  topic: z.string().min(3, 'Tópico deve ter no mínimo 3 caracteres'),
  notes: z.string().optional(),
});

export function validateCreateSession(data: unknown): CreateSessionDto {
  return CreateSessionSchema.parse(data);
}

