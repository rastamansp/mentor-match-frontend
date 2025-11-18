import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { Session } from '@domain/entities/Session.entity';
import { CreateSessionDto } from '@application/dto/CreateSessionDto';
import { useAuth } from '@/contexts/AuthContext';

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<Session, Error, CreateSessionDto>({
    mutationFn: async (dto) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      return container.createSessionUseCase.execute(dto, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

