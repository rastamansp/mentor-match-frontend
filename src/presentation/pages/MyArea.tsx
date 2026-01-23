import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Phone, Shield, Calendar, Edit, Loader2, GraduationCap, Briefcase, MapPin, Star, ExternalLink, Clock, MessageSquare, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useUserMentors } from '../hooks/useUserMentors';
import { useUserSessions } from '../hooks/useUserSessions';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useCallback } from 'react';
import { convertLocalToUtc } from '@/shared/utils/timezone';

const MyArea = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const { data: profile, isLoading, error } = useProfile();
  const { data: userMentors = [], isLoading: isLoadingMentors } = useUserMentors(authUser?.id || '', 'ACTIVE');
  const { data: sessions = [], isLoading: isLoadingSessions } = useUserSessions();

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

  // Função para formatar data completa (para sessões)
  const formatDateFull = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Função auxiliar para obter a data/hora da sessão em UTC (usando useCallback para evitar problemas de closure)
  const getSessionDateTime = useCallback((session: typeof sessions[0]): Date | null => {
    // Prioridade 1: scheduledAt (já está em UTC)
    if (session.scheduledAt) {
      const date = new Date(session.scheduledAt);
      if (isNaN(date.getTime())) return null;
      console.log('📅 Sessão', session.id, 'usando scheduledAt:', session.scheduledAt, '->', date.toISOString());
      return date;
    }
    // Prioridade 2: activeSlot.startAtUtc
    if (session.activeSlot?.startAtUtc) {
      const date = new Date(session.activeSlot.startAtUtc);
      if (isNaN(date.getTime())) return null;
      console.log('📅 Sessão', session.id, 'usando activeSlot.startAtUtc:', session.activeSlot.startAtUtc, '->', date.toISOString());
      return date;
    }
    // Prioridade 3: Fallback usando o primeiro slot disponível (quando activeSlot é null)
    if (session.slots && session.slots.length > 0) {
      const firstSlot = session.slots[0];
      if (firstSlot.startAtUtc) {
        const date = new Date(firstSlot.startAtUtc);
        if (isNaN(date.getTime())) return null;
        console.log('📅 Sessão', session.id, 'usando slots[0].startAtUtc:', firstSlot.startAtUtc, '->', date.toISOString());
        return date;
      }
    }
    // Prioridade 4: Fallback usando date + time + timezone
    if (session.date && session.time) {
      try {
        const timezone = session.activeSlot?.timezone || session.slots?.[0]?.timezone || 'America/Sao_Paulo';
        const utcDateTime = convertLocalToUtc(session.date, session.time, timezone);
        const date = new Date(utcDateTime);
        if (isNaN(date.getTime())) return null;
        console.log('📅 Sessão', session.id, 'usando date+time:', session.date, session.time, timezone, '->', date.toISOString());
        return date;
      } catch (error) {
        console.error('Erro ao converter date/time para UTC:', error, session);
        return null;
      }
    }
    console.log('⚠️ Sessão', session.id, 'sem data disponível');
    return null;
  }, []);

  // Sessões próximas: status 'scheduled' E data/hora ainda não passou
  const upcomingSessions = useMemo(() => {
    const nowTimestamp = Date.now();
    const now = new Date(nowTimestamp);
    console.log('🔵 FILTRO PRÓXIMAS - Agora:', now.toISOString(), 'Timestamp:', nowTimestamp);
    
    return sessions.filter(s => {
      if (s.status !== 'scheduled') return false;
      
      const sessionDateTime = getSessionDateTime(s);
      if (!sessionDateTime) {
        console.log('✅ Sessão', s.id, s.topic, 'sem data -> PRÓXIMA');
        return true;
      }
      
      const sessionTimestamp = sessionDateTime.getTime();
      const isUpcoming = sessionTimestamp > nowTimestamp;
      console.log('📊 Sessão', s.id, s.topic, 'Data:', sessionDateTime.toISOString(), 'Timestamp:', sessionTimestamp, 'É próxima?', isUpcoming, 'Diferença:', (sessionTimestamp - nowTimestamp) / (1000 * 60 * 60), 'horas');
      
      return isUpcoming;
    });
  }, [sessions, getSessionDateTime]);

  // Sessões anteriores: status 'completed' OU status 'scheduled' mas data/hora já passou (SEM canceladas)
  const pastSessions = useMemo(() => {
    const nowTimestamp = Date.now();
    const now = new Date(nowTimestamp);
    console.log('🔴 FILTRO ANTERIORES - Agora:', now.toISOString(), 'Timestamp:', nowTimestamp);
    
    return sessions.filter(s => {
      // Ignora sessões canceladas (elas vão para a aba "Canceladas")
      if (s.status === 'cancelled') {
        return false;
      }
      
      if (s.status === 'completed') {
        console.log('✅ Sessão', s.id, s.topic, 'COMPLETADA -> ANTERIOR');
        return true;
      }
      
      if (s.status === 'scheduled') {
        const sessionDateTime = getSessionDateTime(s);
        if (!sessionDateTime) {
          console.log('⚠️ Sessão', s.id, s.topic, 'sem data -> NÃO É PASSADA');
          return false;
        }
        
        const sessionTimestamp = sessionDateTime.getTime();
        const isPast = sessionTimestamp <= nowTimestamp;
        console.log('📊 Sessão', s.id, s.topic, 'Data:', sessionDateTime.toISOString(), 'Timestamp:', sessionTimestamp, 'É passada?', isPast, 'Diferença:', (nowTimestamp - sessionTimestamp) / (1000 * 60 * 60), 'horas');
        
        return isPast;
      }
      
      return false;
    });
  }, [sessions, getSessionDateTime]);

  // Sessões canceladas: todas as sessões com status 'cancelled'
  const cancelledSessions = useMemo(() => {
    console.log('❌ FILTRO CANCELADAS');
    
    return sessions.filter(s => {
      if (s.status === 'cancelled') {
        console.log('❌ Sessão', s.id, s.topic, 'CANCELADA');
        return true;
      }
      return false;
    });
  }, [sessions]);

  const getUserInitials = (name?: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || isLoadingMentors || isLoadingSessions) {
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

          {/* Card de Mentor Associado */}
          {userMentors.length > 0 && (
            <div className="mt-6">
              <Card className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Mentor Associado</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Informações do mentor vinculado à sua conta
                  </p>
                </div>

                <div className="space-y-6">
                  {userMentors.map((userMentor) => {
                    const mentor = userMentor.mentor;
                    return (
                      <div key={userMentor.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Avatar e Nome */}
                          <div className="flex items-start gap-4">
                            {mentor.avatar ? (
                              <img
                                src={mentor.avatar}
                                alt={mentor.name}
                                className="w-20 h-20 rounded-full bg-gradient-hero object-cover"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gradient-hero flex items-center justify-center">
                                <span className="text-white font-semibold text-2xl">
                                  {mentor.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">{mentor.name}</h3>
                              {mentor.role && (
                                <p className="text-sm text-muted-foreground mb-2">{mentor.role}</p>
                              )}
                              {mentor.company && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                  <Briefcase className="w-4 h-4" />
                                  <span>{mentor.company}</span>
                                </div>
                              )}
                              {mentor.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-medium">{mentor.rating.toFixed(1)}</span>
                                  {mentor.reviews && (
                                    <span className="text-sm text-muted-foreground">
                                      ({mentor.reviews} avaliações)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Informações Detalhadas */}
                          <div className="flex-1 space-y-3">
                            {mentor.email && (
                              <div className="flex items-start gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                                  <p className="text-sm font-medium break-all">{mentor.email}</p>
                                </div>
                              </div>
                            )}

                            {mentor.phone && (
                              <div className="flex items-start gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground mb-0.5">Telefone</p>
                                  <p className="text-sm font-medium">{formatPhone(mentor.phone)}</p>
                                </div>
                              </div>
                            )}

                            {mentor.location && (
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground mb-0.5">Localização</p>
                                  <p className="text-sm font-medium">{mentor.location}</p>
                                </div>
                              </div>
                            )}

                            {mentor.specialty && (
                              <div className="flex items-start gap-2">
                                <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground mb-0.5">Especialidade</p>
                                  <p className="text-sm font-medium">{mentor.specialty}</p>
                                </div>
                              </div>
                            )}

                            {mentor.pricePerHour && (
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground mb-0.5">Valor por hora</p>
                                  <p className="text-sm font-medium">R$ {mentor.pricePerHour.toFixed(2)}</p>
                                </div>
                              </div>
                            )}

                            {mentor.bio && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-muted-foreground mb-1">Biografia</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{mentor.bio}</p>
                              </div>
                            )}

                            {mentor.areas && mentor.areas.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-muted-foreground mb-2">Áreas de Atuação</p>
                                <div className="flex flex-wrap gap-2">
                                  {mentor.areas.map((area, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {area}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {mentor.skills && mentor.skills.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-muted-foreground mb-2">Habilidades</p>
                                <div className="flex flex-wrap gap-2">
                                  {mentor.skills.map((skill, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-4 pt-4 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/mentor/${mentor.id}`)}
                                className="w-full md:w-auto"
                              >
                                Ver Perfil Completo
                                <ExternalLink className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Card de Sessões */}
          <div className="mt-6">
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">Minhas Sessões</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gerencie suas mentorias agendadas e revise sessões anteriores
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full max-w-2xl grid-cols-3">
                  <TabsTrigger value="upcoming">
                    Próximas ({upcomingSessions.length})
                  </TabsTrigger>
                  <TabsTrigger value="past">
                    Anteriores ({pastSessions.length})
                  </TabsTrigger>
                  <TabsTrigger value="cancelled">
                    Canceladas ({cancelledSessions.length})
                  </TabsTrigger>
                </TabsList>

                {/* Upcoming Sessions */}
                <TabsContent value="upcoming" className="space-y-4">
                  {upcomingSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Nenhuma sessão agendada</h3>
                      <p className="text-muted-foreground mb-4">
                        Que tal agendar uma mentoria com um especialista?
                      </p>
                      <Button onClick={() => navigate('/mentors')} variant="outline" size="sm">
                        Encontrar Mentores
                      </Button>
                    </div>
                  ) : (
                    upcomingSessions.map((session) => (
                      <Card key={session.id} className="p-4 hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          {/* Left Section - Mentor Info */}
                          <div className="flex items-start space-x-3 flex-1">
                            {session.mentorAvatar ? (
                              <img
                                src={session.mentorAvatar}
                                alt={session.mentorName}
                                className="w-12 h-12 rounded-full bg-gradient-hero object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {session.mentorName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base mb-1">{session.mentorName}</h3>
                              <p className="text-sm text-foreground">{session.topic}</p>
                            </div>
                          </div>

                          {/* Middle Section - Date/Time */}
                          <div className="flex flex-col space-y-1 min-w-[180px]">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span className="text-xs">{formatDateFull(session.date)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{session.time} BRT</span>
                            </div>
                            <Badge className="w-fit bg-accent/10 text-accent hover:bg-accent/20 text-xs">
                              {session.status === 'scheduled' ? 'Agendada' : 'Pendente'}
                            </Badge>
                          </div>

                          {/* Right Section - Actions */}
                          <div className="flex flex-col space-y-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/sessao/${session.id}`)}
                            >
                              Detalhes
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Past Sessions */}
                <TabsContent value="past" className="space-y-4">
                  {pastSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Nenhuma sessão anterior</h3>
                      <p className="text-muted-foreground">
                        Suas sessões completadas aparecerão aqui
                      </p>
                    </div>
                  ) : (
                    pastSessions.map((session) => (
                      <Card key={session.id} className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          {/* Left Section - Mentor Info */}
                          <div className="flex items-start space-x-3 flex-1">
                            {session.mentorAvatar ? (
                              <img
                                src={session.mentorAvatar}
                                alt={session.mentorName}
                                className="w-12 h-12 rounded-full bg-gradient-hero object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {session.mentorName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base mb-1">{session.mentorName}</h3>
                              <p className="text-sm text-foreground mb-1">{session.topic}</p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDateFull(session.date)} às {session.time}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Section - Actions */}
                          <div className="flex flex-col space-y-2 min-w-[120px]">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/sessao/${session.id}`)}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Cancelled Sessions */}
                <TabsContent value="cancelled" className="space-y-4">
                  {cancelledSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <XCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Nenhuma sessão cancelada</h3>
                      <p className="text-muted-foreground">
                        Suas sessões canceladas aparecerão aqui
                      </p>
                    </div>
                  ) : (
                    cancelledSessions.map((session) => {
                      const sessionDateTime = getSessionDateTime(session);
                      const isPast = sessionDateTime ? sessionDateTime.getTime() <= Date.now() : false;
                      
                      return (
                        <Card key={session.id} className="p-4 border-destructive/20">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            {/* Left Section - Mentor Info */}
                            <div className="flex items-start space-x-3 flex-1">
                              {session.mentorAvatar ? (
                                <img
                                  src={session.mentorAvatar}
                                  alt={session.mentorName}
                                  className="w-12 h-12 rounded-full bg-gradient-hero object-cover opacity-60"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center opacity-60">
                                  <span className="text-white font-semibold text-sm">
                                    {session.mentorName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base mb-1">{session.mentorName}</h3>
                                <p className="text-sm text-foreground mb-1">{session.topic}</p>
                                {sessionDateTime && (
                                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDateFull(session.date)} às {session.time}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Middle Section - Status */}
                            <div className="flex flex-col space-y-1 min-w-[120px]">
                              <Badge variant="destructive" className="w-fit text-xs">
                                Cancelada
                              </Badge>
                              {sessionDateTime && (
                                <span className="text-xs text-muted-foreground">
                                  {isPast ? 'Data já passou' : 'Data futura'}
                                </span>
                              )}
                            </div>

                            {/* Right Section - Actions */}
                            <div className="flex flex-col space-y-2 min-w-[120px]">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/sessao/${session.id}`)}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyArea;
