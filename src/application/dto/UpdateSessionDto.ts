export interface UpdateSessionDto {
  scheduledAt: string; // ISO datetime
  duration?: number;
  notes?: string;
}
