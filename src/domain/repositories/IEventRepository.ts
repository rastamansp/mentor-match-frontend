import { Event } from '../entities/Event.entity'

export interface IEventRepository {
  findAll(filters?: EventFilters): Promise<Event[]>
  findById(id: string): Promise<Event | null>
  create(data: CreateEventData): Promise<Event>
  update(id: string, data: UpdateEventData): Promise<Event>
  delete(id: string): Promise<void>
}

export interface EventFilters {
  category?: string
  city?: string
  status?: string
  search?: string
}

export interface CreateEventData {
  title: string
  description: string
  date: string
  location: string
  address: string
  city: string
  state: string
  category: string
  maxCapacity: number
  image?: string
}

export interface UpdateEventData extends Partial<CreateEventData> {}
