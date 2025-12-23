import { IMentorRepository } from '@domain/repositories/IMentorRepository';
import { Mentor } from '@domain/entities/Mentor.entity';
import { UpdateMentorDto } from '../../dto/UpdateMentorDto';
import { validateUpdateMentor } from '../../validators/UpdateMentorValidator';
import { ValidationError } from '@domain/errors/ValidationError';

export class UpdateMentorUseCase {
  constructor(private readonly mentorRepository: IMentorRepository) {}

  async execute(id: string, dto: UpdateMentorDto): Promise<Mentor> {
    // Validate DTO
    const validated = validateUpdateMentor(dto);

    try {
      return await this.mentorRepository.update(id, validated);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao atualizar mentor. Tente novamente.');
    }
  }
}
