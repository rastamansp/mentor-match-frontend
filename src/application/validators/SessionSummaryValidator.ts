import { z } from 'zod';
import { SessionSummaryDto } from '../dto/SessionSummaryDto';

const SessionSummaryDetailSchema = z.object({
  label: z.string(),
  summary: z.string(),
});

export const SessionSummarySchema = z.object({
  meeting_host_id: z.string(),
  meeting_host_email: z.string().email(),
  meeting_uuid: z.string(),
  meeting_id: z.number(),
  meeting_topic: z.string(),
  meeting_start_time: z.string().datetime(),
  meeting_end_time: z.string().datetime(),
  summary_start_time: z.string().datetime(),
  summary_end_time: z.string().datetime(),
  summary_created_time: z.string().datetime(),
  summary_last_modified_time: z.string().datetime(),
  summary_title: z.string(),
  summary_overview: z.string(),
  summary_details: z.array(SessionSummaryDetailSchema),
  next_steps: z.array(z.string()),
  summary_content: z.string(),
  summary_doc_url: z.string().url(),
});

export function validateSessionSummary(data: unknown): SessionSummaryDto {
  return SessionSummarySchema.parse(data);
}
