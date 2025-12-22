import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { Session } from '@domain/entities/Session.entity';
import { RescheduleSessionDto } from '../../dto/RescheduleSessionDto';
import { validateRescheduleSession } from '../../validators/RescheduleSessionValidator';

export class RescheduleSessionUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(sessionId: string, dto: RescheduleSessionDto): Promise<Session> {
    // Validate DTO
    const validated = validateRescheduleSession(dto);

    // Reschedule session
    return this.sessionRepository.reschedule(sessionId, {
      newStartAtUtc: validated.newStartAtUtc,
      newEndAtUtc: validated.newEndAtUtc,
      timezone: validated.timezone,
      reason: validated.reason,
    });
  }
}
