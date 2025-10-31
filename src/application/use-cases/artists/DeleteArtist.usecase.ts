import { IArtistRepository } from '../../../domain/repositories/IArtistRepository'
import { NotFoundError } from '../../../domain/errors/DomainError'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export class DeleteArtistUseCase {
  constructor(
    private readonly artistRepository: IArtistRepository,
    private readonly logger: ILogger
  ) {}

  async execute(id: string): Promise<void> {
    try {
      this.logger.info('DeleteArtistUseCase: Deleting artist', { id })
      
      // Verificar se o artista existe
      const artist = await this.artistRepository.findById(id)
      if (!artist) {
        throw new NotFoundError('Artist', id)
      }
      
      await this.artistRepository.delete(id)
      
      this.logger.info('DeleteArtistUseCase: Artist deleted successfully', { id })
    } catch (error) {
      this.logger.error('DeleteArtistUseCase: Error deleting artist', error as Error, { id })
      throw error
    }
  }
}

