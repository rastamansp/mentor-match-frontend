export interface CreateSessionAdminDto {
  mentorId: string;
  planId?: string | null;
  scheduledAt: string;
  duration: number;
  notes?: string;
  timezone?: string; // Opcional, padrão "America/Sao_Paulo"
}
