import { ISessionRepository } from '@domain/repositories/ISessionRepository';

export class SendSessionSummaryByWhatsAppUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(sessionId: string): Promise<{ success: boolean; message: string }> {
    return this.sessionRepository.sendSummaryByWhatsApp(sessionId);
  }
}
