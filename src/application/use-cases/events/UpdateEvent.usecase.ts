import { IEventRepository } from '../../../domain/repositories/IEventRepository'
import { Event } from '../../../domain/entities/Event.entity'
import { CreateEventDto, CreateEventDtoSchema } from '../../dto/CreateEventDto'
import { ValidationError } from '../../../domain/errors/DomainError'
import { ILogger } from '../../../infrastructure/logging/ILogger'
import { z } from 'zod'

export class UpdateEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly logger: ILogger
  ) {}

  async execute(id: string, data: Partial<CreateEventDto>): Promise<Event> {
    try {
      this.logger.info('UpdateEventUseCase: Validating input', { eventId: id, title: data.title })
      
      // Validação com Zod (parcial)
      const validatedData = CreateEventDtoSchema.partial().parse(data)
      
      this.logger.info('UpdateEventUseCase: Updating event')
      
      const event = await this.eventRepository.update(id, validatedData)
      
      this.logger.info('UpdateEventUseCase: Event updated successfully', {
        eventId: id
      })
      
      return event
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.logger.warn('UpdateEventUseCase: Validation failed', { errors: error.issues })
        throw new ValidationError('Dados de evento inválidos')
      }
      
      this.logger.error('UpdateEventUseCase: Error updating event', error as Error, { eventId: id })
      throw error
    }
  }
}
