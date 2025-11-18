import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { Session } from '@domain/entities/Session.entity';
import { NotFoundError } from '@domain/errors/NotFoundError';

export class GetSessionByIdUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(id: string): Promise<Session> {
    const session = await this.sessionRepository.findById(id);
    
    if (!session) {
      throw new NotFoundError('Session', id);
    }

    return session;
  }
}

