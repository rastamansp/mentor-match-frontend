export interface UpdateAvailabilityDto {
  dayOfWeek?: number; // 0-6 (0=Domingo, 1=Segunda, ..., 6=Sábado)
  startTime?: string; // formato "HH:mm"
  endTime?: string; // formato "HH:mm"
  timezone?: string;
  isActive?: boolean;
}
