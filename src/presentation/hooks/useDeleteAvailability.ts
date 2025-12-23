import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';

export const useDeleteAvailability = (mentorId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (availabilityId: string) => {
      return container.deleteAvailabilityUseCase.execute(mentorId, availabilityId);
    },
    onSuccess: () => {
      // Invalida a query de disponibilidades do mentor
      queryClient.invalidateQueries({ queryKey: ['mentorAvailability', mentorId] });
    },
  });
};
