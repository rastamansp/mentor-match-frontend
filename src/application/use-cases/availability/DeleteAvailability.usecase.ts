import { IAvailabilityRepository } from '@domain/repositories/IAvailabilityRepository';
import { ValidationError } from '@domain/errors/ValidationError';

export class DeleteAvailabilityUseCase {
  constructor(private readonly availabilityRepository: IAvailabilityRepository) {}

  async execute(mentorId: string, availabilityId: string): Promise<void> {
    try {
      await this.availabilityRepository.delete(mentorId, availabilityId);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao deletar disponibilidade. Tente novamente.');
    }
  }
}
