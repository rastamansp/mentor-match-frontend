import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { Session } from '@domain/entities/Session.entity';
import { ConfirmSessionDto } from '@application/dto/ConfirmSessionDto';

export const useConfirmSession = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Session, Error, ConfirmSessionDto | undefined>({
    mutationFn: async (dto) => {
      return container.confirmSessionUseCase.execute(sessionId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'admin'] });
    },
  });
};
