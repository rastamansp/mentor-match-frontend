import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { Session } from '@domain/entities/Session.entity';

export class CancelSessionUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(sessionId: string): Promise<Session> {
    // Cancela sessão
    return this.sessionRepository.cancel(sessionId);
  }
}
