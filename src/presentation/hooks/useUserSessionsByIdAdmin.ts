import { useQuery } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { Session } from '@domain/entities/Session.entity';

export const useUserSessionsByIdAdmin = (userId: string | undefined) => {
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  return useQuery<Session[]>({
    queryKey: ['sessions', 'admin', userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('ID do usuário não fornecido');
      }
      if (!hasToken) {
        throw new Error('Token não encontrado. Por favor, faça login novamente.');
      }
      return container.listUserSessionsAdminUseCase.execute(userId);
    },
    enabled: !!userId && hasToken,
    retry: false,
  });
};
