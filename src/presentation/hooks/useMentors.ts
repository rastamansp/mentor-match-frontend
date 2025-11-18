import { useQuery } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { Mentor } from '@domain/entities/Mentor.entity';
import { MentorFiltersDto } from '@application/dto/MentorFiltersDto';

export const useMentors = (filters?: MentorFiltersDto) => {
  return useQuery<Mentor[]>({
    queryKey: ['mentors', filters],
    queryFn: () => container.listMentorsUseCase.execute(filters),
  });
};

