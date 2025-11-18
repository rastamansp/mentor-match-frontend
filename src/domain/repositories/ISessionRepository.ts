import { Session } from '../entities/Session.entity';

export interface CreateSessionData {
  mentorId: number;
  userId: string;
  date: string;
  time: string;
  topic: string;
  notes?: string;
  price: number;
}

export interface ISessionRepository {
  create(data: CreateSessionData): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  findByMentorId(mentorId: number): Promise<Session[]>;
}

