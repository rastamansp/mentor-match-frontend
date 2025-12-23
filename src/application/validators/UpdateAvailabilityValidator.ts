import { z } from 'zod';
import { UpdateAvailabilityDto } from '../dto/UpdateAvailabilityDto';

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/; // HH:mm formato

export const UpdateAvailabilitySchema = z.object({
  dayOfWeek: z.number()
    .int('Dia da semana deve ser um número inteiro')
    .min(0, 'Dia da semana deve ser entre 0 e 6')
    .max(6, 'Dia da semana deve ser entre 0 e 6')
    .optional(),
  startTime: z.string()
    .regex(timeRegex, 'Horário de início deve estar no formato HH:mm (ex: 09:00)')
    .optional(),
  endTime: z.string()
    .regex(timeRegex, 'Horário de fim deve estar no formato HH:mm (ex: 18:00)')
    .optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  // Valida que endTime é posterior a startTime apenas se ambos estiverem presentes
  if (data.startTime && data.endTime) {
    const [startHours, startMinutes] = data.startTime.split(':').map(Number);
    const [endHours, endMinutes] = data.endTime.split(':').map(Number);
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;
    return endTotal > startTotal;
  }
  return true;
}, {
  message: 'Horário de fim deve ser posterior ao horário de início',
  path: ['endTime'],
});

export function validateUpdateAvailability(dto: UpdateAvailabilityDto): UpdateAvailabilityDto {
  return UpdateAvailabilitySchema.parse(dto);
}
