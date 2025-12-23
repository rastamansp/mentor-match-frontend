import { IAvailabilityRepository } from '@domain/repositories/IAvailabilityRepository';
import { Availability } from '@domain/entities/Availability.entity';
import { CreateAvailabilityDto } from '../../dto/CreateAvailabilityDto';
import { validateCreateAvailability } from '../../validators/CreateAvailabilityValidator';
import { ValidationError } from '@domain/errors/ValidationError';

export class CreateAvailabilityUseCase {
  constructor(private readonly availabilityRepository: IAvailabilityRepository) {}

  async execute(mentorId: string, dto: CreateAvailabilityDto): Promise<Availability> {
    // Validate DTO
    const validated = validateCreateAvailability(dto);

    try {
      return await this.availabilityRepository.create(mentorId, validated);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao criar disponibilidade. Tente novamente.');
    }
  }
}
