import { z } from 'zod'

export enum ProductCategory {
  BEBIDA = 'BEBIDA',
  ALIMENTO = 'ALIMENTO',
}

export const ProductSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.union([z.string(), z.null()]).optional(),
  price: z.number().positive().min(0.01),
  category: z.enum(['BEBIDA', 'ALIMENTO']),
  image: z.union([z.string().url(), z.string(), z.null()]).optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Product = z.infer<typeof ProductSchema>

export class ProductEntity {
  constructor(private readonly data: Product) {}

  get id(): string { return this.data.id }
  get eventId(): string { return this.data.eventId }
  get name(): string { return this.data.name }
  get description(): string | undefined { return this.data.description ?? undefined }
  get price(): number { return this.data.price }
  get category(): ProductCategory { return this.data.category as ProductCategory }
  get image(): string | undefined { return this.data.image ?? undefined }
  get isActive(): boolean { return this.data.isActive }
  get createdAt(): string { return this.data.createdAt }
  get updatedAt(): string { return this.data.updatedAt }

  isBeverage(): boolean {
    return this.data.category === ProductCategory.BEBIDA
  }

  isFood(): boolean {
    return this.data.category === ProductCategory.ALIMENTO
  }

  hasImage(): boolean {
    return !!this.data.image
  }

  getFormattedPrice(): string {
    return this.data.price.toFixed(2).replace('.', ',')
  }

  toJSON(): Product {
    return this.data
  }
}

