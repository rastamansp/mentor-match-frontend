import { z } from 'zod'
import { ProductSchema, Product } from './Product.entity'

export const ProductOrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  eventId: z.string().uuid(),
  ticketId: z.string().uuid().optional(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  total: z.number().positive(),
  purchaseDate: z.string().datetime(),
  product: ProductSchema,
})

export type ProductOrder = z.infer<typeof ProductOrderSchema>

export class ProductOrderEntity {
  constructor(private readonly data: ProductOrder) {}

  get id(): string { return this.data.id }
  get userId(): string { return this.data.userId }
  get eventId(): string { return this.data.eventId }
  get productId(): string { return this.data.productId }
  get quantity(): number { return this.data.quantity }
  get price(): number { return this.data.price }
  get total(): number { return this.data.total }
  get purchaseDate(): string { return this.data.purchaseDate }
  get product(): Product { return this.data.product }

  toJSON(): ProductOrder {
    return this.data
  }
}

