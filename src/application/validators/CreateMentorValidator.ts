import { z } from 'zod';
import { CreateMentorDto } from '../dto/CreateMentorDto';

const ExperienceSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  company: z.string().min(1, 'Empresa é obrigatória'),
  period: z.string().min(1, 'Período é obrigatório'),
  description: z.string().optional(),
});

export const CreateMentorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  specialty: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  avatar: z.union([z.string().url('Avatar deve ser uma URL válida'), z.null()]).optional(),
  areas: z.array(z.string()).nullable().optional(),
  skills: z.array(z.string()).nullable().optional(),
  languages: z.array(z.string()).optional(),
  achievements: z.array(z.string()).nullable().optional(),
  experience: z.array(ExperienceSchema).nullable().optional(),
  pricePerHour: z.number().min(0, 'Preço por hora deve ser maior ou igual a 0').optional(),
  status: z.string().optional(),
});

export function validateCreateMentor(dto: CreateMentorDto): CreateMentorDto {
  return CreateMentorSchema.parse(dto);
}
