import { z } from 'zod';

export const AvailabilitySchema = z.object({
  id: z.string(),
  mentorId: z.string(),
  dayOfWeek: z.number().min(0).max(6), // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  startTime: z.string(), // formato "HH:mm" ou "HH:mm:ss"
  endTime: z.string(), // formato "HH:mm" ou "HH:mm:ss"
  timezone: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Availability = z.infer<typeof AvailabilitySchema>;

