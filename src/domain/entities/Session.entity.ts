import { z } from 'zod';

export const SessionSlotSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  mentorId: z.string(),
  menteeId: z.string(),
  startAtUtc: z.string().datetime(),
  endAtUtc: z.string().datetime(),
  timezone: z.string(),
  status: z.enum(['CONFIRMED', 'HELD', 'RESCHEDULED', 'CANCELED', 'COMPLETED']),
  holdExpiresAt: z.string().datetime().nullable().optional(),
  createdBy: z.enum(['USER', 'CONCIERGE']),
  rescheduleFromSlotId: z.string().nullable().optional(),
  provider: z.string().nullable().optional(),
  providerMeetingId: z.string().nullable().optional(),
  providerJoinUrl: z.string().nullable().optional(),
  providerPayload: z.any().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SessionSlot = z.infer<typeof SessionSlotSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  mentorId: z.string(),
  mentorName: z.string(),
  mentorAvatar: z.string().url().nullable().optional(),
  userId: z.string(),
  date: z.string().refine((val) => {
    // Aceita tanto ISO datetime quanto apenas data (YYYY-MM-DD)
    if (val.includes('T')) {
      return true; // É um ISO datetime válido
    }
    // Valida formato de data YYYY-MM-DD
    return /^\d{4}-\d{2}-\d{2}$/.test(val);
  }, 'Formato de data inválido'),
  time: z.string(),
  topic: z.string(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  price: z.number().positive().optional(),
  createdAt: z.string().datetime(),
  // Novos campos da API com session_slots
  activeSlot: SessionSlotSchema.nullable().optional(),
  slots: z.array(SessionSlotSchema).optional(),
  scheduledAt: z.string().datetime().optional(), // Computado do activeSlot
  duration: z.number().optional(), // Computado do activeSlot
  zoomLink: z.string().nullable().optional(), // Computado do activeSlot
  zoomMeetingId: z.string().nullable().optional(), // Computado do activeSlot
});

export type Session = z.infer<typeof SessionSchema>;

