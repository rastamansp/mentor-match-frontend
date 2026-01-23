import { Session } from '../entities/Session.entity';
import { SessionSummaryDto } from '@application/dto/SessionSummaryDto';

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
  createForUserByAdmin(userId: string, data: { mentorId: string; planId: string | null; scheduledAt: string; duration: number; notes?: string; timezone?: string }): Promise<Session>;
  reschedule(id: string, data: { newStartAtUtc: string; newEndAtUtc: string; timezone: string; reason?: string }): Promise<Session>;
  confirm(id: string, data?: { zoomLink?: string; zoomMeetingId?: string }): Promise<Session>;
  cancel(id: string): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  findByUserIdAdmin(userId: string): Promise<Session[]>;
  findByMentorId(mentorId: string): Promise<Session[]>;
  getSummary(meetingUuid: string): Promise<SessionSummaryDto>;
}

