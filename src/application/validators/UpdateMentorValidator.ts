import { z } from 'zod';
import { UpdateMentorDto } from '../dto/UpdateMentorDto';

export const UpdateMentorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  role: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  specialty: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  avatar: z.union([z.string().url('Avatar deve ser uma URL válida'), z.null()]).optional(),
  areas: z.array(z.string()).nullable().optional(),
  skills: z.array(z.string()).nullable().optional(),
  languages: z.array(z.string()).optional(),
  achievements: z.array(z.string()).nullable().optional(),
  pricePerHour: z.number().positive('Preço por hora deve ser positivo').optional(),
  status: z.string().optional(),
});

export function validateUpdateMentor(dto: UpdateMentorDto): UpdateMentorDto {
  return UpdateMentorSchema.parse(dto);
}
