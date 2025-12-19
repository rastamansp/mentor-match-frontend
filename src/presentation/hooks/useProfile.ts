import { useQuery } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { User } from '@domain/entities/User.entity';
import { useAuth } from '@/contexts/AuthContext';

export const useProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  return useQuery<User>({
    queryKey: ['profile', user?.id],
    queryFn: () => {
      if (!user || !hasToken) {
        throw new Error('Usuário não autenticado');
      }
      return container.getProfileUseCase.execute();
    },
    enabled: !!user && isAuthenticated && hasToken,
    retry: false,
  });
};
