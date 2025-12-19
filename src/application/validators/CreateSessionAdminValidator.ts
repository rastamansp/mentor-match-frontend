import { z } from 'zod';
import { CreateSessionAdminDto } from '../dto/CreateSessionAdminDto';

export const CreateSessionAdminSchema = z.object({
  mentorId: z.string().min(1, 'ID do mentor é obrigatório'),
  planId: z.string().nullable().optional(),
  scheduledAt: z.string().datetime('Data/hora agendada deve ser um datetime ISO válido'),
  duration: z.number().int().positive('Duração deve ser um número positivo'),
  notes: z.string().optional(),
});

export function validateCreateSessionAdmin(data: unknown): CreateSessionAdminDto {
  return CreateSessionAdminSchema.parse(data);
}
