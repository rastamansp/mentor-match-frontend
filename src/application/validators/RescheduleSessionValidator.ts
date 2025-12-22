import { z } from 'zod';
import { RescheduleSessionDto } from '../dto/RescheduleSessionDto';

export const RescheduleSessionSchema = z.object({
  newStartAtUtc: z.string().datetime('Data/hora de início deve ser um datetime ISO UTC válido'),
  newEndAtUtc: z.string().datetime('Data/hora de término deve ser um datetime ISO UTC válido'),
  timezone: z.string().min(1, 'Timezone é obrigatório'),
  reason: z.string().optional(),
});

export function validateRescheduleSession(data: unknown): RescheduleSessionDto {
  return RescheduleSessionSchema.parse(data);
}
