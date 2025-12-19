import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User.entity';
import { UpdateUserDto } from '../../dto/UpdateUserDto';
import { validateUpdateUser } from '../../validators/UpdateUserValidator';
import { ValidationError } from '@domain/errors/ValidationError';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    // Validate DTO
    const validated = validateUpdateUser(dto);

    try {
      return await this.userRepository.update(id, validated);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao atualizar usuário. Tente novamente.');
    }
  }
}
