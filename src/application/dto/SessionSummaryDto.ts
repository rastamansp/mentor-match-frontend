export interface SessionSummaryDetail {
  label: string;
  summary: string;
}

export interface SessionSummaryDto {
  meeting_host_id: string;
  meeting_host_email: string;
  meeting_uuid: string;
  meeting_id: number;
  meeting_topic: string;
  meeting_start_time: string;
  meeting_end_time: string;
  summary_start_time: string;
  summary_end_time: string;
  summary_created_time: string;
  summary_last_modified_time: string;
  summary_title: string;
  summary_overview: string;
  summary_details: SessionSummaryDetail[];
  next_steps: string[];
  summary_content: string;
  summary_doc_url: string;
}
