import { useMutation } from '@tanstack/react-query';
import { LoginDto } from '@application/dto/LoginDto';
import { User } from '@domain/entities/User.entity';

export const useLogin = () => {
  // This hook is mainly for consistency, but login is handled by AuthContext
  // We can use this for additional login-related queries if needed
  return useMutation<User, Error, LoginDto>({
    mutationFn: async () => {
      throw new Error('Use AuthContext.login instead');
    },
  });
};

