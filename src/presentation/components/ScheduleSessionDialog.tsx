import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Loader2, UserIcon } from 'lucide-react';
import { useMentors } from '../hooks/useMentors';
import { useMentorById } from '../hooks/useMentorById';
import { useMentorAvailability } from '../hooks/useMentorAvailability';
import { useCreateSessionForUser } from '../hooks/useCreateSessionForUser';
import { useCreateSessionForUserAdmin } from '../hooks/useCreateSessionForUserAdmin';
import { Availability } from '@domain/entities/Availability.entity';
import { convertLocalToUtc } from '@shared/utils/timezone';
import { toast } from 'sonner';

interface ScheduleSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess?: () => void;
  associatedMentorIds?: string[]; // IDs dos mentores associados ao usuário
  isAdmin?: boolean; // Se true, usa endpoint de admin
}

const ScheduleSessionDialog: React.FC<ScheduleSessionDialogProps> = ({
  open,
  onOpenChange,
  userId,
  onSuccess,
  associatedMentorIds = [],
  isAdmin = false,
}) => {
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');

  const { data: allMentors = [] } = useMentors();
  
  // Filtra apenas os mentores associados ao usuário
  const mentors = useMemo(() => {
    if (associatedMentorIds.length === 0) return [];
    return allMentors.filter(m => associatedMentorIds.includes(m.id));
  }, [allMentors, associatedMentorIds]);
  const { data: mentor, isLoading: mentorLoading } = useMentorById(selectedMentorId);
  const { data: availability, isLoading: availabilityLoading } = useMentorAvailability(selectedMentorId);
  const createSession = useCreateSessionForUser(userId);
  const createSessionAdmin = useCreateSessionForUserAdmin(userId);

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

  const handleSchedule = async () => {
    if (!selectedMentorId) {
      toast.error('Por favor, selecione um mentor');
      return;
    }

    if (!date || !selectedTime || !topic.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!mentor) {
      toast.error('Mentor não encontrado');
      return;
    }

    try {
      // Converte data/hora local + timezone para UTC
      const dateStr = date.toISOString().split('T')[0];
      const scheduledAtUtc = convertLocalToUtc(dateStr, selectedTime, timezone);

      // Prepara as notes no formato esperado
      let notesFormatted = `Tópico: ${topic.trim()}`;
      if (notes.trim()) {
        notesFormatted += `\n${notes.trim()}`;
      }

      if (isAdmin) {
        // Usa endpoint de admin
        await createSessionAdmin.mutateAsync({
          mentorId: selectedMentorId,
          planId: null,
          scheduledAt: scheduledAtUtc, // Já em UTC
          duration: 60,
          notes: notesFormatted,
          timezone, // Passa timezone para o DTO
        });
      } else {
        // Usa endpoint normal
        await createSession.mutateAsync({
          mentorId: selectedMentorId,
          date: dateStr, // Data local YYYY-MM-DD
          time: selectedTime, // Horário local HH:MM
          topic: topic.trim(),
          notes: notes.trim() || undefined,
          timezone, // Passa timezone para o DTO
        });
      }

      toast.success('Sessão agendada com sucesso!');
      
      // Limpa o formulário
      setSelectedMentorId('');
      setDate(new Date());
      setSelectedTime('');
      setTopic('');
      setNotes('');
      
      // Fecha o dialog
      onOpenChange(false);
      
      // Chama callback de sucesso
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao agendar sessão';
      toast.error(message);
    }
  };

  const handleMentorChange = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    setDate(new Date());
    setSelectedTime('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Sessão de Mentoria</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para agendar uma nova sessão
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Mentor */}
          <Card className="p-4">
            <Label htmlFor="mentor" className="mb-2 block">
              Mentor *
            </Label>
            {mentors.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Nenhum mentor associado a este usuário
                </p>
                <p className="text-xs text-muted-foreground">
                  Associe um mentor ao usuário antes de agendar uma sessão
                </p>
              </div>
            ) : (
              <select
                id="mentor"
                value={selectedMentorId}
                onChange={(e) => handleMentorChange(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Selecione um mentor</option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.specialty && `- ${m.specialty}`}
                  </option>
                ))}
              </select>
            )}
          </Card>

          {selectedMentorId && (
            <>
              {/* Seleção de Data */}
              <Card className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Escolha a Data</h3>
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
                  <h3 className="text-lg font-semibold">Escolha o Horário</h3>
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

              {/* Detalhes da Sessão */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Detalhes da Sessão</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Tópico da Sessão *</Label>
                    <Input
                      id="topic"
                      placeholder="Ex: Transição de carreira, Negociação salarial..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Compartilhe detalhes ou perguntas específicas..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-2 min-h-24"
                    />
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAdmin ? createSessionAdmin.isPending : createSession.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSchedule}
              disabled={createSession.isPending || !selectedMentorId || !date || !selectedTime || !topic.trim()}
            >
              {createSession.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Agendando...
                </>
              ) : (
                'Agendar Sessão'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleSessionDialog;
