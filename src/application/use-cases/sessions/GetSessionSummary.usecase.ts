import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { SessionSummaryDto } from '@application/dto/SessionSummaryDto';

export class GetSessionSummaryUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(meetingUuid: string): Promise<SessionSummaryDto> {
    return this.sessionRepository.getSummary(meetingUuid);
  }
}
