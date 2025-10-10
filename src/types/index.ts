export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'USER' | 'ORGANIZER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  address: string
  city: string
  state: string
  image: string
  category: string
  organizerId: string
  organizerName: string
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'SOLD_OUT'
  maxCapacity: number
  soldTickets: number
  createdAt: string
  updatedAt: string
}

export interface TicketCategory {
  id: string
  eventId: string
  name: string
  description: string
  price: number
  maxQuantity: number
  soldQuantity: number
  benefits: string[]
  isActive: boolean
}

export interface Ticket {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  categoryId: string
  categoryName: string
  userId: string
  userName: string
  userEmail: string
  price: number
  qrCode: string
  qrCodeData: string
  status: 'ACTIVE' | 'USED' | 'CANCELLED' | 'TRANSFERRED'
  purchaseDate: string
  usedDate?: string
  transferDate?: string
  transferredTo?: string
}

export interface Payment {
  id: string
  ticketId: string
  userId: string
  amount: number
  method: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'DIGITAL_WALLET'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED'
  pixCode?: string
  pixQrCode?: string
  installments?: number
  transactionId?: string
  createdAt: string
  approvedAt?: string
  refundedAt?: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}

export interface LoginData {
  email: string
  password: string
}
