import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User.entity';

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    try {
      return await this.userRepository.findAll();
    } catch (error) {
      throw error;
    }
  }
}
