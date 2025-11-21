import { Mentor } from '../entities/Mentor.entity';

export interface MentorFilters {
  searchTerm?: string;
  specialty?: string;
  location?: string;
  minRating?: number;
  maxPrice?: number;
  area?: string;
  language?: string;
}

export interface IMentorRepository {
  findAll(filters?: MentorFilters): Promise<Mentor[]>;
  findById(id: string): Promise<Mentor | null>;
  search(query: string): Promise<Mentor[]>;
}

