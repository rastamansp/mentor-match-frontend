import { Product } from '../entities/Product.entity'

export interface IProductRepository {
  findAllByEvent(eventId: string, activeOnly?: boolean): Promise<Product[]>
  findById(id: string): Promise<Product | null>
  create(data: CreateProductData): Promise<Product>
  update(id: string, data: UpdateProductData): Promise<Product>
  delete(id: string): Promise<void>
}

export interface ProductFilters {
  category?: 'BEBIDA' | 'ALIMENTO'
  isActive?: boolean
  search?: string
}

export interface CreateProductData {
  eventId: string
  name: string
  description?: string
  price: number
  category: 'BEBIDA' | 'ALIMENTO'
  image?: string
  isActive?: boolean
}

export interface UpdateProductData extends Partial<Omit<CreateProductData, 'eventId'>> {}

