import { useQuery } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { Session } from '@domain/entities/Session.entity';
import { useAuth } from '@/contexts/AuthContext';

export const useUserSessions = () => {
  const { user } = useAuth();

  return useQuery<Session[]>({
    queryKey: ['sessions', user?.id],
    queryFn: () => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      return container.listUserSessionsUseCase.execute(user.id);
    },
    enabled: !!user,
  });
};

