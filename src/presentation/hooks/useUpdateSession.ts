import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { Session } from '@domain/entities/Session.entity';
import { UpdateSessionDto } from '@application/dto/UpdateSessionDto';

export const useUpdateSession = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Session, Error, UpdateSessionDto>({
    mutationFn: async (dto) => {
      return container.updateSessionUseCase.execute(sessionId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
