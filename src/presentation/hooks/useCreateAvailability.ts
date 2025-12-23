import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { CreateAvailabilityDto } from '@application/dto/CreateAvailabilityDto';
import { Availability } from '@domain/entities/Availability.entity';

export const useCreateAvailability = (mentorId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Availability, Error, CreateAvailabilityDto>({
    mutationFn: (dto: CreateAvailabilityDto) => {
      return container.createAvailabilityUseCase.execute(mentorId, dto);
    },
    onSuccess: () => {
      // Invalida a query de disponibilidades do mentor
      queryClient.invalidateQueries({ queryKey: ['mentorAvailability', mentorId] });
    },
  });
};
