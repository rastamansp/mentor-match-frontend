import { Availability } from '../entities/Availability.entity';
import { CreateAvailabilityDto } from '@application/dto/CreateAvailabilityDto';
import { UpdateAvailabilityDto } from '@application/dto/UpdateAvailabilityDto';

export interface IAvailabilityRepository {
  findByMentorId(mentorId: string): Promise<Availability[]>;
  create(mentorId: string, dto: CreateAvailabilityDto): Promise<Availability>;
  update(mentorId: string, availabilityId: string, dto: UpdateAvailabilityDto): Promise<Availability>;
  delete(mentorId: string, availabilityId: string): Promise<void>;
}

