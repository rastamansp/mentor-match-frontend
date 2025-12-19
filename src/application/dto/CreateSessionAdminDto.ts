export interface CreateSessionAdminDto {
  mentorId: string;
  planId?: string | null;
  scheduledAt: string;
  duration: number;
  notes?: string;
}
