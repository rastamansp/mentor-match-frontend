export interface CreateAvailabilityDto {
  dayOfWeek: number; // 0-6 (0=Domingo, 1=Segunda, ..., 6=Sábado)
  startTime: string; // formato "HH:mm"
  endTime: string; // formato "HH:mm"
  timezone?: string; // opcional, padrão: "America/Sao_Paulo"
  isActive?: boolean; // opcional, padrão: true
}
