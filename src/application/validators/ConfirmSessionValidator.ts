import { z } from 'zod';
import { ConfirmSessionDto } from '../dto/ConfirmSessionDto';

export const ConfirmSessionSchema = z.object({
  zoomLink: z.string().url('Link do Zoom deve ser uma URL válida').optional(),
  zoomMeetingId: z.string().min(1, 'ID da reunião Zoom deve ter pelo menos 1 caractere').optional(),
});

export function validateConfirmSession(data: unknown): ConfirmSessionDto {
  return ConfirmSessionSchema.parse(data);
}
