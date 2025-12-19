import { useQuery } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { Session } from '@domain/entities/Session.entity';

export const useSessionById = (sessionId: string | undefined) => {
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  return useQuery<Session>({
    queryKey: ['session', sessionId],
    queryFn: () => {
      if (!sessionId) {
        throw new Error('ID da sessão não fornecido');
      }
      if (!hasToken) {
        throw new Error('Token não encontrado. Por favor, faça login novamente.');
      }
      return container.getSessionByIdUseCase.execute(sessionId);
    },
    enabled: !!sessionId && hasToken,
    retry: false,
  });
};
