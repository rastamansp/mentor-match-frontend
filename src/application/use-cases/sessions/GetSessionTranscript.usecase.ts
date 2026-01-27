import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { SessionTranscriptDto } from '@application/dto/SessionTranscriptDto';

export class GetSessionTranscriptUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(sessionId: string, meetingId: string): Promise<SessionTranscriptDto> {
    return this.sessionRepository.getTranscript(sessionId, meetingId);
  }
}
