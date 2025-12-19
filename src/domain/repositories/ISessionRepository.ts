import { Session } from '../entities/Session.entity';

export interface CreateSessionData {
  mentorId: string;
  userId: string;
  date: string;
  time: string;
  topic: string;
  notes?: string;
  price: number;
}

export interface ISessionRepository {
  create(data: CreateSessionData): Promise<Session>;
  createForUserByAdmin(userId: string, data: { mentorId: string; planId: string | null; scheduledAt: string; duration: number; notes?: string }): Promise<Session>;
  update(id: string, data: { scheduledAt: string; duration?: number; notes?: string }): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  findByUserIdAdmin(userId: string): Promise<Session[]>;
  findByMentorId(mentorId: string): Promise<Session[]>;
}

