import { Mentor } from '../entities/Mentor.entity';

export interface MentorFilters {
  searchTerm?: string;
  specialty?: string;
  location?: string;
  minRating?: number;
  maxPrice?: number;
}

export interface IMentorRepository {
  findAll(filters?: MentorFilters): Promise<Mentor[]>;
  findById(id: number): Promise<Mentor | null>;
  search(query: string): Promise<Mentor[]>;
}

