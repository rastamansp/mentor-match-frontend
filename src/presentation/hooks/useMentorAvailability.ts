import { useQuery } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { Availability } from '@domain/entities/Availability.entity';

export const useMentorAvailability = (mentorId: string) => {
  return useQuery<Availability[]>({
    queryKey: ['mentor-availability', mentorId],
    queryFn: () => container.getMentorAvailabilityUseCase.execute(mentorId),
    enabled: !!mentorId,
  });
};

