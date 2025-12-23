import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { UpdateAvailabilityDto } from '@application/dto/UpdateAvailabilityDto';
import { Availability } from '@domain/entities/Availability.entity';

export const useUpdateAvailability = (mentorId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Availability, Error, { availabilityId: string; dto: UpdateAvailabilityDto }>({
    mutationFn: ({ availabilityId, dto }) => {
      return container.updateAvailabilityUseCase.execute(mentorId, availabilityId, dto);
    },
    onSuccess: () => {
      // Invalida a query de disponibilidades do mentor
      queryClient.invalidateQueries({ queryKey: ['mentorAvailability', mentorId] });
    },
  });
};
