export interface CreateSessionDto {
  mentorId: number;
  date: string;
  time: string;
  topic: string;
  notes?: string;
}

