import { z } from 'zod'

export const CreateEventDtoSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(200),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  date: z.string().datetime('Data inválida'),
  location: z.string().min(3, 'Local deve ter no mínimo 3 caracteres'),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  city: z.string().min(2, 'Cidade deve ter no mínimo 2 caracteres'),
  state: z.string().min(2, 'Estado deve ter no mínimo 2 caracteres'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  maxCapacity: z.number().positive('Capacidade deve ser maior que zero'),
  image: z.string().url('URL da imagem inválida').optional(),
})

export type CreateEventDto = z.infer<typeof CreateEventDtoSchema>
