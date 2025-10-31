import { IEventRepository, EventFilters, CreateEventData, UpdateEventData, CreateTicketCategoryData, UpdateTicketCategoryData } from '../../domain/repositories/IEventRepository'
import { Event } from '../../domain/entities/Event.entity'
import { TicketCategory } from '../../domain/entities/Ticket.entity'
import { NotFoundError, NetworkError } from '../../domain/errors/DomainError'
import axios, { AxiosInstance } from 'axios'

export class EventRepository implements IEventRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async findAll(filters?: EventFilters): Promise<Event[]> {
    try {
      const response = await this.httpClient.get('/events', { params: filters })
      
      // Garantir que a resposta seja sempre um array
      const data = response.data
      if (Array.isArray(data)) {
        return data
      }
      
      // Se a resposta for um objeto com propriedade data ou events, usar isso
      if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) {
          return data.data
        }
        if (Array.isArray(data.events)) {
          return data.events
        }
      }
      
      // Se nada funcionar, retornar array vazio
      return []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to fetch events: ${error.message}`, error)
      }
      throw error
    }
  }

  async findById(id: string): Promise<Event | null> {
    try {
      const response = await this.httpClient.get(`/events/${id}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Event', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to fetch event: ${error.message}`, error)
      }
      throw error
    }
  }

  async create(data: CreateEventData): Promise<Event> {
    try {
      const response = await this.httpClient.post('/events', data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to create event: ${error.message}`, error)
      }
      throw error
    }
  }

  async update(id: string, data: UpdateEventData): Promise<Event> {
    try {
      const response = await this.httpClient.put(`/events/${id}`, data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Event', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to update event: ${error.message}`, error)
      }
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`/events/${id}`)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Event', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to delete event: ${error.message}`, error)
      }
      throw error
    }
  }

  async getTicketCategories(eventId: string): Promise<TicketCategory[]> {
    try {
      const response = await this.httpClient.get(`/events/${eventId}/ticket-categories`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Event', eventId)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to fetch ticket categories: ${error.message}`, error)
      }
      throw error
    }
  }

  async createTicketCategory(eventId: string, data: CreateTicketCategoryData): Promise<TicketCategory> {
    try {
      const response = await this.httpClient.post(`/events/${eventId}/ticket-categories`, data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to create ticket category: ${error.message}`, error)
      }
      throw error
    }
  }

  async updateTicketCategory(categoryId: string, data: UpdateTicketCategoryData): Promise<TicketCategory> {
    try {
      const response = await this.httpClient.put(`/events/ticket-categories/${categoryId}`, data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Ticket Category', categoryId)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to update ticket category: ${error.message}`, error)
      }
      throw error
    }
  }

  async deleteTicketCategory(categoryId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/events/ticket-categories/${categoryId}`)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Ticket Category', categoryId)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to delete ticket category: ${error.message}`, error)
      }
      throw error
    }
  }
}
