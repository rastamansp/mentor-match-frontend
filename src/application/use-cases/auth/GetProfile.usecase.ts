import { IAuthRepository } from '@domain/repositories/IAuthRepository';
import { User } from '@domain/entities/User.entity';
import { ValidationError } from '@domain/errors/ValidationError';

export class GetProfileUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<User> {
    try {
      return await this.authRepository.getProfile();
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao buscar perfil. Tente novamente.');
    }
  }
}
