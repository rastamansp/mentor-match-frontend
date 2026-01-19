import { IMentorRepository } from '@domain/repositories/IMentorRepository';
import { ValidationError } from '@domain/errors/ValidationError';

export class DeleteMentorUseCase {
  constructor(private readonly mentorRepository: IMentorRepository) {}

  async execute(id: string): Promise<void> {
    try {
      await this.mentorRepository.delete(id);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao deletar mentor. Tente novamente.');
    }
  }
}

