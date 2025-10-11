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
        this.logger.warn('CreateEventUseCase: Validation failed', { errors: error.issues })
        throw new ValidationError('Dados de evento inválidos')
      }
      
      this.logger.error('CreateEventUseCase: Error creating event', error as Error)
      throw error
    }
  }
}
