import { Ticket } from '../entities/Ticket.entity'

export interface ITicketRepository {
  findAll(filters?: TicketFilters): Promise<Ticket[]>
  findById(id: string): Promise<Ticket | null>
  create(data: CreateTicketData): Promise<Ticket>
  validate(id: string, qrCodeData: string): Promise<ValidationResponse>
  validateByCode(code: string, apiKey: string): Promise<ValidationResponse>
  use(id: string): Promise<Ticket>
  transfer(id: string, data: TransferData): Promise<Ticket>
  cancel(id: string): Promise<Ticket>
  getStats(eventId?: string): Promise<TicketStats>
  findMyTickets(): Promise<Ticket[]>
  generateQRCode(ticketId: string): Promise<{ ticketId: string; ticketCode: string; qrCode: string; url: string }>
  buyTickets(data: PurchaseTicketRequest): Promise<Ticket[]>
}

export interface ParticipantInfo {
  firstName: string
  lastName: string
  email: string
  document: string
}

export interface PurchaseTicketRequest {
  eventId: string
  categoryId: string
  quantity: number
  participants: ParticipantInfo[]
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'
  installments?: number
}

export interface TicketFilters {
  userId?: string
  eventId?: string
  status?: string
}

export interface CreateTicketData {
  eventId: string
  categoryId: string
  userId: string
  price: number
}

export interface ValidationResponse {
  valid: boolean
  message: string
  ticket?: Ticket
}

export interface TransferData {
  newUserEmail: string
  newUserName: string
}

export interface TicketStats {
  total: number
  active: number
  used: number
  cancelled: number
  transferred: number
}
