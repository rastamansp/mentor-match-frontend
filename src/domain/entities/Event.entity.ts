import { z } from 'zod'

export const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  date: z.string().datetime(),
  location: z.string().min(3),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  category: z.enum(['MUSIC', 'SPORTS', 'CULTURE', 'BUSINESS', 'TECH', 'OTHER']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CANCELLED', 'SOLD_OUT']),
  maxCapacity: z.number().positive(),
  soldTickets: z.number().nonnegative(),
  organizerId: z.string().uuid(),
  organizerName: z.string(),
  image: z.string().url(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Event = z.infer<typeof EventSchema>

export class EventEntity {
  constructor(private readonly data: Event) {}

  get id(): string { return this.data.id }
  get title(): string { return this.data.title }
  get description(): string { return this.data.description }
  get date(): string { return this.data.date }
  get location(): string { return this.data.location }
  get address(): string { return this.data.address }
  get city(): string { return this.data.city }
  get state(): string { return this.data.state }
  get category(): string { return this.data.category }
  get status(): string { return this.data.status }
  get maxCapacity(): number { return this.data.maxCapacity }
  get soldTickets(): number { return this.data.soldTickets }
  get organizerId(): string { return this.data.organizerId }
  get organizerName(): string { return this.data.organizerName }
  get image(): string { return this.data.image }
  get createdAt(): string { return this.data.createdAt }
  get updatedAt(): string { return this.data.updatedAt }

  isActive(): boolean {
    return this.data.status === 'ACTIVE'
  }

  isSoldOut(): boolean {
    return this.data.soldTickets >= this.data.maxCapacity
  }

  hasCapacity(): boolean {
    return this.data.soldTickets < this.data.maxCapacity
  }

  getAvailableTickets(): number {
    return this.data.maxCapacity - this.data.soldTickets
  }

  getCapacityPercentage(): number {
    return (this.data.soldTickets / this.data.maxCapacity) * 100
  }

  isUpcoming(): boolean {
    return new Date(this.data.date) > new Date()
  }

  isPast(): boolean {
    return new Date(this.data.date) < new Date()
  }

  toJSON(): Event {
    return this.data
  }
}
