import { IEventRepository } from '../../../domain/repositories/IEventRepository'
import { Event } from '../../../domain/entities/Event.entity'
import { NotFoundError } from '../../../domain/errors/DomainError'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export class GetEventByIdUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly logger: ILogger
  ) {}

  async execute(id: string): Promise<Event> {
    try {
      this.logger.info('GetEventByIdUseCase: Fetching event', { eventId: id })
      
      const event = await this.eventRepository.findById(id)
      
      if (!event) {
        this.logger.warn('GetEventByIdUseCase: Event not found', { eventId: id })
        throw new NotFoundError('Event', id)
      }
      
      this.logger.info('GetEventByIdUseCase: Event fetched successfully', {
        eventId: id,
        title: event.title
      })
      
      return event
    } catch (error) {
      this.logger.error('GetEventByIdUseCase: Error fetching event', error as Error, { eventId: id })
      throw error
    }
  }
}
