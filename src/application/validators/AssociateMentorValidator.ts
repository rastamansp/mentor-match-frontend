import { z } from 'zod';
import { AssociateMentorDto } from '../dto/AssociateMentorDto';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const AssociateMentorSchema = z.object({
  mentorId: z.string().regex(uuidRegex, 'ID do mentor deve ser um UUID válido'),
  subscriptionId: z.string().regex(uuidRegex, 'ID da assinatura deve ser um UUID válido').optional(),
});

export function validateAssociateMentor(data: unknown): AssociateMentorDto {
  return AssociateMentorSchema.parse(data);
}
