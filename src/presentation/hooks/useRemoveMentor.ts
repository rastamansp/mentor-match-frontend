import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';

export const useRemoveMentor = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { userId: string; mentorId: string }>({
    mutationFn: ({ userId, mentorId }) => {
      return container.removeMentorUseCase.execute(userId, mentorId);
    },
    onSuccess: (_, variables) => {
      // Invalida o cache de mentores do usuário
      queryClient.invalidateQueries({ queryKey: ['userMentors', variables.userId] });
    },
  });
};
