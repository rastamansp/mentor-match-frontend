import { useQuery } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { Session } from '@domain/entities/Session.entity';
import { useAuth } from '@/contexts/AuthContext';

export const useUserSessions = () => {
  const { user, isAuthenticated } = useAuth();

  // Verifica se há token no localStorage
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  return useQuery<Session[]>({
    queryKey: ['sessions', user?.id],
    queryFn: () => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      if (!hasToken) {
        throw new Error('Token não encontrado. Por favor, faça login novamente.');
      }
      return container.listUserSessionsUseCase.execute(user.id);
    },
    enabled: !!user && isAuthenticated && hasToken, // Só executa se tiver user, estiver autenticado E tiver token
    retry: false, // Não tenta novamente se falhar por falta de token
  });
};

