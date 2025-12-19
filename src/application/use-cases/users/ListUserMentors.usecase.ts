import { IUserRepository } from '@domain/repositories/IUserRepository';
import { UserMentor } from '@domain/entities/UserMentor.entity';

export class ListUserMentorsUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, status?: 'ACTIVE' | 'INACTIVE'): Promise<UserMentor[]> {
    try {
      return await this.userRepository.listUserMentors(userId, status);
    } catch (error) {
      throw error;
    }
  }
}
