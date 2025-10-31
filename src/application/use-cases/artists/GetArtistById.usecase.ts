import { IArtistRepository } from '../../../domain/repositories/IArtistRepository'
import { Artist } from '../../../domain/entities/Artist.entity'
import { NotFoundError } from '../../../domain/errors/DomainError'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export class GetArtistByIdUseCase {
  constructor(
    private readonly artistRepository: IArtistRepository,
    private readonly logger: ILogger
  ) {}

  async execute(id: string): Promise<Artist> {
    try {
      this.logger.info('GetArtistByIdUseCase: Fetching artist', { id })
      
      const artist = await this.artistRepository.findById(id)
      
      if (!artist) {
        throw new NotFoundError('Artist', id)
      }
      
      this.logger.info('GetArtistByIdUseCase: Artist fetched successfully', { id })
      
      return artist
    } catch (error) {
      this.logger.error('GetArtistByIdUseCase: Error fetching artist', error as Error, { id })
      throw error
    }
  }
}

