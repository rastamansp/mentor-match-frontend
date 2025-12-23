import { IAvailabilityRepository } from '@domain/repositories/IAvailabilityRepository';
import { Availability } from '@domain/entities/Availability.entity';
import { UpdateAvailabilityDto } from '../../dto/UpdateAvailabilityDto';
import { validateUpdateAvailability } from '../../validators/UpdateAvailabilityValidator';
import { ValidationError } from '@domain/errors/ValidationError';

export class UpdateAvailabilityUseCase {
  constructor(private readonly availabilityRepository: IAvailabilityRepository) {}

  async execute(mentorId: string, availabilityId: string, dto: UpdateAvailabilityDto): Promise<Availability> {
    // Validate DTO
    const validated = validateUpdateAvailability(dto);

    try {
      return await this.availabilityRepository.update(mentorId, availabilityId, validated);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao atualizar disponibilidade. Tente novamente.');
    }
  }
}
