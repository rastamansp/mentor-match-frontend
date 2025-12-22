import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { Session } from '@domain/entities/Session.entity';
import { CreateSessionAdminDto } from '../../dto/CreateSessionAdminDto';
import { validateCreateSessionAdmin } from '../../validators/CreateSessionAdminValidator';
import { IMentorRepository } from '@domain/repositories/IMentorRepository';
import { NotFoundError } from '@domain/errors/NotFoundError';

export class CreateSessionAdminUseCase {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly mentorRepository: IMentorRepository
  ) {}

  async execute(userId: string, dto: CreateSessionAdminDto): Promise<Session> {
    // Validate DTO
    const validated = validateCreateSessionAdmin(dto);

    // Verify mentor exists
    const mentor = await this.mentorRepository.findById(validated.mentorId);
    if (!mentor) {
      throw new NotFoundError('Mentor', validated.mentorId);
    }

    // Obtém timezone (padrão America/Sao_Paulo)
    const timezone = validated.timezone || 'America/Sao_Paulo';

    // Create session using admin endpoint
    const session = await this.sessionRepository.createForUserByAdmin(userId, {
      mentorId: validated.mentorId,
      planId: validated.planId ?? null,
      scheduledAt: validated.scheduledAt, // Já deve estar em UTC
      duration: validated.duration,
      notes: validated.notes,
      timezone,
    });

    // Update session with mentor info if not already set
    if (session.mentorName === 'Mentor Name' || !session.mentorAvatar) {
      return {
        ...session,
        mentorName: mentor.name,
        mentorAvatar: mentor.avatar,
      };
    }

    return session;
  }
}
