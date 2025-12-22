import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { Session } from '@domain/entities/Session.entity';

export const useCancelSession = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Session, Error, void>({
    mutationFn: async () => {
      return container.cancelSessionUseCase.execute(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'admin'] });
    },
  });
};
