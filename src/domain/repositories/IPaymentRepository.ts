import { Payment } from '../entities/Payment.entity'

export interface IPaymentRepository {
  findAll(filters?: PaymentFilters): Promise<Payment[]>
  findById(id: string): Promise<Payment | null>
  create(data: CreatePaymentData): Promise<Payment>
  approve(id: string): Promise<Payment>
  reject(id: string): Promise<Payment>
  refund(id: string): Promise<Payment>
  getStats(): Promise<PaymentStats>
}

export interface PaymentFilters {
  userId?: string
  ticketId?: string
  status?: string
}

export interface CreatePaymentData {
  ticketId: string
  userId: string
  amount: number
  method: string
  installments?: number
}

export interface PaymentStats {
  total: number
  pending: number
  approved: number
  rejected: number
  refunded: number
  totalAmount: number
}
