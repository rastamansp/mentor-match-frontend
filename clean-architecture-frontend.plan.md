# Aplicar Clean Architecture e SOLID ao Frontend

## Visão Geral

Refatoração completa do projeto frontend React + TypeScript + Vite para aplicar Clean Architecture com foco em:
- Camadas Domain, Use Cases, Services/Adapters, UI
- Validação com Zod + sistema de erros tipados
- Logging estruturado com console
- Refatoração completa do sistema de eventos
- Integração com API externa (backend separado)

## Fase 1: Configuração de Dependências e Estrutura Base

### 1.1 Instalar Dependências
```bash
npm install zod
```

### 1.2 Criar Nova Estrutura de Pastas
```
src/
├── domain/                     # Camada de domínio (Entities)
│   ├── entities/
│   │   ├── Event.entity.ts
│   │   ├── User.entity.ts
│   │   ├── Ticket.entity.ts
│   │   └── Payment.entity.ts
│   ├── repositories/          # Interfaces dos repositórios
│   │   ├── IEventRepository.ts
│   │   ├── IAuthRepository.ts
│   │   └── ITicketRepository.ts
│   └── errors/                # Erros de domínio
│       ├── DomainError.ts
│       ├── ValidationError.ts
│       └── NotFoundError.ts
├── application/               # Camada de aplicação (Use Cases)
│   ├── use-cases/
│   │   ├── events/
│   │   │   ├── ListEvents.usecase.ts
│   │   │   ├── GetEventById.usecase.ts
│   │   │   ├── CreateEvent.usecase.ts
│   │   │   ├── UpdateEvent.usecase.ts
│   │   │   └── DeleteEvent.usecase.ts
│   │   ├── auth/
│   │   │   ├── Login.usecase.ts
│   │   │   └── Register.usecase.ts
│   │   └── tickets/
│   │       └── PurchaseTicket.usecase.ts
│   ├── dto/                   # Data Transfer Objects
│   │   ├── CreateEventDto.ts
│   │   ├── LoginDto.ts
│   │   └── PurchaseTicketDto.ts
│   └── validators/            # Validadores Zod
│       ├── event.validator.ts
│       ├── auth.validator.ts
│       └── ticket.validator.ts
├── infrastructure/            # Camada de infraestrutura (Adapters)
│   ├── http/
│   │   ├── axios.config.ts
│   │   └── interceptors.ts
│   ├── repositories/          # Implementações dos repositórios
│   │   ├── EventRepository.ts
│   │   ├── AuthRepository.ts
│   │   └── TicketRepository.ts
│   ├── logging/
│   │   ├── ILogger.ts
│   │   └── ConsoleLogger.ts
│   └── storage/
│       └── LocalStorageAdapter.ts
├── presentation/              # Camada de apresentação (UI)
│   ├── hooks/                 # Custom hooks que usam Use Cases
│   │   ├── useEvents.ts
│   │   ├── useEventById.ts
│   │   ├── useAuth.ts
│   │   └── useCreateEvent.ts
│   ├── components/
│   │   ├── common/
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventList.tsx
│   │   │   ├── EventFilters.tsx
│   │   │   └── EventForm.tsx
│   │   └── layout/
│   ├── pages/
│   │   ├── Events.page.tsx
│   │   ├── EventDetail.page.tsx
│   │   ├── CreateEvent.page.tsx
│   │   └── Login.page.tsx
│   └── contexts/
│       └── AuthContext.tsx
└── shared/                    # Código compartilhado
    ├── constants/
    ├── utils/
    └── types/
```

## Fase 2: Implementar Camada de Domínio

### 2.1 Criar Entities com Validação
Arquivo: `src/domain/entities/Event.entity.ts`
```typescript
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
  get category(): string { return this.data.category }
  get status(): string { return this.data.status }
  get maxCapacity(): number { return this.data.maxCapacity }
  get soldTickets(): number { return this.data.soldTickets }

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

  toJSON(): Event {
    return this.data
  }
}
```

### 2.2 Criar Erros de Domínio
Arquivo: `src/domain/errors/DomainError.ts`
```typescript
export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, public readonly errors?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      'NOT_FOUND',
      404
    )
  }
}

export class NetworkError extends DomainError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message, 'NETWORK_ERROR', 500)
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401)
  }
}
```

### 2.3 Criar Interfaces de Repositórios
Arquivo: `src/domain/repositories/IEventRepository.ts`
```typescript
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
```

## Fase 3: Implementar Camada de Aplicação (Use Cases)

### 3.1 Criar DTOs e Validadores
Arquivo: `src/application/dto/CreateEventDto.ts`
```typescript
import { z } from 'zod'

export const CreateEventDtoSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(200),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  date: z.string().datetime('Data inválida'),
  location: z.string().min(3, 'Local deve ter no mínimo 3 caracteres'),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  city: z.string().min(2, 'Cidade deve ter no mínimo 2 caracteres'),
  state: z.string().min(2, 'Estado deve ter no mínimo 2 caracteres'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  maxCapacity: z.number().positive('Capacidade deve ser maior que zero'),
  image: z.string().url('URL da imagem inválida').optional(),
})

export type CreateEventDto = z.infer<typeof CreateEventDtoSchema>
```

### 3.2 Criar Use Cases
Arquivo: `src/application/use-cases/events/ListEvents.usecase.ts`
```typescript
import { IEventRepository, EventFilters } from '../../../domain/repositories/IEventRepository'
import { Event } from '../../../domain/entities/Event.entity'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export class ListEventsUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly logger: ILogger
  ) {}

  async execute(filters?: EventFilters): Promise<Event[]> {
    try {
      this.logger.info('ListEventsUseCase: Fetching events', { filters })
      
      const events = await this.eventRepository.findAll(filters)
      
      this.logger.info('ListEventsUseCase: Events fetched successfully', {
        count: events.length
      })
      
      return events
    } catch (error) {
      this.logger.error('ListEventsUseCase: Error fetching events', error as Error, { filters })
      throw error
    }
  }
}
```

Arquivo: `src/application/use-cases/events/CreateEvent.usecase.ts`
```typescript
import { IEventRepository } from '../../../domain/repositories/IEventRepository'
import { Event } from '../../../domain/entities/Event.entity'
import { CreateEventDto, CreateEventDtoSchema } from '../../dto/CreateEventDto'
import { ValidationError } from '../../../domain/errors/DomainError'
import { ILogger } from '../../../infrastructure/logging/ILogger'
import { z } from 'zod'

export class CreateEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly logger: ILogger
  ) {}

  async execute(data: CreateEventDto): Promise<Event> {
    try {
      this.logger.info('CreateEventUseCase: Validating input', { title: data.title })
      
      // Validação com Zod
      const validatedData = CreateEventDtoSchema.parse(data)
      
      this.logger.info('CreateEventUseCase: Creating event')
      
      const event = await this.eventRepository.create(validatedData)
      
      this.logger.info('CreateEventUseCase: Event created successfully', {
        eventId: event.id
      })
      
      return event
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.logger.warn('CreateEventUseCase: Validation failed', { errors: error.errors })
        throw new ValidationError('Dados de evento inválidos', error.formErrors.fieldErrors)
      }
      
      this.logger.error('CreateEventUseCase: Error creating event', error as Error)
      throw error
    }
  }
}
```

## Fase 4: Implementar Camada de Infraestrutura

### 4.1 Criar Sistema de Logging
Arquivo: `src/infrastructure/logging/ILogger.ts`
```typescript
export interface ILogger {
  info(message: string, data?: Record<string, unknown>): void
  error(message: string, error?: Error, data?: Record<string, unknown>): void
  warn(message: string, data?: Record<string, unknown>): void
  debug(message: string, data?: Record<string, unknown>): void
}
```

Arquivo: `src/infrastructure/logging/ConsoleLogger.ts`
```typescript
import { ILogger } from './ILogger'

export class ConsoleLogger implements ILogger {
  info(message: string, data?: Record<string, unknown>): void {
    console.log(`[INFO] ${message}`, data)
  }

  error(message: string, error?: Error, data?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, error, data)
  }

  warn(message: string, data?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, data)
  }

  debug(message: string, data?: Record<string, unknown>): void {
    console.debug(`[DEBUG] ${message}`, data)
  }
}
```

### 4.2 Implementar Repositórios
Arquivo: `src/infrastructure/repositories/EventRepository.ts`
```typescript
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
```

## Fase 5: Implementar Camada de Apresentação

### 5.1 Criar Dependency Injection Container
Arquivo: `src/shared/di/container.ts`
```typescript
import axios from 'axios'
import { EventRepository } from '../../infrastructure/repositories/EventRepository'
import { ConsoleLogger } from '../../infrastructure/logging/ConsoleLogger'
import { ListEventsUseCase } from '../../application/use-cases/events/ListEvents.usecase'
import { CreateEventUseCase } from '../../application/use-cases/events/CreateEvent.usecase'
import { GetEventByIdUseCase } from '../../application/use-cases/events/GetEventById.usecase'

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

const logger = new ConsoleLogger()
const eventRepository = new EventRepository(httpClient)

export const container = {
  // Repositories
  eventRepository,
  
  // Use Cases
  listEventsUseCase: new ListEventsUseCase(eventRepository, logger),
  createEventUseCase: new CreateEventUseCase(eventRepository, logger),
  getEventByIdUseCase: new GetEventByIdUseCase(eventRepository, logger),
  
  // Logger
  logger,
}
```

### 5.2 Criar Custom Hooks
Arquivo: `src/presentation/hooks/useEvents.ts`
```typescript
import { useState, useEffect, useCallback } from 'react'
import { Event } from '../../domain/entities/Event.entity'
import { container } from '../../shared/di/container'
import { EventFilters } from '../../domain/repositories/IEventRepository'

interface UseEventsResult {
  events: Event[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useEvents = (filters?: EventFilters): UseEventsResult => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await container.listEventsUseCase.execute(filters)
      setEvents(data)
    } catch (err) {
      setError(err as Error)
      container.logger.error('useEvents: Failed to fetch events', err as Error, { filters })
    } finally {
      setLoading(false)
    }
  }, [filters?.category, filters?.city, filters?.status, filters?.search])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  }
}
```

### 5.3 Refatorar Componentes
Arquivo: `src/presentation/components/events/EventCard.tsx`
```typescript
import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import { Event } from '../../../domain/entities/Event.entity'
import { Calendar, MapPin, Users } from 'lucide-react'

interface EventCardProps {
  event: Event
  className?: string
}

export const EventCard: React.FC<EventCardProps> = memo(({ event, className = '' }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Link
      to={`/events/${event.id}`}
      className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow ${className}`}
    >
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 line-clamp-2 mb-3">{event.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(event.date)} às {formatTime(event.date)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.location}, {event.city}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{event.soldTickets} de {event.maxCapacity} ingressos vendidos</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            {event.category}
          </span>
          <span className="text-sm font-medium text-gray-500">
            {event.status}
          </span>
        </div>
      </div>
    </Link>
  )
})

EventCard.displayName = 'EventCard'
```

### 5.4 Refatorar Páginas
Arquivo: `src/presentation/pages/Events.page.tsx`
```typescript
import React, { useState } from 'react'
import { useEvents } from '../hooks/useEvents'
import { EventCard } from '../components/events/EventCard'
import { EventFilters } from '../components/events/EventFilters'
import { EventFilters as EventFiltersType } from '../../domain/repositories/IEventRepository'

export const EventsPage: React.FC = () => {
  const [filters, setFilters] = useState<EventFiltersType>({})
  const { events, loading, error, refetch } = useEvents(filters)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error.message}</span>
          <button
            onClick={refetch}
            className="ml-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Eventos</h1>
        <EventFilters filters={filters} onChange={setFilters} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum evento encontrado.</p>
        </div>
      )}
    </div>
  )
}
```

## Fase 6: Atualizar Arquivos de Configuração

### 6.1 Atualizar tsconfig.json
Adicionar paths para facilitar imports:
```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@domain/*": ["domain/*"],
      "@application/*": ["application/*"],
      "@infrastructure/*": ["infrastructure/*"],
      "@presentation/*": ["presentation/*"],
      "@shared/*": ["shared/*"]
    }
  }
}
```

### 6.2 Atualizar vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, './src/domain'),
      '@application': path.resolve(__dirname, './src/application'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
```

### 6.3 Adicionar variável de ambiente
Adicionar ao `.env`:
```
VITE_API_URL=http://localhost:3001/api
```

## Fase 7: Migrar Código Existente

### 7.1 Mover Types Antigos
- Migrar interfaces de `src/types/index.ts` para entities
- Criar validadores Zod correspondentes

### 7.2 Refatorar Services Antigos
- Transformar `src/services/api.ts` em repositories
- Manter axios config mas com melhor estrutura

### 7.3 Refatorar Páginas Antigas
- Migrar `src/pages/Events.tsx` para `src/presentation/pages/Events.page.tsx`
- Aplicar uso de custom hooks e use cases

### 7.4 Refatorar Context
- Manter `AuthContext` mas usar use cases de autenticação

## Fase 8: Testes e Validação

### 8.1 Testar Use Cases
- Verificar listagem de eventos
- Verificar criação de eventos
- Verificar validações com Zod

### 8.2 Testar Logging
- Verificar logs em desenvolvimento
- Verificar logs estruturados no console

### 8.3 Testar UI
- Verificar funcionamento dos componentes
- Verificar tratamento de erros

## Fase 9: Limpeza

### 9.1 Remover Código Antigo
- Remover `src/services/api.ts` (substituído por repositories)
- Remover `src/types/index.ts` (substituído por entities)
- Remover páginas antigas em `src/pages/`

### 9.2 Atualizar Documentação
- Atualizar README com nova arquitetura
- Documentar estrutura de pastas
- Documentar padrões de uso

## Observações Importantes

- Seguir princípios SOLID em todas as implementações
- Manter separação clara entre camadas
- Use Cases não devem conhecer detalhes de implementação (HTTP, storage, etc.)
- UI não deve acessar repositórios diretamente, apenas via use cases
- Validações sempre com Zod nas bordas (DTOs)
- Logging em todos os use cases e pontos críticos
- Tratamento de erros tipados em todas as camadas
- Integração com API externa via repositórios
- Frontend independente do backend (repositórios separados)

## To-dos

- [ ] Instalar dependências (zod) e criar estrutura de pastas
- [ ] Implementar camada de domínio (entities, errors, repository interfaces)
- [ ] Implementar camada de aplicação (use cases, DTOs, validators)
- [ ] Implementar camada de infraestrutura (repositories, logging, HTTP client)
- [ ] Implementar camada de apresentação (hooks, components refatorados)
- [ ] Criar container de injeção de dependências
- [ ] Atualizar configurações (tsconfig, vite.config, .env)
- [ ] Migrar código existente para nova estrutura
- [ ] Testar e validar todas as camadas e funcionalidades
- [ ] Remover código antigo e atualizar documentação
