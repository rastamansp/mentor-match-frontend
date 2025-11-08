import { AxiosInstance } from 'axios'
import { IProductOrderRepository } from '../../domain/repositories/IProductOrderRepository'
import { ProductOrder } from '../../domain/entities/ProductOrder.entity'
import { NetworkError } from '../../domain/errors/DomainError'
import axios from 'axios'

interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  qrCodeData?: string
  qrCodeImage?: string
  status: string
  validatedAt?: string
  validatedBy?: string
  createdAt: string
  updatedAt: string
  product?: {
    id: string
    eventId: string
    name: string
    description?: string
    price: number
    category: string
    image?: string
    isActive: boolean
    createdAt?: string
    updatedAt?: string
  }
}

interface Order {
  id: string
  userId: string
  eventId: string
  ticketId: string
  totalAmount: number
  status: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export class ProductOrderRepository implements IProductOrderRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async findByUserId(_userId: string): Promise<ProductOrder[]> {
    try {
      // Buscar todos os pedidos do usuário através dos eventos
      // Como não há endpoint direto, vamos buscar por eventos conhecidos
      // Por enquanto, retornar array vazio e deixar o use case buscar por evento
      return []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return []
        }
        throw new NetworkError(`Failed to fetch product orders: ${error.message}`, error)
      }
      throw error
    }
  }

  async findByEventId(eventId: string, _userId?: string): Promise<ProductOrder[]> {
    try {
      const response = await this.httpClient.get(`/orders/event/${eventId}`)
      const orders: Order[] = Array.isArray(response.data) ? response.data : []
      
      // Converter orders e items para ProductOrder[]
      const productOrders: ProductOrder[] = []
      
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.product) {
            productOrders.push({
              id: item.id,
              userId: order.userId,
              eventId: order.eventId,
              ticketId: order.ticketId,
              productId: item.productId,
              quantity: item.quantity,
              price: item.unitPrice,
              total: item.totalPrice,
              purchaseDate: order.createdAt,
              product: {
                ...item.product,
                createdAt: item.product.createdAt || order.createdAt,
                updatedAt: item.product.updatedAt || order.updatedAt,
                category: item.product.category as 'BEBIDA' | 'ALIMENTO',
                description: item.product.description || null,
                image: item.product.image || null,
              }
            })
          }
        })
      })
      
      return productOrders
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return []
        }
        throw new NetworkError(`Failed to fetch product orders for event: ${error.message}`, error)
      }
      throw error
    }
  }

  async findByOrderId(orderId: string): Promise<ProductOrder[]> {
    try {
      const response = await this.httpClient.get(`/orders/${orderId}`)
      const order: Order = response.data
      
      // Converter items do pedido para ProductOrder[]
      const productOrders: ProductOrder[] = []
      
      if (order.items) {
        order.items.forEach(item => {
          if (item.product) {
            productOrders.push({
              id: item.id,
              userId: order.userId,
              eventId: order.eventId,
              ticketId: order.ticketId,
              productId: item.productId,
              quantity: item.quantity,
              price: item.unitPrice,
              total: item.totalPrice,
              purchaseDate: order.createdAt,
              product: {
                ...item.product,
                createdAt: item.product.createdAt || order.createdAt,
                updatedAt: item.product.updatedAt || order.updatedAt,
                category: item.product.category as 'BEBIDA' | 'ALIMENTO',
                description: item.product.description || null,
                image: item.product.image || null,
              }
            })
          }
        })
      }
      
      return productOrders
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return []
        }
        throw new NetworkError(`Failed to fetch product orders by order ID: ${error.message}`, error)
      }
      throw error
    }
  }
}

