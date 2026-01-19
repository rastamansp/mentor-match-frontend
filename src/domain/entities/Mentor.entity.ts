import { z } from 'zod';

export const MentorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  specialty: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  avatar: z.union([z.string().url(), z.null()]).optional(),
  areas: z.array(z.string()).nullable().optional(),
  skills: z.array(z.string()).nullable().optional(),
  languages: z.array(z.string()),
  achievements: z.array(z.string()).nullable().optional(),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    period: z.string(),
    description: z.string(),
  })).nullable().optional(),
  pricePerHour: z.number().min(0),
  price: z.number().min(0).optional(), // Mantido para compatibilidade
  status: z.string(),
  rating: z.number().nullable().optional(),
  reviews: z.number().int().min(0).optional(),
  totalSessions: z.number().int().min(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Mentor = z.infer<typeof MentorSchema>;

