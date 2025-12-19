import { IUserRepository } from '@domain/repositories/IUserRepository';
import { ValidationError } from '@domain/errors/ValidationError';

export class RemoveMentorUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, mentorId: string): Promise<void> {
    try {
      return await this.userRepository.removeMentor(userId, mentorId);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao remover mentor. Tente novamente.');
    }
  }
}
