import { z } from 'zod';
import { MentorFiltersDto } from '../dto/MentorFiltersDto';

export const MentorFiltersSchema = z.object({
  searchTerm: z.string().optional(),
  specialty: z.string().optional(),
  location: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxPrice: z.number().positive().optional(),
});

export function validateMentorFilters(data: unknown): MentorFiltersDto {
  return MentorFiltersSchema.parse(data);
}

