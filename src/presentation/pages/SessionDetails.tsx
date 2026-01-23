import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, User, MessageSquare, Video, Loader2, Edit, ExternalLink, History, CheckCircle2, XCircle, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useSessionById } from '../hooks/useSessionById';
import { useSessionSummary } from '../hooks/useSessionSummary';
import EditSessionDialog from '../components/EditSessionDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useConfirmSession } from '../hooks/useConfirmSession';
import { useCancelSession } from '../hooks/useCancelSession';
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
import { toast } from 'sonner';

const SessionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session, isLoading, error } = useSessionById(id);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const confirmSession = useConfirmSession(id || '');
  const cancelSession = useCancelSession(id || '');

  // Extrai o meeting_uuid do providerMeetingUuid do activeSlot
  const meetingUuid = session?.activeSlot?.providerMeetingUuid || null;
  
  // Calcula se a sessão já terminou (data de agendamento + duração + 5 minutos)
  const shouldFetchSummary = (() => {
    if (!session?.activeSlot?.startAtUtc || !session.duration) {
      return false;
    }
    
    const startAt = new Date(session.activeSlot.startAtUtc);
    const durationMinutes = session.duration || 60; // Default 60 minutos se não tiver
    const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000); // Adiciona duração em milissegundos
    const endAtPlus5Min = new Date(endAt.getTime() + 5 * 60 * 1000); // Adiciona 5 minutos
    
    return endAtPlus5Min < new Date(); // Retorna true se já passou
  })();
  
  const { data: summary, isLoading: isLoadingSummary, error: summaryError } = useSessionSummary(meetingUuid, shouldFetchSummary);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center py-16">
              <p className="text-lg text-destructive mb-4">
                {error instanceof Error ? error.message : 'Sessão não encontrada'}
              </p>
              <Button onClick={() => navigate('/minhas-sessoes')}>
                Voltar para Minhas Sessões
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDateFull = (dateString: string) => {
    try {
      const date = dateString.includes('T') 
        ? new Date(dateString) 
        : new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="default">Agendada</Badge>;
      case 'completed':
        return <Badge variant="secondary">Concluída</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSlotStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmado';
      case 'HELD':
        return 'Reservado';
      case 'RESCHEDULED':
        return 'Remarcado';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Verifica se pode confirmar: sessão agendada, tem activeSlot e não tem zoomLink ainda
  const canConfirm = session && 
    session.status === 'scheduled' &&
    session.activeSlot &&
    !session.zoomLink;

  // Verifica se pode cancelar: sessão agendada
  const canCancel = session && 
    session.status === 'scheduled';

  // Verifica se pode remarcar: sessão agendada
  const canReschedule = session && session.status === 'scheduled';

  const handleConfirm = async () => {
    if (!session) return;

    try {
      await confirmSession.mutateAsync(undefined); // Backend cria Zoom automaticamente
      toast.success('Sessão confirmada com sucesso! Link da reunião gerado.');
      queryClient.invalidateQueries({ queryKey: ['session', id] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao confirmar sessão';
      toast.error(message);
    }
  };

  const handleCancel = async () => {
    if (!session) return;

    try {
      await cancelSession.mutateAsync();
      toast.success('Sessão cancelada com sucesso.');
      setIsCancelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['session', id] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cancelar sessão';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/minhas-sessoes')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Minhas Sessões
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Detalhes da Sessão</h1>
                <p className="text-lg text-muted-foreground">
                  Informações completas sobre sua sessão de mentoria
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canConfirm && (
                  <Button
                    onClick={handleConfirm}
                    disabled={confirmSession.isPending}
                    className="flex items-center gap-2"
                  >
                    {confirmSession.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Confirmar Sessão
                      </>
                    )}
                  </Button>
                )}
                {canReschedule && (
                  <Button
                    onClick={() => setIsEditDialogOpen(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Remarcar Sessão
                  </Button>
                )}
                {canCancel && (
                  <Button
                    onClick={() => setIsCancelDialogOpen(true)}
                    variant="destructive"
                    disabled={cancelSession.isPending}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancelar Sessão
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Card Principal - Informações da Sessão */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  {session.mentorAvatar ? (
                    <img
                      src={session.mentorAvatar}
                      alt={session.mentorName}
                      className="w-20 h-20 rounded-full bg-gradient-hero object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-hero flex items-center justify-center">
                      <span className="text-white font-semibold text-2xl">
                        {session.mentorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{session.mentorName}</h2>
                    <p className="text-muted-foreground">{session.topic}</p>
                  </div>
                </div>
                {getStatusBadge(session.status)}
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
                {/* Data e Horário */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Data</p>
                      <p className="font-medium">{formatDateFull(session.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Horário</p>
                      <p className="font-medium">{session.time} BRT</p>
                    </div>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Mentor</p>
                      <p className="font-medium">{session.mentorName}</p>
                    </div>
                  </div>

                  {session.price && (
                    <div className="flex items-start gap-3">
                      <Video className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Valor</p>
                        <p className="font-medium">R$ {session.price.toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  {session.zoomLink && (
                    <div className="flex items-start gap-3">
                      <Video className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Link da Reunião</p>
                        <a
                          href={session.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          Entrar na reunião
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Card de Observações */}
            {session.notes && (
              <Card className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                  <h3 className="text-xl font-semibold">Observações</h3>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">{session.notes}</p>
              </Card>
            )}

            {/* Card de Histórico de Slots (Remarcações) */}
            {session.slots && session.slots.length > 1 && (
              <Card className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <History className="w-5 h-5 text-primary mt-0.5" />
                  <h3 className="text-xl font-semibold">Histórico de Remarcações</h3>
                </div>
                <div className="space-y-3">
                  {session.slots
                    .filter(slot => slot.status !== 'CANCELED')
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((slot) => {
                      const slotDate = new Date(slot.startAtUtc);
                      const isActive = slot.id === session.activeSlot?.id;
                      
                      return (
                        <div
                          key={slot.id}
                          className={`p-4 rounded-lg border ${
                            isActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={isActive ? 'default' : 'secondary'}>
                                  {isActive ? 'Atual' : getSlotStatusLabel(slot.status)}
                                </Badge>
                                {slot.rescheduleFromSlotId && (
                                  <span className="text-xs text-muted-foreground">
                                    Remarcado de slot anterior
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium mb-1">
                                {slotDate.toLocaleDateString('pt-BR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {slotDate.toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })} ({slot.timezone})
                              </p>
                              {slot.createdBy === 'CONCIERGE' && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Criado pelo admin
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>
            )}

            {/* Card de Informações Adicionais */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Informações Adicionais</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">ID da Sessão</p>
                  <p className="font-mono text-xs">{session.id}</p>
                </div>
                {session.createdAt && (
                  <div>
                    <p className="text-muted-foreground mb-1">Data de Criação</p>
                    <p className="font-medium">
                      {new Date(session.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
                {session.activeSlot && (
                  <>
                    <div>
                      <p className="text-muted-foreground mb-1">Timezone</p>
                      <p className="font-medium">{session.activeSlot.timezone}</p>
                    </div>
                    {session.activeSlot.providerMeetingId && (
                      <div>
                        <p className="text-muted-foreground mb-1">ID da Reunião</p>
                        <p className="font-mono text-xs">{session.activeSlot.providerMeetingId}</p>
                      </div>
                    )}
                    {session.activeSlot.providerMeetingUuid && (
                      <div>
                        <p className="text-muted-foreground mb-1">UUID da Reunião</p>
                        <p className="font-mono text-xs break-all">{session.activeSlot.providerMeetingUuid}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* Card de Resumo da Reunião */}
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <FileText className="w-5 h-5 text-primary mt-0.5" />
                <h3 className="text-xl font-semibold">Resumo da Reunião</h3>
              </div>
              
              {!meetingUuid ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Resumo da reunião não disponível. O resumo será exibido após a conclusão da sessão.
                  </p>
                </div>
              ) : !shouldFetchSummary ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    O resumo da reunião estará disponível após o término da sessão (data de agendamento + duração + 5 minutos).
                  </p>
                </div>
              ) : isLoadingSummary ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : summaryError ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {summaryError instanceof Error 
                      ? summaryError.message 
                      : 'Não foi possível carregar o resumo da reunião'}
                  </p>
                </div>
              ) : summary ? (
                  <div className="space-y-6">
                    {/* Informações da Reunião */}
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Tópico</p>
                        <p className="font-medium">{summary.meeting_topic}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Host</p>
                        <p className="font-medium">{summary.meeting_host_email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Início</p>
                        <p className="font-medium">
                          {new Date(summary.meeting_start_time).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Fim</p>
                        <p className="font-medium">
                          {new Date(summary.meeting_end_time).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Visão Geral */}
                    {summary.summary_overview && (
                      <div>
                        <h4 className="font-semibold mb-2">Visão Geral</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">{summary.summary_overview}</p>
                      </div>
                    )}

                    {/* Detalhes do Resumo */}
                    {summary.summary_details && summary.summary_details.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Detalhes</h4>
                        <div className="space-y-4">
                          {summary.summary_details.map((detail, index) => (
                            <div key={index} className="border-l-4 border-primary pl-4">
                              <h5 className="font-medium mb-1">{detail.label}</h5>
                              <p className="text-muted-foreground text-sm whitespace-pre-wrap">{detail.summary}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Próximas Etapas */}
                    {summary.next_steps && summary.next_steps.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Próximas Etapas</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {summary.next_steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Conteúdo Completo do Resumo */}
                    {summary.summary_content && (
                      <div>
                        <h4 className="font-semibold mb-3">Resumo Completo</h4>
                        <div className="text-muted-foreground whitespace-pre-wrap">
                          {summary.summary_content}
                        </div>
                      </div>
                    )}

                    {/* Link do Documento */}
                    {summary.summary_doc_url && (
                      <div className="pt-4 border-t">
                        <a
                          href={summary.summary_doc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Ver documento completo no Zoom
                        </a>
                      </div>
                    )}
                  </div>
                ) : null}
              </Card>
          </div>
        </div>
      </div>

      {/* Dialog de Edição */}
      {session && (
        <EditSessionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          session={session}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['session', id] });
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
          }}
        />
      )}

      {/* Dialog de Confirmação de Cancelamento */}
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
    </div>
  );
};

export default SessionDetails;
