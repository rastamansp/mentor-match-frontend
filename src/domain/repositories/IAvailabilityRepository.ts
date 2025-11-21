import { Availability } from '../entities/Availability.entity';

export interface IAvailabilityRepository {
  findByMentorId(mentorId: string): Promise<Availability[]>;
}

