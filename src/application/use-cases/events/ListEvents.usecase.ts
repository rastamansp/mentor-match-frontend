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
      
      // Garantir que sempre retorne um array
      const eventsArray = Array.isArray(events) ? events : []
      
      this.logger.info('ListEventsUseCase: Events fetched successfully', {
        count: eventsArray.length
      })
      
      return eventsArray
    } catch (error) {
      this.logger.error('ListEventsUseCase: Error fetching events', error as Error, { filters })
      throw error
    }
  }
}
