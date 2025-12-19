import { IAuthRepository } from '@domain/repositories/IAuthRepository';
import { User } from '@domain/entities/User.entity';
import { RegisterWithRoleDto } from '../../dto/RegisterWithRoleDto';
import { validateRegisterWithRole } from '../../validators/RegisterWithRoleValidator';
import { ValidationError } from '@domain/errors/ValidationError';

export class RegisterWithRoleUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(dto: RegisterWithRoleDto): Promise<User> {
    // Validate DTO
    const validated = validateRegisterWithRole(dto);

    try {
      return await this.authRepository.registerWithRole(validated);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao fazer cadastro. Tente novamente.');
    }
  }
}
