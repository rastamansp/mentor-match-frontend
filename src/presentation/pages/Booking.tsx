import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, DollarSign, Video } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useMentorById } from "../hooks/useMentorById";
import { useCreateSession } from "../hooks/useCreateSession";
import { useMentorAvailability } from "../hooks/useMentorAvailability";
import { Availability } from "@domain/entities/Availability.entity";
import { convertLocalToUtc } from "@shared/utils/timezone";

const Booking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mentorId = id || '';
  const { data: mentor, isLoading: mentorLoading } = useMentorById(mentorId);
  const { data: availability, isLoading: availabilityLoading } = useMentorAvailability(mentorId);
  const createSession = useCreateSession();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");

  // Fallback mentor data
  const fallbackMentor = {
    name: "Ana Silva",
    role: "Senior Product Manager",
    company: "Google",
    price: 200,
    pricePerHour: 200,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
  };

  const displayMentor = mentor || fallbackMentor;

  // Converte dayOfWeek da API (1=segunda) para JavaScript (0=domingo, 1=segunda)
  const convertDayOfWeek = (apiDay: number): number => {
    // API: 1=segunda, 2=terça, ..., 6=sábado, 7=domingo
    // JS: 0=domingo, 1=segunda, ..., 6=sábado
    return apiDay === 7 ? 0 : apiDay;
  };

  // Gera slots de horários entre startTime e endTime (intervalos de 1 hora)
  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    
    // Gera slots de hora em hora até o horário final (sem incluir o endTime)
    while (currentHour < endHour) {
      const timeString = `${String(currentHour).padStart(2, '0')}:00`;
      slots.push(timeString);
      currentHour += 1;
      
      if (currentHour >= 24) {
        break; // Não permite passar da meia-noite
      }
    }
    
    return slots;
  };

  // Obtém disponibilidade para o dia selecionado
  const getAvailabilityForDate = (selectedDate: Date | undefined): Availability | null => {
    if (!selectedDate || !availability) return null;
    
    const dayOfWeek = selectedDate.getDay(); // 0=domingo, 1=segunda, etc.
    
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
    
    // Desabilita datas passadas
    if (dateToCheck < today) return true;
    
    // Desabilita domingos (dia 0)
    if (dateToCheck.getDay() === 0) return true;
    
    // Desabilita dias que não estão na disponibilidade
    const dayOfWeek = dateToCheck.getDay();
    return !availableDaysOfWeek.includes(dayOfWeek);
  };

  const handleBooking = async () => {
    if (!date || !selectedTime || !topic.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (!mentor) {
      toast.error("Mentor não encontrado");
      return;
    }

    try {
      // Converte data para string YYYY-MM-DD
      const dateStr = date.toISOString().split('T')[0];
      
      // Timezone padrão America/Sao_Paulo
      const timezone = 'America/Sao_Paulo';
      
      // Converte horário local para UTC usando a função correta
      // A função convertLocalToUtc já faz a conversão considerando o timezone
      const scheduledAtUtc = convertLocalToUtc(dateStr, selectedTime, timezone);

      // Envia scheduledAt em UTC diretamente, sem tratamento no frontend
      // O backend receberá o horário em UTC e o timezone para fazer o tratamento necessário
      await createSession.mutateAsync({
        mentorId: mentor.id,
        scheduledAt: scheduledAtUtc, // Horário em UTC (ISO datetime)
        timezone, // Timezone para o backend processar
        topic: topic.trim(),
        notes: notes.trim() || undefined,
      });

      toast.success("Sessão agendada com sucesso!");
      setTimeout(() => {
        navigate('/minhas-sessoes');
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao agendar sessão';
      toast.error(message);
    }
  };

  if (mentorLoading || availabilityLoading) {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate(`/mentor/${id}`)}
          >
            ← Voltar ao perfil
          </Button>

          <h1 className="text-4xl font-bold mb-8">Agendar Sessão de Mentoria</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date Selection */}
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Escolha a Data</h3>
                </div>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate);
                      setSelectedTime(""); // Limpa horário ao mudar data
                    }}
                    disabled={isDateDisabled}
                    className="rounded-md border"
                  />
                </div>
                {availability && availability.length > 0 && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Dias disponíveis:</p>
                    <div className="flex flex-wrap gap-2">
                      {availability.map((av) => {
                        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                        const dayName = dayNames[convertDayOfWeek(av.dayOfWeek)];
                        return (
                          <span key={av.id} className="px-2 py-1 bg-primary/10 rounded text-xs">
                            {dayName} {av.startTime.substring(0, 5)}-{av.endTime.substring(0, 5)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>

              {/* Time Selection */}
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Escolha o Horário</h3>
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
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className={selectedTime === time ? "bg-primary" : ""}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  * Horários em fuso horário de Brasília (BRT)
                </p>
              </Card>

              {/* Session Details */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Detalhes da Sessão</h3>
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
                      placeholder="Compartilhe detalhes ou perguntas específicas que gostaria de abordar..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-2 min-h-32"
                    />
                  </div>
                </div>
              </Card>

              {/* Session Info */}
              <Card className="p-6 bg-secondary/30">
                <div className="flex items-start space-x-3">
                  <Video className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Como funciona?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Sessões de 1 hora via Zoom</li>
                      <li>• Link da reunião enviado por email após confirmação</li>
                      <li>• Gravação e transcrição disponíveis após a sessão</li>
                      <li>• Cancelamento gratuito até 24h antes</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            {/* Summary Card */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-6">Resumo do Agendamento</h3>
                
                {/* Mentor Info */}
                <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-border">
                    {displayMentor.avatar ? (
                      <img
                        src={displayMentor.avatar}
                        alt={displayMentor.name}
                        className="w-12 h-12 rounded-full bg-gradient-hero"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {displayMentor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  <div>
                    <h4 className="font-semibold">{displayMentor.name}</h4>
                    <p className="text-sm text-muted-foreground">{displayMentor.role}</p>
                    <p className="text-xs text-primary">{displayMentor.company}</p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Data</p>
                    <p className="font-medium">
                      {date ? date.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : "Selecione uma data"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Horário</p>
                    <p className="font-medium">{selectedTime || "Selecione um horário"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duração</p>
                    <p className="font-medium">1 hora</p>
                  </div>
                  {topic && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tópico</p>
                      <p className="font-medium text-sm">{topic}</p>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="border-t border-border pt-6 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Valor da sessão:</span>
                    <span className="font-medium">R$ {displayMentor.pricePerHour || displayMentor.price}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Taxa da plataforma:</span>
                    <span className="font-medium">R$ 20</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>Total:</span>
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-accent" />
                      <span>R$ {(displayMentor.pricePerHour || displayMentor.price) + 20}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-hero border-0 hover:opacity-90 text-lg py-6"
                  onClick={handleBooking}
                  disabled={createSession.isPending}
                >
                  {createSession.isPending ? 'Agendando...' : 'Confirmar e Pagar'}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Ao confirmar, você concorda com nossos termos de uso
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
