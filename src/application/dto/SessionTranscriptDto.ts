export interface SessionTranscriptDto {
  meeting_id: string;
  transcript_content: string;
  meeting_topic?: string;
  transcript_created_time?: string;
  can_download?: boolean;
  download_url?: string;
  account_id?: string;
  host_id?: string;
  auto_delete?: boolean;
}
