import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { Session } from '@domain/entities/Session.entity';
import { CreateSessionDto } from '../../dto/CreateSessionDto';
import { validateCreateSession } from '../../validators/CreateSessionValidator';
import { IMentorRepository } from '@domain/repositories/IMentorRepository';
import { NotFoundError } from '@domain/errors/NotFoundError';

export class CreateSessionUseCase {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly mentorRepository: IMentorRepository
  ) {}

  async execute(dto: CreateSessionDto, userId: string): Promise<Session> {
    // Validate DTO
    const validated = validateCreateSession(dto);

    // Verify mentor exists
    const mentor = await this.mentorRepository.findById(validated.mentorId);
    if (!mentor) {
      throw new NotFoundError('Mentor', validated.mentorId);
    }

    // Obtém timezone (padrão America/Sao_Paulo)
    const timezone = validated.timezone || 'America/Sao_Paulo';

    // Create session
    // Se scheduledAt foi fornecido, usa diretamente; senão, usa date + time
    const session = await this.sessionRepository.create({
      mentorId: validated.mentorId,
      userId,
      date: validated.date || '',
      time: validated.time || '',
      topic: validated.topic,
      notes: validated.notes,
      price: mentor.price || mentor.pricePerHour,
      scheduledAt: validated.scheduledAt, // Passa scheduledAt em UTC se fornecido
      timezone, // Passa timezone para o repositório
    } as any);

    // Update session with mentor info (se não já estiver preenchido)
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

