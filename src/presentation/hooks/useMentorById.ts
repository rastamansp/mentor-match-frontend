import { useQuery } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { Mentor } from '@domain/entities/Mentor.entity';

export const useMentorById = (id: number) => {
  return useQuery<Mentor>({
    queryKey: ['mentor', id],
    queryFn: () => container.getMentorByIdUseCase.execute(id),
    enabled: !!id,
  });
};

