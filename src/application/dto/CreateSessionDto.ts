export interface CreateSessionDto {
  mentorId: string;
  date?: string; // Opcional, usado apenas se scheduledAt não for fornecido
  time?: string; // Opcional, usado apenas se scheduledAt não for fornecido
  scheduledAt?: string; // ISO datetime em UTC - prioridade se fornecido
  timezone?: string; // Timezone IANA (ex: "America/Sao_Paulo") - obrigatório se scheduledAt for fornecido
  topic: string;
  notes?: string;
}

