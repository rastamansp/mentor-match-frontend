import { z } from 'zod';
import { CreateSessionDto } from '../dto/CreateSessionDto';

export const CreateSessionSchema = z.object({
  mentorId: z.string().min(1, 'Mentor ID é obrigatório'),
  date: z.string().refine((val) => {
    // Aceita tanto ISO datetime quanto apenas data (YYYY-MM-DD)
    // Se for ISO datetime, extrai apenas a data
    if (val.includes('T')) {
      return true; // É um ISO datetime válido
    }
    // Valida formato de data YYYY-MM-DD
    return /^\d{4}-\d{2}-\d{2}$/.test(val);
  }, 'Formato de data inválido. Use YYYY-MM-DD ou ISO datetime'),
  time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:MM)'),
  topic: z.string().min(3, 'Tópico deve ter no mínimo 3 caracteres'),
  notes: z.string().optional(),
  timezone: z.string().optional(), // Opcional, padrão "America/Sao_Paulo"
});

export function validateCreateSession(data: unknown): CreateSessionDto {
  return CreateSessionSchema.parse(data);
}

