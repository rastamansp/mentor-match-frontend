import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { container } from '@/shared/di/container';
import { useUsers } from '../hooks/useUsers';
import { User } from '@domain/entities/User.entity';
import { Loader2, Trash2, ArrowLeft, User as UserIcon, Mail, Phone, Shield, Calendar, Edit as EditIcon, UserPlus, X, Star, DollarSign, AlertTriangle, Clock, Video, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useUserMentors } from '../hooks/useUserMentors';
import { useAssociateMentor } from '../hooks/useAssociateMentor';
import { useRemoveMentor } from '../hooks/useRemoveMentor';
import { useUserSessionsById } from '../hooks/useUserSessionsById';
import { useUserSessionsByIdAdmin } from '../hooks/useUserSessionsByIdAdmin';
import MentorSearchDialog from '../components/MentorSearchDialog';
import ScheduleSessionDialog from '../components/ScheduleSessionDialog';
import { Mentor } from '@domain/entities/Mentor.entity';
import { Session } from '@domain/entities/Session.entity';
import { useConfirmSession } from '../hooks/useConfirmSession';
import { useCancelSession } from '../hooks/useCancelSession';
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Componente para card de sessão na área admin
const SessionCardAdmin: React.FC<{
  session: Session;
  userId: string;
  onUpdate: () => void;
}> = ({ session, userId, onUpdate }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  // Verifica se pode confirmar: sessão agendada, tem activeSlot e não tem zoomLink ainda
  const canConfirm = session.status === 'scheduled' &&
    session.activeSlot &&
    !session.zoomLink;
  // Verifica se pode cancelar: sessão agendada
  const canCancel = session.status === 'scheduled';
  const confirmSession = useConfirmSession(session.id);
  const cancelSession = useCancelSession(session.id);

  const handleConfirm = async () => {
    try {
      await confirmSession.mutateAsync(undefined);
      toast.success('Sessão confirmada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['sessions', 'admin', userId] });
      onUpdate();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao confirmar sessão';
      toast.error(message);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSession.mutateAsync();
      toast.success('Sessão cancelada com sucesso.');
      setIsCancelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['sessions', 'admin', userId] });
      onUpdate();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cancelar sessão';
      toast.error(message);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{session.topic}</h3>
              <Badge
                variant={
                  session.status === 'scheduled'
                    ? 'default'
                    : session.status === 'completed'
                    ? 'secondary'
                    : 'destructive'
                }
                className="text-xs"
              >
                {session.status === 'scheduled'
                  ? 'Agendada'
                  : session.status === 'completed'
                  ? 'Concluída'
                  : 'Cancelada'}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {(() => {
                    try {
                      // Tenta parsear a data (pode ser YYYY-MM-DD ou ISO datetime)
                      const date = session.date.includes('T') 
                        ? new Date(session.date) 
                        : new Date(session.date + 'T00:00:00');
                      return date.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      });
                    } catch {
                      return session.date;
                    }
                  })()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{session.time}</span>
              </div>
              
              {session.mentorName && session.mentorName !== 'Mentor Name' && (
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>{session.mentorName}</span>
                </div>
              )}
              
              {session.zoomLink && (
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <a
                    href={session.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Link da reunião
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              
              {session.notes && (
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-0.5" />
                  <span className="line-clamp-2">{session.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/sessao/${session.id}`)}
            className="text-xs"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Detalhes
          </Button>
          {canConfirm && (
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={confirmSession.isPending}
              className="text-xs"
            >
              {confirmSession.isPending ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              )}
              Confirmar
            </Button>
          )}
          {canCancel && (
            <>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setIsCancelDialogOpen(true)}
                disabled={cancelSession.isPending}
                className="text-xs"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Cancelar
              </Button>
              <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar Sessão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja cancelar esta sessão? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={cancelSession.isPending}>
                      Não, manter sessão
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      disabled={cancelSession.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {cancelSession.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cancelando...
                        </>
                      ) : (
                        'Sim, cancelar sessão'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

const AdminEditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const { user: currentUser, logout, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN' | 'MENTOR'>('USER');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMentorDialogOpen, setIsMentorDialogOpen] = useState(false);
  const [mentorToRemove, setMentorToRemove] = useState<{ id: string; name: string } | null>(null);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isScheduleSessionDialogOpen, setIsScheduleSessionDialogOpen] = useState(false);
  
  // Hooks para mentores
  const { data: userMentors = [], isLoading: isLoadingMentors } = useUserMentors(id || '', 'ACTIVE');
  const associateMentorMutation = useAssociateMentor();
  const removeMentorMutation = useRemoveMentor();
  
  // Hook para sessões do usuário (usando endpoint admin)
  const { data: userSessions = [], isLoading: isLoadingSessions } = useUserSessionsByIdAdmin(id);

  // Buscar usuário por ID
  useEffect(() => {
    if (id && users.length > 0) {
      const foundUser = users.find(u => u.id === id);
      if (foundUser) {
        setUser(foundUser);
        setName(foundUser.name);
        setEmail(foundUser.email);
        setPhone(foundUser.phone || '');
        setRole(foundUser.role);
      }
    }
  }, [id, users]);

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

  // Função para aplicar máscara de telefone brasileiro
  const applyPhoneMask = (value: string): string => {
    // Remove tudo que não é número
    const cleaned = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    if (cleaned.length > 11) {
      return phone;
    }
    
    // Aplica máscara: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (cleaned.length <= 10) {
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyPhoneMask(e.target.value);
    setPhone(masked);
  };

  // Remove máscara antes de enviar
  const getCleanPhone = (): string => {
    return phone.replace(/\D/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setLoading(true);

    try {
      await container.updateUserUseCase.execute(id, {
        name,
        email,
        phone: getCleanPhone(),
        role,
      });
      toast.success('Usuário atualizado com sucesso!');
      navigate('/admin/users');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (!user) return;
    setIsDeleteUserDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id || !user) return;

    setDeleting(true);

    try {
      await container.deleteUserUseCase.execute(id);
      
      // Invalida o cache de usuários para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Se o usuário deletado for o próprio usuário logado, faz logout
      if (currentUser && currentUser.id === id) {
        toast.success('Usuário deletado com sucesso! Fazendo logout...');
        await logout();
        navigate('/login');
        return;
      }
      
      // Atualiza o usuário atual no contexto para garantir dados corretos
      await refreshUser();
      
      toast.success('Usuário deletado com sucesso!');
      setIsDeleteUserDialogOpen(false);
      navigate('/admin/users');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar usuário';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleAssociateMentor = async (mentor: Mentor) => {
    if (!id) return;

    try {
      await associateMentorMutation.mutateAsync({
        userId: id,
        dto: { mentorId: mentor.id },
      });
      toast.success(`Mentor ${mentor.name} associado com sucesso!`);
      // Fecha o dialog após associar com sucesso
      setIsMentorDialogOpen(false);
    } catch (error) {
      console.error('Erro ao associar mentor:', error);
      let message = 'Erro ao associar mentor';
      if (error instanceof Error) {
        message = error.message;
        // Se a mensagem indicar que a associação foi feita mas houve problema ao buscar dados,
        // mostra mensagem de sucesso com aviso e fecha o dialog
        if (message.includes('Associação realizada com sucesso')) {
          toast.success(`Mentor ${mentor.name} associado com sucesso! Os dados serão atualizados em instantes.`);
          setIsMentorDialogOpen(false);
          return;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        message = String(error.message);
      }
      toast.error(message);
    }
  };

  const handleRemoveMentorClick = (mentorId: string, mentorName: string) => {
    setMentorToRemove({ id: mentorId, name: mentorName });
  };

  const handleRemoveMentorConfirm = async () => {
    if (!id || !mentorToRemove) return;

    try {
      await removeMentorMutation.mutateAsync({
        userId: id,
        mentorId: mentorToRemove.id,
      });
      toast.success('Mentor removido com sucesso!');
      setMentorToRemove(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover mentor';
      toast.error(message);
    }
  };

  // IDs de mentores já associados para excluir da busca
  const associatedMentorIds = userMentors.map(um => um.mentorId);

  // Loading state enquanto busca usuários
  if (isLoadingUsers) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-md">
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state se usuário não encontrado
  if (!isLoadingUsers && (!id || !user)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-md">
            <Card className="p-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Usuário não encontrado</h1>
                <p className="text-muted-foreground mb-6">
                  O usuário que você está tentando editar não foi encontrado.
                </p>
                <Button onClick={() => navigate('/admin/users')}>
                  Voltar para Lista de Usuários
                </Button>
              </div>
            </Card>
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
          {/* Header com botão voltar */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/users')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Lista de Usuários
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Editar Usuário</h1>
                <p className="text-muted-foreground">
                  Atualize as informações do usuário abaixo
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card de Informações do Usuário */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="mt-1">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="text-sm font-medium break-all">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                      <p className="text-sm font-medium">{formatPhone(user.phone)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-muted-foreground mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Permissão</p>
                      <p className="text-sm font-medium">{user.role}</p>
                    </div>
                  </div>

                  {user.createdAt && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Criado em</p>
                        <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  )}

                  {user.updatedAt && user.updatedAt !== user.createdAt && (
                    <div className="flex items-start gap-3">
                      <EditIcon className="w-4 h-4 text-muted-foreground mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Última atualização</p>
                        <p className="text-sm font-medium">{formatDate(user.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Formulário de Edição */}
            <div className="lg:col-span-2">
              <Card className="p-8 shadow-lg">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">Informações do Usuário</h2>
                  <p className="text-muted-foreground">
                    Modifique os campos abaixo para atualizar as informações do usuário
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Informações Básicas */}
                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-primary" />
                      Informações Básicas
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-base font-medium">
                          Nome Completo <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative mt-2">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Nome completo do usuário"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 h-11"
                            required
                            disabled={loading}
                            minLength={3}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-base font-medium">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="email@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-11"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contato e Permissões */}
                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      Contato e Permissões
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone" className="text-base font-medium">
                          Telefone <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative mt-2">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="(11) 98722-1050"
                            value={phone}
                            onChange={handlePhoneChange}
                            className="pl-10 h-11"
                            required
                            disabled={loading}
                            minLength={14}
                            maxLength={15}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Digite apenas números (10 ou 11 dígitos)
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="role" className="text-base font-medium">
                          Permissão <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative mt-2">
                          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Select value={role} onValueChange={(value) => setRole(value as 'USER' | 'ADMIN' | 'MENTOR')} disabled={loading}>
                            <SelectTrigger id="role" className="pl-10 h-11">
                              <SelectValue placeholder="Selecione o role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USER">Usuário</SelectItem>
                              <SelectItem value="ADMIN">Administrador</SelectItem>
                              <SelectItem value="MENTOR">Mentor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/admin/users')}
                      className="flex-1 h-11"
                      disabled={loading || deleting}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-11 bg-gradient-hero border-0 hover:opacity-90"
                      disabled={loading || deleting}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <EditIcon className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Seção de Mentores Associados */}
              <Card className="p-6 mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Mentores Associados</h2>
                    <p className="text-sm text-muted-foreground">
                      Gerencie os mentores associados a este usuário
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setIsMentorDialogOpen(true)}
                    disabled={loading || deleting}
                    size="sm"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Mentor
                  </Button>
                </div>

                {isLoadingMentors ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : userMentors.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Nenhum mentor associado a este usuário
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsMentorDialogOpen(true)}
                      size="sm"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Mentor
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userMentors.map((userMentor) => (
                      <Card key={userMentor.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <img
                              src={userMentor.mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userMentor.mentor.name}`}
                              alt={userMentor.mentor.name}
                              className="w-12 h-12 rounded-full bg-gradient-hero object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-1">{userMentor.mentor.name}</h3>
                              {userMentor.mentor.specialty && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {userMentor.mentor.specialty}
                                </p>
                              )}
                              {userMentor.mentor.company && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  {userMentor.mentor.company}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {userMentor.mentor.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span>{userMentor.mentor.rating.toFixed(1)}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  <span>R$ {userMentor.mentor.pricePerHour}/h</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {userMentor.mentor.areas?.slice(0, 2).map((area) => (
                                  <Badge key={area} variant="secondary" className="text-xs">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={userMentor.status === 'ACTIVE' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {userMentor.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMentorClick(userMentor.mentorId, userMentor.mentor.name)}
                              disabled={removeMentorMutation.isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              {removeMentorMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>

              {/* Seção de Sessões do Usuário */}
              <Card className="p-6 mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Sessões do Usuário</h2>
                    <p className="text-sm text-muted-foreground">
                      Visualize todas as sessões de mentoria deste usuário
                    </p>
                  </div>
                  {userSessions.length > 0 && userMentors.length > 0 && (
                    <Button
                      type="button"
                      onClick={() => setIsScheduleSessionDialogOpen(true)}
                      disabled={loading || deleting}
                      size="sm"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Sessão
                    </Button>
                  )}
                </div>

                {isLoadingSessions ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : userSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Nenhuma sessão encontrada para este usuário
                    </p>
                    {userMentors.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground mb-2">
                          É necessário associar um mentor ao usuário antes de agendar uma sessão
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsMentorDialogOpen(true)}
                          size="sm"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Associar Mentor Primeiro
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsScheduleSessionDialogOpen(true)}
                        size="sm"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Adicionar Primeira Sessão para Este usuário
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userSessions.map((session) => (
                      <SessionCardAdmin
                        key={session.id}
                        session={session}
                        userId={id || ''}
                        onUpdate={() => {
                          queryClient.invalidateQueries({ queryKey: ['sessions', 'admin', id] });
                        }}
                      />
                    ))}
                  </div>
                )}
              </Card>

              {/* Seção de Ações Perigosas */}
              <Card className="p-6 mt-6 border-destructive/20">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-destructive mb-2">Zona de Perigo</h2>
                  <p className="text-sm text-muted-foreground">
                    Ações irreversíveis que afetam permanentemente este usuário
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="w-full"
                  disabled={loading || deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deletando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar Usuário
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  ⚠️ Esta ação não pode ser desfeita. O usuário será permanentemente removido do sistema.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Busca de Mentores */}
      <MentorSearchDialog
        open={isMentorDialogOpen}
        onOpenChange={setIsMentorDialogOpen}
        onSelectMentor={handleAssociateMentor}
        excludeMentorIds={associatedMentorIds}
        isLoading={associateMentorMutation.isPending}
      />

      {/* Dialog de Agendamento de Sessão */}
      {id && (
        <ScheduleSessionDialog
          open={isScheduleSessionDialogOpen}
          onOpenChange={setIsScheduleSessionDialogOpen}
          userId={id}
          associatedMentorIds={associatedMentorIds}
          isAdmin={true}
          onSuccess={() => {
            // Invalida o cache de sessões para atualizar a lista
            queryClient.invalidateQueries({ queryKey: ['sessions', 'admin', id] });
          }}
        />
      )}

      {/* Dialog de Confirmação de Remoção de Mentor */}
      <AlertDialog open={!!mentorToRemove} onOpenChange={(open) => !open && setMentorToRemove(null)}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">Remover Mentor</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2 text-base">
              Tem certeza que deseja remover o mentor <strong>"{mentorToRemove?.name}"</strong> deste usuário?
              <br />
              <br />
              Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel disabled={removeMentorMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMentorConfirm}
              disabled={removeMentorMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMentorMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover Mentor
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação de Deleção de Usuário */}
      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">Deletar Usuário</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2 text-base">
              Tem certeza que deseja deletar o usuário <strong>"{user?.name}"</strong>?
              <br />
              <br />
              <span className="font-semibold text-destructive">Esta ação não pode ser desfeita.</span> O usuário será permanentemente removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel disabled={deleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deletar Usuário
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEditUser;
