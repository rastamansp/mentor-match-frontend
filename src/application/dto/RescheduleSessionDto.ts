export interface RescheduleSessionDto {
  newStartAtUtc: string; // ISO datetime UTC
  newEndAtUtc: string; // ISO datetime UTC
  timezone: string; // Obrigatório, ex: "America/Sao_Paulo"
  reason?: string; // Opcional
}
