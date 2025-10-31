import { IArtistRepository, ArtistFilters } from '../../../domain/repositories/IArtistRepository'
import { Artist } from '../../../domain/entities/Artist.entity'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export class ListArtistsUseCase {
  constructor(
    private readonly artistRepository: IArtistRepository,
    private readonly logger: ILogger
  ) {}

  async execute(filters?: ArtistFilters): Promise<Artist[]> {
    try {
      this.logger.info('ListArtistsUseCase: Fetching artists', { filters })
      
      const artists = await this.artistRepository.findAll(filters)
      
      // Garantir que sempre retorne um array
      const artistsArray = Array.isArray(artists) ? artists : []
      
      this.logger.info('ListArtistsUseCase: Artists fetched successfully', {
        count: artistsArray.length
      })
      
      return artistsArray
    } catch (error) {
      this.logger.error('ListArtistsUseCase: Error fetching artists', error as Error, { filters })
      throw error
    }
  }
}

