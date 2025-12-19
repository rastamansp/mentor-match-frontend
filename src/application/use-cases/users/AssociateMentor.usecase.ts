import { IUserRepository } from '@domain/repositories/IUserRepository';
import { UserMentor } from '@domain/entities/UserMentor.entity';
import { AssociateMentorDto } from '../../dto/AssociateMentorDto';
import { validateAssociateMentor } from '../../validators/AssociateMentorValidator';
import { ValidationError } from '@domain/errors/ValidationError';

export class AssociateMentorUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, dto: AssociateMentorDto): Promise<UserMentor> {
    const validated = validateAssociateMentor(dto);
    try {
      return await this.userRepository.associateMentor(userId, validated.mentorId, validated.subscriptionId);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao associar mentor. Tente novamente.');
    }
  }
}
