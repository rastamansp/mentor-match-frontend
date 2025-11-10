import { z } from 'zod'

export const CreateTicketCategoryDtoSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres').max(500),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  maxQuantity: z.number().int().positive('Quantidade máxima deve ser maior que zero'),
  benefits: z.array(z.string().min(1, 'Benefício não pode estar vazio')).optional(),
  isActive: z.boolean().optional(),
})

export type CreateTicketCategoryDto = z.infer<typeof CreateTicketCategoryDtoSchema>

