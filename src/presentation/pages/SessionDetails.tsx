import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, User, MessageSquare, Video, Loader2, Edit } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useSessionById } from '../hooks/useSessionById';
import EditSessionDialog from '../components/EditSessionDialog';
import { useQueryClient } from '@tanstack/react-query';

const SessionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session, isLoading, error } = useSessionById(id);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
            <h1 className="text-4xl font-bold mb-2">Detalhes da Sessão</h1>
            <p className="text-lg text-muted-foreground">
              Informações completas sobre sua sessão de mentoria
            </p>
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
              </div>
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
    </div>
  );
};

export default SessionDetails;
