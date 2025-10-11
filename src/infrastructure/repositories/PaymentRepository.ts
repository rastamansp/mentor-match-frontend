import { IPaymentRepository, PaymentFilters, CreatePaymentData, PaymentStats } from '../../domain/repositories/IPaymentRepository'
import { Payment } from '../../domain/entities/Payment.entity'
import { NotFoundError, NetworkError } from '../../domain/errors/DomainError'
import axios, { AxiosInstance } from 'axios'

export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async findAll(filters?: PaymentFilters): Promise<Payment[]> {
    try {
      const response = await this.httpClient.get('/payments', { params: filters })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to fetch payments: ${error.message}`, error)
      }
      throw error
    }
  }

  async findById(id: string): Promise<Payment | null> {
    try {
      const response = await this.httpClient.get(`/payments/${id}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Payment', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to fetch payment: ${error.message}`, error)
      }
      throw error
    }
  }

  async create(data: CreatePaymentData): Promise<Payment> {
    try {
      const response = await this.httpClient.post('/payments', data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to create payment: ${error.message}`, error)
      }
      throw error
    }
  }

  async approve(id: string): Promise<Payment> {
    try {
      const response = await this.httpClient.put(`/payments/${id}/approve`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Payment', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to approve payment: ${error.message}`, error)
      }
      throw error
    }
  }

  async reject(id: string): Promise<Payment> {
    try {
      const response = await this.httpClient.put(`/payments/${id}/reject`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Payment', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to reject payment: ${error.message}`, error)
      }
      throw error
    }
  }

  async refund(id: string): Promise<Payment> {
    try {
      const response = await this.httpClient.put(`/payments/${id}/refund`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Payment', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to refund payment: ${error.message}`, error)
      }
      throw error
    }
  }

  async getStats(): Promise<PaymentStats> {
    try {
      const response = await this.httpClient.get('/payments/stats')
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to get payment stats: ${error.message}`, error)
      }
      throw error
    }
  }
}
