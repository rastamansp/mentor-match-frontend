import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@domain/entities/User.entity';
import { container } from '@shared/di/container';
import { LoginDto } from '@application/dto/LoginDto';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMentor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await container.authRepository.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await container.authRepository.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // Silenciosamente falha se não houver usuário autenticado
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (dto: LoginDto) => {
    try {
      const loggedInUser = await container.loginUseCase.execute(dto);
      setUser(loggedInUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await container.logoutUseCase.execute();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      // Mesmo se houver erro, limpa o estado local
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isMentor: user?.role === 'MENTOR',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

