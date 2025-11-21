import { IMentorRepository } from '@domain/repositories/IMentorRepository';
import { Mentor } from '@domain/entities/Mentor.entity';
import { NotFoundError } from '@domain/errors/NotFoundError';

export class GetMentorByIdUseCase {
  constructor(private readonly mentorRepository: IMentorRepository) {}

  async execute(id: string): Promise<Mentor> {
    const mentor = await this.mentorRepository.findById(id);
    
    if (!mentor) {
      throw new NotFoundError('Mentor', id);
    }

    return mentor;
  }
}

