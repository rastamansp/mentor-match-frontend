import { useQuery } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { UserMentor } from '@domain/entities/UserMentor.entity';
import { useAuth } from '@/contexts/AuthContext';

export const useUserMentors = (userId: string, status?: 'ACTIVE' | 'INACTIVE') => {
  const { user, isAuthenticated } = useAuth();
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  return useQuery<UserMentor[]>({
    queryKey: ['userMentors', userId, status],
    queryFn: () => {
      if (!user || !hasToken) {
        throw new Error('Usuário não autenticado');
      }
      return container.listUserMentorsUseCase.execute(userId, status);
    },
    enabled: !!user && isAuthenticated && hasToken && !!userId,
    retry: false,
  });
};
