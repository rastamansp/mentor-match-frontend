export interface UpdateMentorDto {
  name?: string;
  email?: string;
  role?: string | null;
  company?: string | null;
  specialty?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  bio?: string | null;
  location?: string | null;
  avatar?: string | null;
  areas?: string[] | null;
  skills?: string[] | null;
  languages?: string[];
  achievements?: string[] | null;
  pricePerHour?: number;
  status?: string;
}
