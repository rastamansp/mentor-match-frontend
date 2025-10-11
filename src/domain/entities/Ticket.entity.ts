import { z } from 'zod'

export const TicketCategorySchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  price: z.number().positive(),
  maxQuantity: z.number().int().positive(),
  soldQuantity: z.number().int().min(0),
  benefits: z.array(z.string()),
  isActive: z.boolean(),
})

export type TicketCategory = z.infer<typeof TicketCategorySchema>

export const TicketSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  eventTitle: z.string(),
  eventDate: z.string().datetime(),
  eventLocation: z.string(),
  categoryId: z.string().uuid(),
  categoryName: z.string(),
  userId: z.string().uuid(),
  userName: z.string(),
  userEmail: z.string().email(),
  price: z.number().positive(),
  qrCode: z.string(),
  qrCodeData: z.string(),
  status: z.enum(['ACTIVE', 'USED', 'CANCELLED', 'TRANSFERRED']),
  purchaseDate: z.string().datetime(),
  usedDate: z.string().datetime().optional(),
  transferDate: z.string().datetime().optional(),
  transferredTo: z.string().optional(),
})

export type Ticket = z.infer<typeof TicketSchema>

export class TicketEntity {
  constructor(private readonly data: Ticket) {}

  get id(): string { return this.data.id }
  get eventId(): string { return this.data.eventId }
  get eventTitle(): string { return this.data.eventTitle }
  get eventDate(): string { return this.data.eventDate }
  get eventLocation(): string { return this.data.eventLocation }
  get categoryId(): string { return this.data.categoryId }
  get categoryName(): string { return this.data.categoryName }
  get userId(): string { return this.data.userId }
  get userName(): string { return this.data.userName }
  get userEmail(): string { return this.data.userEmail }
  get price(): number { return this.data.price }
  get qrCode(): string { return this.data.qrCode }
  get qrCodeData(): string { return this.data.qrCodeData }
  get status(): string { return this.data.status }
  get purchaseDate(): string { return this.data.purchaseDate }
  get usedDate(): string | undefined { return this.data.usedDate }
  get transferDate(): string | undefined { return this.data.transferDate }
  get transferredTo(): string | undefined { return this.data.transferredTo }

  isActive(): boolean {
    return this.data.status === 'ACTIVE'
  }

  isUsed(): boolean {
    return this.data.status === 'USED'
  }

  isCancelled(): boolean {
    return this.data.status === 'CANCELLED'
  }

  isTransferred(): boolean {
    return this.data.status === 'TRANSFERRED'
  }

  canBeUsed(): boolean {
    return this.isActive() && new Date(this.data.eventDate) > new Date()
  }

  canBeTransferred(): boolean {
    return this.isActive() && new Date(this.data.eventDate) > new Date()
  }

  canBeCancelled(): boolean {
    return this.isActive() && new Date(this.data.eventDate) > new Date()
  }

  isEventPast(): boolean {
    return new Date(this.data.eventDate) < new Date()
  }

  toJSON(): Ticket {
    return this.data
  }
}
