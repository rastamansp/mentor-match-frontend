import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { Session } from '@domain/entities/Session.entity';

export class ListUserSessionsUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(userId: string): Promise<Session[]> {
    return this.sessionRepository.findByUserId(userId);
  }
}

