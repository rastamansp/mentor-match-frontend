import { IAvailabilityRepository } from '@domain/repositories/IAvailabilityRepository';
import { Availability } from '@domain/entities/Availability.entity';

export class GetMentorAvailabilityUseCase {
  constructor(private readonly availabilityRepository: IAvailabilityRepository) {}

  async execute(mentorId: string): Promise<Availability[]> {
    return this.availabilityRepository.findByMentorId(mentorId);
  }
}

