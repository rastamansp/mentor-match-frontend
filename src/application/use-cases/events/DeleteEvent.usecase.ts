import { IEventRepository } from '../../../domain/repositories/IEventRepository'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export class DeleteEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly logger: ILogger
  ) {}

  async execute(id: string): Promise<void> {
    try {
      this.logger.info('DeleteEventUseCase: Deleting event', { eventId: id })
      
      await this.eventRepository.delete(id)
      
      this.logger.info('DeleteEventUseCase: Event deleted successfully', {
        eventId: id
      })
    } catch (error) {
      this.logger.error('DeleteEventUseCase: Error deleting event', error as Error, { eventId: id })
      throw error
    }
  }
}
