import { z } from 'zod'

export const PurchaseTicketDtoSchema = z.object({
  eventId: z.string().uuid('ID do evento inválido'),
  categoryId: z.string().uuid('ID da categoria inválido'),
  paymentMethod: z.enum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'DIGITAL_WALLET']),
  installments: z.number().positive().max(12).optional(),
})

export type PurchaseTicketDto = z.infer<typeof PurchaseTicketDtoSchema>
