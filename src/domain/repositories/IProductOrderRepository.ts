import { ProductOrder } from '../entities/ProductOrder.entity'

export interface IProductOrderRepository {
  findByUserId(userId: string): Promise<ProductOrder[]>
  findByEventId(eventId: string, userId?: string): Promise<ProductOrder[]>
  findByOrderId(orderId: string): Promise<ProductOrder[]>
}

