import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { Session } from '@domain/entities/Session.entity';
import { UpdateSessionDto } from '../../dto/UpdateSessionDto';
import { validateUpdateSession } from '../../validators/UpdateSessionValidator';

export class UpdateSessionUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(sessionId: string, dto: UpdateSessionDto): Promise<Session> {
    // Validate DTO
    const validated = validateUpdateSession(dto);

    // Update session
    return this.sessionRepository.update(sessionId, {
      scheduledAt: validated.scheduledAt,
      duration: validated.duration,
      notes: validated.notes,
    });
  }
}
