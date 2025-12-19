import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Shield, Calendar, Edit, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';

const MyArea = () => {
  const { user: authUser } = useAuth();
  const { data: profile, isLoading, error } = useProfile();

  // Função para formatar telefone
  const formatPhone = (phone?: string): string => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  // Função para formatar data
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Função para obter cor do badge de role
  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'MENTOR':
        return 'default';
      case 'USER':
      default:
        return 'secondary';
    }
  };

  // Função para obter label do role
  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'MENTOR':
        return 'Mentor';
      case 'USER':
      default:
        return 'Usuário';
    }
  };

  const getUserInitials = (name?: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar perfil';
    const isAuthError = errorMessage.includes('não autenticado') || errorMessage.includes('Sessão expirada');
    
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="text-center py-16">
              <p className="text-lg text-destructive mb-4">
                {isAuthError ? 'Sessão expirada ou token não encontrado' : 'Erro ao carregar perfil'}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {isAuthError ? 'Por favor, faça login novamente para continuar.' : errorMessage}
              </p>
              {isAuthError ? (
                <Button onClick={() => window.location.href = '/login'}>
                  Ir para Login
                </Button>
              ) : (
                <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">Perfil não encontrado</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Minha Área</h1>
            <p className="text-lg text-muted-foreground">
              Visualize e gerencie suas informações pessoais
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card de Informações do Usuário */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-center mb-2">{profile.name}</h2>
                  <Badge variant={getRoleBadgeVariant(profile.role)}>
                    {getRoleLabel(profile.role)}
                  </Badge>
                </div>
              </Card>
            </div>

            {/* Card de Detalhes */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Informações Pessoais</h2>
                  <p className="text-sm text-muted-foreground">
                    Dados da sua conta no MentorMatch
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <Mail className="w-5 h-5 text-muted-foreground mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="text-sm font-medium break-all">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-4 border-b">
                    <Phone className="w-5 h-5 text-muted-foreground mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                      <p className="text-sm font-medium">{formatPhone(profile.phone)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-4 border-b">
                    <Shield className="w-5 h-5 text-muted-foreground mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Tipo de Conta</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{getRoleLabel(profile.role)}</p>
                        <Badge variant={getRoleBadgeVariant(profile.role)} className="text-xs">
                          {profile.role}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {profile.createdAt && (
                    <div className="flex items-start gap-3 pb-4 border-b">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Conta criada em</p>
                        <p className="text-sm font-medium">{formatDate(profile.createdAt)}</p>
                      </div>
                    </div>
                  )}

                  {profile.updatedAt && profile.updatedAt !== profile.createdAt && (
                    <div className="flex items-start gap-3">
                      <Edit className="w-5 h-5 text-muted-foreground mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Última atualização</p>
                        <p className="text-sm font-medium">{formatDate(profile.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyArea;
