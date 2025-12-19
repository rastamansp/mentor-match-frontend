import { IUserRepository } from '@domain/repositories/IUserRepository';
import { ValidationError } from '@domain/errors/ValidationError';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<void> {
    try {
      return await this.userRepository.delete(id);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao deletar usuário. Tente novamente.');
    }
  }
}
