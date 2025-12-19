import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { Session } from '@domain/entities/Session.entity';
import { CreateSessionDto } from '@application/dto/CreateSessionDto';

export const useCreateSessionForUser = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Session, Error, CreateSessionDto>({
    mutationFn: async (dto) => {
      return container.createSessionUseCase.execute(dto, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
