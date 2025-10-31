import { IArtistRepository } from '../../../domain/repositories/IArtistRepository'
import { Artist } from '../../../domain/entities/Artist.entity'
import { CreateArtistDto, CreateArtistDtoSchema } from '../../dto/CreateArtistDto'
import { NotFoundError, ValidationError } from '../../../domain/errors/DomainError'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export class UpdateArtistUseCase {
  constructor(
    private readonly artistRepository: IArtistRepository,
    private readonly logger: ILogger
  ) {}

  async execute(id: string, data: Partial<CreateArtistDto>): Promise<Artist> {
    try {
      // Validar dados parciais com Zod (tornando campos opcionais)
      const partialSchema = CreateArtistDtoSchema.partial()
      const validationResult = partialSchema.safeParse(data)
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
        throw new ValidationError(`Dados inválidos: ${errors}`)
      }

      this.logger.info('UpdateArtistUseCase: Updating artist', { id })
      
      // Verificar se o artista existe
      const existingArtist = await this.artistRepository.findById(id)
      if (!existingArtist) {
        throw new NotFoundError('Artist', id)
      }
      
      const updatedArtist = await this.artistRepository.update(id, validationResult.data)
      
      this.logger.info('UpdateArtistUseCase: Artist updated successfully', { id })
      
      return updatedArtist
    } catch (error) {
      this.logger.error('UpdateArtistUseCase: Error updating artist', error as Error, { id })
      throw error
    }
  }
}

