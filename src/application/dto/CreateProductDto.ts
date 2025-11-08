import { z } from 'zod'

// Transformar strings vazias em undefined
const emptyStringToUndefined = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.string().optional()
)

const urlOrEmpty = z.union([
  z.string().url('URL inválida'),
  z.literal(''),
  z.undefined()
]).transform(val => val === '' ? undefined : val)

export const CreateProductDtoSchema = z.object({
  eventId: z.string().uuid('ID do evento inválido'),
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  description: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional()
  ),
  price: z.number()
    .positive('Preço deve ser positivo')
    .min(0.01, 'Preço mínimo é R$ 0,01')
    .refine((val) => {
      // Verificar se tem no máximo 2 casas decimais
      const decimalPlaces = (val.toString().split('.')[1] || '').length
      return decimalPlaces <= 2
    }, 'Preço deve ter no máximo 2 casas decimais'),
  category: z.enum(['BEBIDA', 'ALIMENTO'], {
    errorMap: () => ({ message: 'Categoria deve ser BEBIDA ou ALIMENTO' })
  }),
  image: urlOrEmpty,
  isActive: z.boolean().optional().default(true),
})

export type CreateProductDto = z.infer<typeof CreateProductDtoSchema>

