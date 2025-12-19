import { z } from 'zod';
import { UpdateSessionDto } from '../dto/UpdateSessionDto';

export const UpdateSessionSchema = z.object({
  scheduledAt: z.string().datetime('Data/hora agendada deve ser um datetime ISO válido'),
  duration: z.number().int().positive('Duração deve ser um número positivo').optional(),
  notes: z.string().optional(),
});

export function validateUpdateSession(data: unknown): UpdateSessionDto {
  return UpdateSessionSchema.parse(data);
}
