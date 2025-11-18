import { IAuthRepository } from '@domain/repositories/IAuthRepository';
import { User } from '@domain/entities/User.entity';
import { LoginDto } from '../../dto/LoginDto';
import { validateLogin } from '../../validators/LoginValidator';
import { ValidationError } from '@domain/errors/ValidationError';

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(dto: LoginDto): Promise<User> {
    // Validate DTO
    const validated = validateLogin(dto);

    try {
      return await this.authRepository.login(validated);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao fazer login. Tente novamente.');
    }
  }
}

