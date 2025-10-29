import { z } from 'zod'

export const ParticipantDataSchema = z.object({
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres').max(100, 'Sobrenome muito longo'),
  email: z.string().email('Email inválido'),
  document: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido. Use o formato 000.000.000-00'),
})

export type ParticipantData = z.infer<typeof ParticipantDataSchema>

