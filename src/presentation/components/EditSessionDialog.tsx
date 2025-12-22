import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { useMentorById } from '../hooks/useMentorById';
import { useMentorAvailability } from '../hooks/useMentorAvailability';
import { useRescheduleSession } from '../hooks/useUpdateSession';
import { convertLocalToUtc, calculateEndAtUtc } from '@shared/utils/timezone';
import { Availability } from '@domain/entities/Availability.entity';
import { Session } from '@domain/entities/Session.entity';
import { toast } from 'sonner';

interface EditSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
  onSuccess?: () => void;
}

const EditSessionDialog: React.FC<EditSessionDialogProps> = ({
  open,
  onOpenChange,
  session,
  onSuccess,
}) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');

  const { data: mentor, isLoading: mentorLoading } = useMentorById(session?.mentorId || '');
  const { data: availability, isLoading: availabilityLoading } = useMentorAvailability(session?.mentorId || '');
  const rescheduleSession = useRescheduleSession(session?.id || '');
  
  // Timezone fixo
  const timezone = 'America/Sao_Paulo';

  // Inicializa valores quando a sessão é carregada
  useEffect(() => {
    if (session && open) {
      try {
        // Constrói a data completa combinando date e time
        let sessionDate: Date;
        
        if (session.date.includes('T')) {
          // Se já tem datetime completo
          sessionDate = new Date(session.date);
        } else {
          // Combina date (YYYY-MM-DD) com time (HH:MM)
          const dateTimeString = `${session.date}T${session.time || '00:00'}:00`;
          sessionDate = new Date(dateTimeString);
        }
        
        // Verifica se a data é válida
        if (isNaN(sessionDate.getTime())) {
          console.warn('Data inválida da sessão, usando data atual');
          sessionDate = new Date();
        }
        
        setDate(sessionDate);
        
        // Extrai horário da sessão
        if (session.time) {
          setSelectedTime(session.time);
        } else if (sessionDate) {
          // Se não tiver time, extrai do date
          const hours = String(sessionDate.getHours()).padStart(2, '0');
          const minutes = String(sessionDate.getMinutes()).padStart(2, '0');
          setSelectedTime(`${hours}:${minutes}`);
        }
      } catch (error) {
        console.error('Erro ao inicializar data da sessão:', error);
        setDate(new Date());
      }
    }
  }, [session, open]);

  // Converte dayOfWeek da API (1=segunda) para JavaScript (0=domingo, 1=segunda)
  const convertDayOfWeek = (apiDay: number): number => {
    return apiDay === 7 ? 0 : apiDay;
  };

  // Gera slots de horários entre startTime e endTime (intervalos de 1 hora)
  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    
    while (currentHour < endHour) {
      const timeString = `${String(currentHour).padStart(2, '0')}:00`;
      slots.push(timeString);
      currentHour += 1;
      
      if (currentHour >= 24) {
        break;
      }
    }
    
    return slots;
  };

  // Obtém disponibilidade para o dia selecionado
  const getAvailabilityForDate = (selectedDate: Date | undefined): Availability | null => {
    if (!selectedDate || !availability) return null;
    
    const dayOfWeek = selectedDate.getDay();
    
    return availability.find(av => convertDayOfWeek(av.dayOfWeek) === dayOfWeek) || null;
  };

  // Gera horários disponíveis para o dia selecionado
  const availableTimes = useMemo(() => {
    if (!date || !availability) return [];
    
    const dayAvailability = getAvailabilityForDate(date);
    if (!dayAvailability) return [];
    
    return generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime);
  }, [date, availability]);

  // Dias da semana disponíveis (para desabilitar no calendário)
  const availableDaysOfWeek = useMemo(() => {
    if (!availability) return [];
    return availability.map(av => convertDayOfWeek(av.dayOfWeek));
  }, [availability]);

  // Função para desabilitar datas no calendário
  const isDateDisabled = (dateToCheck: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateToCheck < today) return true;
    if (dateToCheck.getDay() === 0) return true;
    
    const dayOfWeek = dateToCheck.getDay();
    return !availableDaysOfWeek.includes(dayOfWeek);
  };

  const handleReschedule = async () => {
    if (!date || !selectedTime) {
      toast.error('Por favor, selecione uma data e horário');
      return;
    }

    if (!session) {
      toast.error('Sessão não encontrada');
      return;
    }

    try {
      // Converte data/hora local + timezone para UTC
      const dateStr = date.toISOString().split('T')[0];
      const newStartAtUtc = convertLocalToUtc(dateStr, selectedTime, timezone);
      
      // Calcula endAtUtc (durações padrão de 60 minutos)
      const duration = 60;
      const newEndAtUtc = calculateEndAtUtc(newStartAtUtc, duration);

      // Chama endpoint de reschedule
      await rescheduleSession.mutateAsync({
        newStartAtUtc,
        newEndAtUtc,
        timezone,
        reason: 'Remarcação solicitada pelo usuário',
      });

      toast.success('Sessão remarcada com sucesso!');
      
      // Fecha o dialog
      onOpenChange(false);
      
      // Chama callback de sucesso
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remarcar sessão';
      toast.error(message);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Remarcar Sessão</DialogTitle>
          <DialogDescription>
            Escolha uma nova data e horário para sua sessão de mentoria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Data */}
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Escolha a Nova Data</h3>
            </div>
            <div className="flex justify-center">
              {mentorLoading || availabilityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setSelectedTime('');
                  }}
                  disabled={isDateDisabled}
                  className="rounded-md border"
                />
              )}
            </div>
            {availability && availability.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p className="font-medium mb-2">Dias disponíveis:</p>
                <div className="flex flex-wrap gap-2">
                  {availability.map((av) => {
                    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                    const dayName = dayNames[convertDayOfWeek(av.dayOfWeek)];
                    return (
                      <Badge key={av.id} variant="secondary" className="text-xs">
                        {dayName} {av.startTime.substring(0, 5)}-{av.endTime.substring(0, 5)}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Seleção de Horário */}
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Escolha o Novo Horário</h3>
            </div>
            {!date ? (
              <p className="text-sm text-muted-foreground">
                Selecione uma data primeiro para ver os horários disponíveis
              </p>
            ) : availableTimes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Não há horários disponíveis para este dia. Por favor, selecione outro dia.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableTimes.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={selectedTime === time ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}
          </Card>

          {/* Informações Atuais */}
          <Card className="p-4 bg-muted/50">
            <h3 className="text-sm font-semibold mb-2">Agendamento Atual</h3>
            <div className="text-sm text-muted-foreground">
              <p>Data: {session.date && new Date(session.date + 'T' + session.time).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</p>
              <p>Horário: {session.time} BRT</p>
            </div>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={rescheduleSession.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleReschedule}
              disabled={rescheduleSession.isPending || !date || !selectedTime}
            >
              {rescheduleSession.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Remarcando...
                </>
              ) : (
                'Remarcar Sessão'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditSessionDialog;
