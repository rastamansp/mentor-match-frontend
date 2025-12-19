import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { Session } from '@domain/entities/Session.entity';
import { CreateSessionAdminDto } from '@application/dto/CreateSessionAdminDto';

export const useCreateSessionForUserAdmin = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Session, Error, CreateSessionAdminDto>({
    mutationFn: async (dto) => {
      return container.createSessionAdminUseCase.execute(userId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'admin'] });
    },
  });
};
