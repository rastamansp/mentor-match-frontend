import { IMentorRepository, MentorFilters } from '@domain/repositories/IMentorRepository';
import { Mentor } from '@domain/entities/Mentor.entity';
import { MentorFiltersDto } from '../../dto/MentorFiltersDto';
import { validateMentorFilters } from '../../validators/MentorFiltersValidator';

export class ListMentorsUseCase {
  constructor(private readonly mentorRepository: IMentorRepository) {}

  async execute(filters?: MentorFiltersDto): Promise<Mentor[]> {
    const validatedFilters: MentorFilters | undefined = filters
      ? validateMentorFilters(filters)
      : undefined;

    return this.mentorRepository.findAll(validatedFilters);
  }
}

