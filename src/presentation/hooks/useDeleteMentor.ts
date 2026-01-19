import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';

export const useDeleteMentor = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (mentorId: string) => {
      return container.deleteMentorUseCase.execute(mentorId);
    },
    onSuccess: (_, mentorId) => {
      // Invalida queries relacionadas ao mentor
      queryClient.invalidateQueries({ queryKey: ['mentor', mentorId] });
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    },
  });
};

