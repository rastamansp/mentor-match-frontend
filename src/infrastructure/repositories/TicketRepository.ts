import { ITicketRepository, TicketFilters, CreateTicketData, ValidationResponse, TransferData, TicketStats, PurchaseTicketRequest } from '../../domain/repositories/ITicketRepository'
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

  async findMyTickets(): Promise<Ticket[]> {
    try {
      console.log('🎫 TicketRepository.findMyTickets - Chamando endpoint /tickets/my-tickets')
      
      const response = await this.httpClient.get('/tickets/my-tickets')
      
      console.log('✅ TicketRepository.findMyTickets - Resposta recebida:', response.data)
      console.log('✅ TicketRepository.findMyTickets - Tipo de resposta:', typeof response.data)
      console.log('✅ TicketRepository.findMyTickets - É array?', Array.isArray(response.data))
      
      // O backend pode retornar {tickets: []} ou []
      const data = response.data
      if (Array.isArray(data)) {
        return data
      } else if (data.tickets && Array.isArray(data.tickets)) {
        console.log('📦 Extraindo array de tickets do objeto')
        return data.tickets
      } else {
        console.error('❌ Formato de resposta inválido:', data)
        return []
      }
    } catch (error) {
      console.error('❌ TicketRepository.findMyTickets - Erro:', error)
      if (axios.isAxiosError(error)) {
        console.error('❌ Status:', error.response?.status)
        console.error('❌ Data:', error.response?.data)
        throw new NetworkError(`Failed to fetch my tickets: ${error.message}`, error)
      }
      throw error
    }
  }

  async generateQRCode(ticketId: string): Promise<{ ticketId: string; ticketCode: string; qrCode: string; url: string }> {
    try {
      const response = await this.httpClient.get(`/tickets/${ticketId}/qrcode`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Ticket', ticketId)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to generate QR code: ${error.message}`, error)
      }
      throw error
    }
  }

  async buyTickets(data: PurchaseTicketRequest): Promise<Ticket[]> {
    try {
      console.log('🎫 TicketRepository.buyTickets - Enviando dados:', data)
      console.log('🎫 URL:', '/tickets')
      
      const response = await this.httpClient.post('/tickets', data)
      
      console.log('✅ TicketRepository.buyTickets - Resposta recebida:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ TicketRepository.buyTickets - Erro:', error)
      if (axios.isAxiosError(error)) {
        console.error('❌ Status:', error.response?.status)
        console.error('❌ Data:', error.response?.data)
        console.error('❌ Headers:', error.response?.headers)
        throw new NetworkError(`Failed to buy tickets: ${error.message}`, error)
      }
      throw error
    }
  }

  async validateByCode(code: string, apiKey: string): Promise<ValidationResponse> {
    try {
      const response = await this.httpClient.get(`/tickets/validate`, { 
        params: { code, apiKey }
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to validate ticket by code: ${error.message}`, error)
      }
      throw error
    }
  }
}
