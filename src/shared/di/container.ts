import axios from 'axios'
import { EventRepository } from '../../infrastructure/repositories/EventRepository'
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository'
import { TicketRepository } from '../../infrastructure/repositories/TicketRepository'
import { PaymentRepository } from '../../infrastructure/repositories/PaymentRepository'
import { AdminRepository } from '../../infrastructure/repositories/AdminRepository'
import { ChatRepository } from '../../infrastructure/repositories/ChatRepository'
import { ArtistRepository } from '../../infrastructure/repositories/ArtistRepository'
import { SentryLogger } from '../../infrastructure/logging/SentryLogger'
import { ListEventsUseCase } from '../../application/use-cases/events/ListEvents.usecase'
import { GetEventByIdUseCase } from '../../application/use-cases/events/GetEventById.usecase'
import { CreateEventUseCase } from '../../application/use-cases/events/CreateEvent.usecase'
import { UpdateEventUseCase } from '../../application/use-cases/events/UpdateEvent.usecase'
import { DeleteEventUseCase } from '../../application/use-cases/events/DeleteEvent.usecase'
import { LoginUseCase } from '../../application/use-cases/auth/Login.usecase'
import { RegisterUseCase } from '../../application/use-cases/auth/Register.usecase'
import { ListArtistsUseCase } from '../../application/use-cases/artists/ListArtists.usecase'
import { CreateArtistUseCase } from '../../application/use-cases/artists/CreateArtist.usecase'
import { GetArtistByIdUseCase } from '../../application/use-cases/artists/GetArtistById.usecase'
import { UpdateArtistUseCase } from '../../application/use-cases/artists/UpdateArtist.usecase'
import { DeleteArtistUseCase } from '../../application/use-cases/artists/DeleteArtist.usecase'

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
    console.log('🔑 Token encontrado, adicionando ao header Authorization')
    config.headers.Authorization = `Bearer ${token}`
  } else {
    console.warn('⚠️ Token não encontrado no localStorage')
  }
  return config
})

// Interceptor para lidar com respostas de erro
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - Token inválido ou expirado')
      console.error('Error details:', error.response?.data)
      
      // Limpar dados de autenticação
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Apenas redirecionar se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
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
const chatRepository = new ChatRepository(httpClient)
const artistRepository = new ArtistRepository(httpClient)

// Use Cases - Events
const listEventsUseCase = new ListEventsUseCase(eventRepository, logger)
const getEventByIdUseCase = new GetEventByIdUseCase(eventRepository, logger)
const createEventUseCase = new CreateEventUseCase(eventRepository, logger)
const updateEventUseCase = new UpdateEventUseCase(eventRepository, logger)
const deleteEventUseCase = new DeleteEventUseCase(eventRepository, logger)

// Use Cases - Auth
const loginUseCase = new LoginUseCase(authRepository, logger)
const registerUseCase = new RegisterUseCase(authRepository, logger)

// Use Cases - Artists
const listArtistsUseCase = new ListArtistsUseCase(artistRepository, logger)
const createArtistUseCase = new CreateArtistUseCase(artistRepository, logger)
const getArtistByIdUseCase = new GetArtistByIdUseCase(artistRepository, logger)
const updateArtistUseCase = new UpdateArtistUseCase(artistRepository, logger)
const deleteArtistUseCase = new DeleteArtistUseCase(artistRepository, logger)

export const container = {
  // Repositories
  eventRepository,
  authRepository,
  ticketRepository,
  paymentRepository,
  adminRepository,
  chatRepository,
  artistRepository,
  
  // Use Cases - Events
  listEventsUseCase,
  getEventByIdUseCase,
  createEventUseCase,
  updateEventUseCase,
  deleteEventUseCase,
  
  // Use Cases - Auth
  loginUseCase,
  registerUseCase,
  
  // Use Cases - Artists
  listArtistsUseCase,
  createArtistUseCase,
  getArtistByIdUseCase,
  updateArtistUseCase,
  deleteArtistUseCase,
  
  // Logger
  logger,
}
