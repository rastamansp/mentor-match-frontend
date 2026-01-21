import { IMentorRepository } from '@domain/repositories/IMentorRepository';
import { Mentor } from '@domain/entities/Mentor.entity';
import { CreateMentorDto } from '../../dto/CreateMentorDto';
import { validateCreateMentor } from '../../validators/CreateMentorValidator';
import { ValidationError } from '@domain/errors/ValidationError';

export class CreateMentorUseCase {
  constructor(private readonly mentorRepository: IMentorRepository) {}

  async execute(dto: CreateMentorDto): Promise<Mentor> {
    // Validate DTO
    const validated = validateCreateMentor(dto);

    try {
      return await this.mentorRepository.create(validated);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao criar mentor. Tente novamente.');
    }
  }
}
