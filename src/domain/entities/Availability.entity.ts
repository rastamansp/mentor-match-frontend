import { z } from 'zod';

export const AvailabilitySchema = z.object({
  id: z.string(),
  mentorId: z.string(),
  dayOfWeek: z.number().min(1).max(7), // 1 = Segunda, 2 = Terça, ..., 7 = Domingo (formato ISO)
  startTime: z.string(), // formato "HH:mm:ss"
  endTime: z.string(), // formato "HH:mm:ss"
  timezone: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Availability = z.infer<typeof AvailabilitySchema>;

