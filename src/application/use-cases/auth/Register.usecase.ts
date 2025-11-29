import { IAuthRepository } from '@domain/repositories/IAuthRepository';
import { User } from '@domain/entities/User.entity';
import { RegisterDto } from '../../dto/RegisterDto';
import { validateRegister } from '../../validators/RegisterValidator';
import { ValidationError } from '@domain/errors/ValidationError';

export class RegisterUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(dto: RegisterDto): Promise<User> {
    // Validate DTO
    const validated = validateRegister(dto);

    try {
      return await this.authRepository.register(validated);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao fazer cadastro. Tente novamente.');
    }
  }
}

