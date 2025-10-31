import { IArtistRepository } from '../../../domain/repositories/IArtistRepository'
import { Artist } from '../../../domain/entities/Artist.entity'
import { CreateArtistDto, CreateArtistDtoSchema } from '../../dto/CreateArtistDto'
import { ValidationError } from '../../../domain/errors/DomainError'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export class CreateArtistUseCase {
  constructor(
    private readonly artistRepository: IArtistRepository,
    private readonly logger: ILogger
  ) {}

  async execute(data: CreateArtistDto): Promise<Artist> {
    try {
      // Validar dados com Zod
      const validationResult = CreateArtistDtoSchema.safeParse(data)
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
        throw new ValidationError(`Dados inválidos: ${errors}`)
      }

      this.logger.info('CreateArtistUseCase: Creating artist', { artisticName: data.artisticName })
      
      const artist = await this.artistRepository.create(validationResult.data)
      
      this.logger.info('CreateArtistUseCase: Artist created successfully', {
        artistId: artist.id
      })
      
      return artist
    } catch (error) {
      this.logger.error('CreateArtistUseCase: Error creating artist', error as Error, { artisticName: data.artisticName })
      throw error
    }
  }
}

