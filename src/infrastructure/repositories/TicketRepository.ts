import { ITicketRepository, TicketFilters, CreateTicketData, ValidationResponse, TransferData, TicketStats } from '../../domain/repositories/ITicketRepository'
import { Ticket } from '../../domain/entities/Ticket.entity'
import { NotFoundError, NetworkError } from '../../domain/errors/DomainError'
import axios, { AxiosInstance } from 'axios'

export class TicketRepository implements ITicketRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async findAll(filters?: TicketFilters): Promise<Ticket[]> {
    try {
      const response = await this.httpClient.get('/tickets', { params: filters })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to fetch tickets: ${error.message}`, error)
      }
      throw error
    }
  }

  async findById(id: string): Promise<Ticket | null> {
    try {
      const response = await this.httpClient.get(`/tickets/${id}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Ticket', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to fetch ticket: ${error.message}`, error)
      }
      throw error
    }
  }

  async create(data: CreateTicketData): Promise<Ticket> {
    try {
      const response = await this.httpClient.post('/tickets', data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to create ticket: ${error.message}`, error)
      }
      throw error
    }
  }

  async validate(id: string, qrCodeData: string): Promise<ValidationResponse> {
    try {
      const response = await this.httpClient.post(`/tickets/${id}/validate`, { qrCodeData })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to validate ticket: ${error.message}`, error)
      }
      throw error
    }
  }

  async use(id: string): Promise<Ticket> {
    try {
      const response = await this.httpClient.put(`/tickets/${id}/use`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Ticket', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to use ticket: ${error.message}`, error)
      }
      throw error
    }
  }

  async transfer(id: string, data: TransferData): Promise<Ticket> {
    try {
      const response = await this.httpClient.put(`/tickets/${id}/transfer`, data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Ticket', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to transfer ticket: ${error.message}`, error)
      }
      throw error
    }
  }

  async cancel(id: string): Promise<Ticket> {
    try {
      const response = await this.httpClient.put(`/tickets/${id}/cancel`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Ticket', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to cancel ticket: ${error.message}`, error)
      }
      throw error
    }
  }

  async getStats(eventId?: string): Promise<TicketStats> {
    try {
      const response = await this.httpClient.get('/tickets/stats', { params: { eventId } })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to get ticket stats: ${error.message}`, error)
      }
      throw error
    }
  }
}
