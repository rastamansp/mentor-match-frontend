import { IEventRepository, EventFilters, CreateEventData, UpdateEventData } from '../../domain/repositories/IEventRepository'
import { Event } from '../../domain/entities/Event.entity'
import { NotFoundError, NetworkError } from '../../domain/errors/DomainError'
import axios, { AxiosInstance } from 'axios'

export class EventRepository implements IEventRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async findAll(filters?: EventFilters): Promise<Event[]> {
    try {
      const response = await this.httpClient.get('/events', { params: filters })
      return response.data
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
}
