import { ISessionRepository, CreateSessionData } from '@domain/repositories/ISessionRepository';
import { Session } from '@domain/entities/Session.entity';
import { NotFoundError } from '@domain/errors/NotFoundError';
import { ILogger } from '../logging/Logger';

// Mock sessions storage (in real app, this would be in a database)
let MOCK_SESSIONS: Session[] = [];

export class SessionRepository implements ISessionRepository {
  constructor(private readonly logger: ILogger) {}

  async create(data: CreateSessionData): Promise<Session> {
    this.logger.debug('Creating session', data);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const session: Session = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      mentorId: data.mentorId,
      mentorName: 'Mentor Name', // Will be filled from mentor data
      mentorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor',
      userId: data.userId,
      date: data.date,
      time: data.time,
      topic: data.topic,
      notes: data.notes,
      status: 'scheduled',
      price: data.price,
      createdAt: new Date().toISOString(),
    };

    MOCK_SESSIONS.push(session);
    this.logger.info('Session created', { sessionId: session.id });

    return session;
  }

  async findById(id: string): Promise<Session | null> {
    this.logger.debug('Finding session by id', { id });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const session = MOCK_SESSIONS.find(s => s.id === id);

    if (!session) {
      throw new NotFoundError('Session', id);
    }

    return session;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    this.logger.debug('Finding sessions by user id', { userId });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return MOCK_SESSIONS.filter(s => s.userId === userId);
  }

  async findByMentorId(mentorId: number): Promise<Session[]> {
    this.logger.debug('Finding sessions by mentor id', { mentorId });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return MOCK_SESSIONS.filter(s => s.mentorId === mentorId);
  }
}

