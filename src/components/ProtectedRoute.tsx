import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Verifica se há token no localStorage
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  // Se não houver token mas o usuário estiver "autenticado" no contexto, apenas limpa o localStorage
  // Não chama logout() para evitar deslogar o usuário desnecessariamente
  useEffect(() => {
    if (!loading && isAuthenticated && !hasToken) {
      // Token ausente mas usuário no contexto - limpa apenas o localStorage
      // Isso pode acontecer se o token não foi salvo corretamente durante o login
      localStorage.removeItem('user');
      // Não remove o token aqui pois pode não existir mesmo
    }
  }, [loading, isAuthenticated, hasToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não houver token ou não estiver autenticado, redireciona para login
  if (!isAuthenticated || !hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

