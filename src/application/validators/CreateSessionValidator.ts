import { z } from 'zod';
import { CreateSessionDto } from '../dto/CreateSessionDto';

export const CreateSessionSchema = z.object({
  mentorId: z.string().min(1, 'Mentor ID é obrigatório'),
  // Opção 1: scheduledAt em UTC + timezone
  scheduledAt: z.string().datetime('scheduledAt deve ser um datetime ISO válido em UTC').optional(),
  timezone: z.string().optional(),
  // Opção 2: date + time (para compatibilidade)
  date: z.string().refine((val) => {
    if (!val) return true; // Opcional se scheduledAt for fornecido
    // Aceita tanto ISO datetime quanto apenas data (YYYY-MM-DD)
    if (val.includes('T')) {
      return true; // É um ISO datetime válido
    }
    // Valida formato de data YYYY-MM-DD
    return /^\d{4}-\d{2}-\d{2}$/.test(val);
  }, 'Formato de data inválido. Use YYYY-MM-DD ou ISO datetime').optional(),
  time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:MM)').optional(),
  topic: z.string().min(3, 'Tópico deve ter no mínimo 3 caracteres'),
  notes: z.string().optional(),
}).refine((data) => {
  // Se scheduledAt for fornecido, timezone deve ser fornecido também
  if (data.scheduledAt && !data.timezone) {
    return false;
  }
  // Se scheduledAt não for fornecido, date e time devem ser fornecidos
  if (!data.scheduledAt && (!data.date || !data.time)) {
    return false;
  }
  return true;
}, {
  message: 'Forneça scheduledAt + timezone OU date + time',
  path: ['scheduledAt']
});

export function validateCreateSession(data: unknown): CreateSessionDto {
  return CreateSessionSchema.parse(data);
}

