export interface CreateMentorDto {
  name: string;
  email: string;
  phone?: string | null;
  whatsappNumber?: string | null;
  role?: string | null;
  company?: string | null;
  specialty?: string | null;
  bio?: string | null;
  location?: string | null;
  avatar?: string | null;
  areas?: string[] | null;
  skills?: string[] | null;
  languages?: string[] | null;
  achievements?: string[] | null;
  experience?: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
  }> | null;
  pricePerHour?: number;
  status?: string;
}
