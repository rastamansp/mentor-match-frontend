import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Video, MessageSquare, Download, XCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useUserSessions } from "../hooks/useUserSessions";

const MySessions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const { data: sessions = [], isLoading, error } = useUserSessions();

  // Função auxiliar para obter a data/hora da sessão em UTC
  const getSessionDateTime = (session: typeof sessions[0]): Date | null => {
    // Prioridade 1: scheduledAt (já está em UTC)
    if (session.scheduledAt) {
      const date = new Date(session.scheduledAt);
      if (isNaN(date.getTime())) return null;
      return date;
    }
    // Prioridade 2: activeSlot.startAtUtc
    if (session.activeSlot?.startAtUtc) {
      const date = new Date(session.activeSlot.startAtUtc);
      if (isNaN(date.getTime())) return null;
      return date;
    }
    // Prioridade 3: Fallback usando o primeiro slot disponível (quando activeSlot é null)
    if (session.slots && session.slots.length > 0) {
      const firstSlot = session.slots[0];
      if (firstSlot.startAtUtc) {
        const date = new Date(firstSlot.startAtUtc);
        if (isNaN(date.getTime())) return null;
        return date;
      }
    }
    // Se não tiver data UTC disponível, retorna null
    return null;
  };

  const now = new Date();

  // Sessões próximas: status 'scheduled' E data/hora ainda não passou
  const upcomingSessions = sessions.filter(s => {
    if (s.status !== 'scheduled') return false;
    
    const sessionDateTime = getSessionDateTime(s);
    // Se não tiver data/hora, considera como próxima (fallback)
    if (!sessionDateTime) return true;
    
    // Verifica se a data/hora ainda não passou
    return sessionDateTime > now;
  });

  // Sessões anteriores: status 'completed' OU status 'scheduled' mas data/hora já passou (SEM canceladas)
  const pastSessions = sessions.filter(s => {
    // Ignora sessões canceladas (elas vão para a aba "Canceladas")
    if (s.status === 'cancelled') return false;
    
    // Sessões completadas sempre vão para anteriores
    if (s.status === 'completed') return true;
    
    // Sessões agendadas que já passaram também vão para anteriores
    if (s.status === 'scheduled') {
      const sessionDateTime = getSessionDateTime(s);
      // Se não tiver data/hora, não considera como passada (fica nas próximas)
      if (!sessionDateTime) return false;
      
      // Se a data/hora já passou, considera como passada
      return sessionDateTime <= now;
    }
    
    return false;
  });

  // Sessões canceladas: todas as sessões com status 'cancelled'
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled');

  const oldUpcomingSessions = [
    {
      id: 1,
      mentor: {
        name: "Ana Silva",
        role: "Senior Product Manager",
        company: "Google",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
      },
      date: "2025-11-25",
      time: "14:00",
      topic: "Product Strategy & Roadmap",
      zoomLink: "https://zoom.us/j/123456789",
      status: "confirmed"
    },
    {
      id: 2,
      mentor: {
        name: "Carlos Santos",
        role: "Tech Lead",
        company: "Meta",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"
      },
      date: "2025-11-28",
      time: "18:00",
      topic: "System Design Interview Prep",
      zoomLink: "https://zoom.us/j/987654321",
      status: "confirmed"
    }
  ];

  const oldPastSessions = [
    {
      id: 3,
      mentor: {
        name: "Marina Costa",
        role: "Design Director",
        company: "Nubank",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marina"
      },
      date: "2025-11-15",
      time: "10:00",
      topic: "Design Systems & Component Libraries",
      transcriptAvailable: true,
      recordingAvailable: true,
      status: "completed",
      rating: 5
    },
    {
      id: 4,
      mentor: {
        name: "Pedro Oliveira",
        role: "Engineering Manager",
        company: "Amazon",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro"
      },
      date: "2025-11-10",
      time: "16:00",
      topic: "Leadership & Team Management",
      transcriptAvailable: true,
      recordingAvailable: true,
      status: "completed",
      rating: 4
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar sessões';
    const isAuthError = errorMessage.includes('não autenticado') || errorMessage.includes('Token não encontrado');
    
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="text-center py-16">
              <p className="text-lg text-destructive mb-4">
                {isAuthError ? 'Sessão expirada ou token não encontrado' : 'Erro ao carregar sessões'}
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Minhas Sessões</h1>
                <p className="text-lg text-muted-foreground">
                  Gerencie suas mentorias agendadas e revise sessões anteriores
                </p>
              </div>
              <Button 
                onClick={() => navigate('/mentors')}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agendar Sessão
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                <Card className="p-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma sessão agendada</h3>
                  <p className="text-muted-foreground mb-6">
                    Que tal agendar uma mentoria com um especialista?
                  </p>
                  <Button onClick={() => navigate('/mentors')}>
                    Encontrar Mentores
                  </Button>
                </Card>
              ) : (
                upcomingSessions.map((session) => (
                  <Card key={session.id} className="p-6 hover:shadow-lg transition-all">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      {/* Left Section - Mentor Info */}
                      <div className="flex items-start space-x-4 flex-1">
                        <img
                          src={session.mentorAvatar}
                          alt={session.mentorName}
                          className="w-16 h-16 rounded-full bg-gradient-hero"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">{session.mentorName}</h3>
                          <p className="font-medium text-foreground">{session.topic}</p>
                        </div>
                      </div>

                      {/* Middle Section - Date/Time */}
                      <div className="flex flex-col space-y-2 min-w-[200px]">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(session.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{session.time} BRT</span>
                        </div>
                        <Badge className="w-fit bg-accent/10 text-accent hover:bg-accent/20">
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
                <Card className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma sessão anterior</h3>
                  <p className="text-muted-foreground">
                    Suas sessões completadas aparecerão aqui
                  </p>
                </Card>
              ) : (
                pastSessions.map((session) => (
                  <Card key={session.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      {/* Left Section - Mentor Info */}
                      <div className="flex items-start space-x-4 flex-1">
                        <img
                          src={session.mentorAvatar}
                          alt={session.mentorName}
                          className="w-16 h-16 rounded-full bg-gradient-hero"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">{session.mentorName}</h3>
                          <p className="font-medium text-foreground mb-2">{session.topic}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(session.date)} às {session.time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Resources & Actions */}
                      <div className="flex flex-col space-y-2 min-w-[200px]">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/sessao/${session.id}`)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                        <Button variant="outline" size="sm">
                          Avaliar Sessão
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
                <Card className="p-12 text-center">
                  <XCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma sessão cancelada</h3>
                  <p className="text-muted-foreground">
                    Suas sessões canceladas aparecerão aqui
                  </p>
                </Card>
              ) : (
                cancelledSessions.map((session) => {
                  const sessionDateTime = getSessionDateTime(session);
                  const isPast = sessionDateTime ? sessionDateTime <= now : false;
                  
                  return (
                    <Card key={session.id} className="p-6 border-destructive/20">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        {/* Left Section - Mentor Info */}
                        <div className="flex items-start space-x-4 flex-1">
                          <img
                            src={session.mentorAvatar}
                            alt={session.mentorName}
                            className="w-16 h-16 rounded-full bg-gradient-hero opacity-60"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1">{session.mentorName}</h3>
                            <p className="font-medium text-foreground mb-2">{session.topic}</p>
                            {sessionDateTime && (
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(session.date)} às {session.time}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Middle Section - Status */}
                        <div className="flex flex-col space-y-2 min-w-[150px]">
                          <Badge variant="destructive" className="w-fit">
                            Cancelada
                          </Badge>
                          {sessionDateTime && (
                            <span className="text-sm text-muted-foreground">
                              {isPast ? 'Data já passou' : 'Data futura'}
                            </span>
                          )}
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex flex-col space-y-2 min-w-[200px]">
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
        </div>
      </div>
    </div>
  );
};

export default MySessions;
export { MySessions };
