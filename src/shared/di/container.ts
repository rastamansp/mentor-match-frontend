import axios from 'axios'
import { EventRepository } from '../../infrastructure/repositories/EventRepository'
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository'
import { TicketRepository } from '../../infrastructure/repositories/TicketRepository'
import { PaymentRepository } from '../../infrastructure/repositories/PaymentRepository'
import { AdminRepository } from '../../infrastructure/repositories/AdminRepository'
import { SentryLogger } from '../../infrastructure/logging/SentryLogger'
import { ListEventsUseCase } from '../../application/use-cases/events/ListEvents.usecase'
import { GetEventByIdUseCase } from '../../application/use-cases/events/GetEventById.usecase'
import { CreateEventUseCase } from '../../application/use-cases/events/CreateEvent.usecase'
import { UpdateEventUseCase } from '../../application/use-cases/events/UpdateEvent.usecase'
import { DeleteEventUseCase } from '../../application/use-cases/events/DeleteEvent.usecase'
import { LoginUseCase } from '../../application/use-cases/auth/Login.usecase'
import { RegisterUseCase } from '../../application/use-cases/auth/Register.usecase'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para lidar com respostas de erro
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const logger = new SentryLogger(import.meta.env.DEV)

// Repositories
const eventRepository = new EventRepository(httpClient)
const authRepository = new AuthRepository(httpClient)
const ticketRepository = new TicketRepository(httpClient)
const paymentRepository = new PaymentRepository(httpClient)
const adminRepository = new AdminRepository(httpClient)

// Use Cases
const listEventsUseCase = new ListEventsUseCase(eventRepository, logger)
const getEventByIdUseCase = new GetEventByIdUseCase(eventRepository, logger)
const createEventUseCase = new CreateEventUseCase(eventRepository, logger)
const updateEventUseCase = new UpdateEventUseCase(eventRepository, logger)
const deleteEventUseCase = new DeleteEventUseCase(eventRepository, logger)
const loginUseCase = new LoginUseCase(authRepository, logger)
const registerUseCase = new RegisterUseCase(authRepository, logger)

export const container = {
  // Repositories
  eventRepository,
  authRepository,
  ticketRepository,
  paymentRepository,
  adminRepository,
  
  // Use Cases
  listEventsUseCase,
  getEventByIdUseCase,
  createEventUseCase,
  updateEventUseCase,
  deleteEventUseCase,
  loginUseCase,
  registerUseCase,
  
  // Logger
  logger,
}
