import { IMentorRepository } from '@domain/repositories/IMentorRepository';
import { Mentor } from '@domain/entities/Mentor.entity';

export class SearchMentorsUseCase {
  constructor(private readonly mentorRepository: IMentorRepository) {}

  async execute(query: string): Promise<Mentor[]> {
    if (!query || query.trim().length === 0) {
      return this.mentorRepository.findAll();
    }

    return this.mentorRepository.search(query.trim());
  }
}

