export interface CreateSessionDto {
  mentorId: string;
  date: string;
  time: string;
  topic: string;
  notes?: string;
  timezone?: string; // Opcional, padrão "America/Sao_Paulo"
}

