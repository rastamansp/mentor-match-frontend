import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { ChatBubble } from "./ChatBubble";
import { WhatsAppHeader } from "./WhatsAppHeader";
import { MentorsList } from "./MentorsList";
import chatData from "@shared/data/chatData.json";
import { useChat } from "@/presentation/hooks/useChat";
import { toast } from "sonner";
import { ChatMentor } from "@application/use-cases/chat/SendChatMessage.usecase";
import { getChatContextFromRoute } from "@/shared/utils/chatContext";

interface JourneyMessage {
  id: number;
  sender: "mentor" | "mentee";
  type: "text" | "image" | "audio" | "mentors";
  content: string;
  timestamp: string;
  caption?: string;
  duration?: string;
  mentors?: ChatMentor[];
}

interface ChatInterfaceProps {
  journeyMessages?: JourneyMessage[];
  journeyName?: string; // Nome da jornada para rastreamento
  journeySelectionKey?: string; // Chave única que muda a cada seleção de jornada
  headerName?: string;
  headerAvatar?: string;
  onJourneyMessagesAdded?: () => void;
}

export const ChatInterface = ({ 
  journeyMessages, 
  journeyName,
  journeySelectionKey,
  headerName, 
  headerAvatar,
  onJourneyMessagesAdded
}: ChatInterfaceProps = {}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<JourneyMessage[]>([]);
  const { conversation } = chatData;
  const [visibleMessagesCount, setVisibleMessagesCount] = useState(0);
  const messagesKeyRef = useRef<string>("");
  const [inputMessage, setInputMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<JourneyMessage[]>([]);
  const messageIdCounter = useRef(1);
  const lastJourneyKeyRef = useRef<string>(""); // Rastreia a última jornada adicionada para evitar duplicação imediata
  const [sessionId, setSessionId] = useState<string | null>(null); // Armazena sessionId para manter histórico
  const lastMessagesCountRef = useRef(0); // Rastreia o número de mensagens para detectar quando jornada é adicionada
  const isJourneyBeingAddedRef = useRef(false); // Flag para indicar que uma jornada está sendo adicionada
  const { sendMessageAsync, isLoading } = useChat();

  const mentorName = headerName || conversation.participants.mentor.name;
  const mentorAvatar = headerAvatar || conversation.participants.mentor.avatar;

  // Quando há journeyMessages, adiciona ao histórico existente ao invés de substituir
  // Usa journeySelectionKey para detectar quando uma jornada é realmente selecionada
  useEffect(() => {
    if (journeyMessages && journeyMessages.length > 0 && journeySelectionKey) {
      // Verifica se esta é uma nova seleção (chave diferente da última processada)
      if (lastJourneyKeyRef.current !== journeySelectionKey) {
        lastJourneyKeyRef.current = journeySelectionKey;
        
        // Marca que uma jornada está sendo adicionada
        isJourneyBeingAddedRef.current = true;
        
        // Salva o número de mensagens anteriores antes de adicionar as novas
        const previousCount = chatMessages.length;
        
        // Atualiza o contador de referência ANTES de adicionar as mensagens
        // Isso permite detectar que foi uma jornada (muitas mensagens) vs mensagens individuais
        lastMessagesCountRef.current = previousCount;
        
        // Adiciona as mensagens da jornada ao histórico existente
        setChatMessages(prev => {
          // Ajusta os IDs para continuar a sequência
          const maxId = prev.length > 0 ? Math.max(...prev.map(m => m.id), messageIdCounter.current - 1) : 0;
          const adjustedMessages = journeyMessages.map((msg, idx) => ({
            ...msg,
            id: maxId + idx + 1
          }));
          
          // Atualiza o contador de mensagens
          messageIdCounter.current = maxId + journeyMessages.length + 1;
          
          return [...prev, ...adjustedMessages];
        });
        
        // Reseta o contador de mensagens visíveis para iniciar animação das novas mensagens
        // Se já havia mensagens anteriores, mantém elas visíveis e anima apenas as novas
        setVisibleMessagesCount(previousCount);
        
        // Marca que a jornada foi adicionada (após um pequeno delay para garantir que o estado foi atualizado)
        setTimeout(() => {
          isJourneyBeingAddedRef.current = false;
        }, 100);
        
        // Notifica que as mensagens foram adicionadas
        if (onJourneyMessagesAdded) {
          onJourneyMessagesAdded();
        }
      }
    }
  }, [journeyMessages, journeySelectionKey, onJourneyMessagesAdded, chatMessages.length]);

  // Usa chatMessages como fonte principal (que agora contém jornadas + mensagens do usuário)
  // Se não houver chatMessages e houver journeyMessages, usa journeyMessages temporariamente (até serem adicionadas)
  // Caso contrário, usa conversation.messages padrão
  // Ordena as mensagens por ID para garantir ordem cronológica
  const allMessages = useMemo(() => {
    const messages = chatMessages.length > 0 
      ? chatMessages 
      : (journeyMessages || conversation.messages);
    // Ordena por ID para garantir ordem cronológica
    return [...messages].sort((a, b) => a.id - b.id);
  }, [chatMessages, journeyMessages, conversation.messages]);

  // Create a unique key for the current messages set
  const messagesKey = useMemo(() => {
    return allMessages.map(m => `${m.id}-${m.content.substring(0, 20)}`).join("|");
  }, [allMessages]);

  // Carrega sessionId do localStorage na inicialização
  // Mas limpa se for uma nova sessão (usuário pode ter feito logout/login)
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatSessionId');
    const storedUserId = localStorage.getItem('user');
    let currentUserId: string | null = null;
    
    if (storedUserId) {
      try {
        const user = JSON.parse(storedUserId);
        currentUserId = user.id;
      } catch (e) {
        // Ignora erro
      }
    }
    
    // Se o userId mudou, limpa o sessionId (nova sessão)
    const lastUserId = localStorage.getItem('lastChatUserId');
    if (lastUserId !== currentUserId) {
      localStorage.removeItem('chatSessionId');
      setSessionId(null);
      if (currentUserId) {
        localStorage.setItem('lastChatUserId', currentUserId);
      }
    } else if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  // Update messages ref when messages change
  useEffect(() => {
    messagesRef.current = allMessages as JourneyMessage[];
  }, [allMessages]);

  // Reset visible messages when messages change
  useEffect(() => {
    if (messagesKeyRef.current !== messagesKey) {
      messagesKeyRef.current = messagesKey;
      
      const currentMessagesCount = allMessages.length;
      const previousMessagesCount = lastMessagesCountRef.current;
      const messagesAdded = currentMessagesCount - previousMessagesCount;
      
      // Se for modo demo (journeyMessages), inicia animação apenas quando jornada é adicionada
      // Se for modo real (apenas chatMessages sem journeyMessages), mostra todas imediatamente
      if (journeyMessages && messagesAdded > 0) {
        // Verifica se uma jornada está sendo adicionada usando a flag
        if (isJourneyBeingAddedRef.current) {
          // Jornada está sendo adicionada - reseta o contador para animar
          // Calcula quantas mensagens já existiam antes da jornada
          const countBeforeJourney = currentMessagesCount - journeyMessages.length;
          // Se há mensagens anteriores, mantém elas visíveis e anima apenas as novas
          // Se não há mensagens anteriores, inicia do zero
          setVisibleMessagesCount(countBeforeJourney > 0 ? countBeforeJourney : 0);
        } else {
          // Mensagens individuais do usuário/chatbot - mostra imediatamente
          // Apenas incrementa o contador sem resetar
          setVisibleMessagesCount(prev => Math.min(prev + messagesAdded, currentMessagesCount));
        }
      } else if (!journeyMessages) {
        // Mostra todas as mensagens imediatamente quando não há journeyMessages
        setVisibleMessagesCount(allMessages.length);
      }
      
      // Atualiza o contador de referência
      lastMessagesCountRef.current = currentMessagesCount;
    }
  }, [messagesKey, journeyMessages, allMessages.length]);

  // Animate messages appearing one by one (quando há journeyMessages)
  useEffect(() => {
    if (!journeyMessages) return;
    
    const currentMessages = messagesRef.current;
    const currentVisibleCount = visibleMessagesCount;
    const totalToShow = currentMessages.length;
    
    // Se ainda há mensagens para mostrar
    if (currentVisibleCount < totalToShow) {
      const nextMessage = currentMessages[currentVisibleCount];
      // Mentor messages take longer to "type", user messages are faster
      const delay = nextMessage.sender === "mentor" ? 1500 : 800;
      const timer = setTimeout(() => {
        setVisibleMessagesCount(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [visibleMessagesCount, journeyMessages]);

  // Auto-scroll when new message appears
  useEffect(() => {
    if (chatContainerRef.current) {
      // Pequeno delay para garantir que o DOM foi atualizado
      setTimeout(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
      }, 50);
    }
  }, [visibleMessagesCount, chatMessages.length, allMessages.length]);

  // Função para processar resposta do chatbot
  const processChatResponse = useCallback((response: any) => {
    const rawData = response.formattedResponse?.data?.rawData;
    const messageType = response.formattedResponse?.message_type;
    
    // Verifica se rawData é um objeto (nova estrutura) ou array (estrutura antiga)
    let availableSlots: any[] = [];
    let mentor: ChatMentor | null = null;
    
    if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
      // Nova estrutura: { mentor: {...}, slots: [...] }
      if (rawData.mentor) {
        mentor = rawData.mentor as ChatMentor;
      }
      if (Array.isArray(rawData.slots)) {
        availableSlots = rawData.slots;
      }
    } else if (Array.isArray(rawData)) {
      // Estrutura antiga: array de itens
      // Filtra slots de disponibilidade (objetos que têm 'localTime' e 'localDate')
      availableSlots = rawData.filter((item: any) => 
        item.localTime && item.localDate && item.startAtUtc
      );
      
      // Filtra mentores (objetos que têm 'mentor' ou 'name')
      const mentors = rawData
        .filter((item: any) => {
          if (item.mentor && typeof item.mentor === 'object') {
            return true;
          }
          if (item.name && typeof item.name === 'string') {
            return true;
          }
          return false;
        })
        .map((item: any) => {
          if (item.mentor) {
            return item.mentor;
          }
          return item;
        }) as ChatMentor[];
      
      if (mentors.length > 0) {
        mentor = mentors[0];
      } else {
        // Tenta encontrar mentor no rawData (pode ser um UserMentor com propriedade mentor)
        const mentorItem = rawData.find((item: any) => item.mentor && typeof item.mentor === 'object');
        if (mentorItem) {
          mentor = mentorItem.mentor;
        }
      }
    }
    
    const isListMentors = response.toolsUsed?.some(
      (tool: { name: string }) => tool.name === 'list_mentors'
    );
    
    const hasAvailableSlots = availableSlots.length > 0;
    const hasMentor = mentor !== null;
    
    // Gera timestamps no formato HH:mm para consistência
    const now = new Date();
    const baseHours = now.getHours();
    const baseMinutes = now.getMinutes();
    
    // Se for appointment_list, formata de forma especial
    if (messageType === 'appointment_list' && hasAvailableSlots) {
      
      // Mensagem 1: Informações do mentor e introdução dos horários
      if (mentor) {
        let mentorInfo = `Você tem acesso ao mentor **${mentor.name}**`;
        if (mentor.role || mentor.company) {
          const rolePart = mentor.role || '';
          const companyPart = mentor.company || '';
          if (rolePart && companyPart) {
            mentorInfo += `, que é **${rolePart}** na **${companyPart}**`;
          } else if (rolePart) {
            mentorInfo += `, que é **${rolePart}**`;
          } else if (companyPart) {
            mentorInfo += ` da **${companyPart}**`;
          }
        }
        if (mentor.specialty) {
          mentorInfo += ` e especialista em **${mentor.specialty}**`;
        }
        mentorInfo += ". Aqui estão os horários disponíveis para agendar uma sessão:";
        
        const mentorDetailsMessage: JourneyMessage = {
          id: messageIdCounter.current++,
          sender: "mentor",
          type: "text",
          content: mentorInfo,
          timestamp: `${baseHours.toString().padStart(2, "0")}:${baseMinutes.toString().padStart(2, "0")}`,
        };
        setChatMessages(prev => [...prev, mentorDetailsMessage]);
      }
      
      // Mensagem de introdução dos horários (se não houver mentor)
      const introSlotsOffset = mentor ? 1 : 0;
      if (!mentor) {
        const introSlotsMinutes = (baseMinutes + introSlotsOffset + 1) % 60;
        const introSlotsHours = baseMinutes + introSlotsOffset + 1 >= 60 ? (baseHours + 1) % 24 : baseHours;
        const introSlotsMessage: JourneyMessage = {
          id: messageIdCounter.current++,
          sender: "mentor",
          type: "text",
          content: "### Horários Disponíveis:",
          timestamp: `${introSlotsHours.toString().padStart(2, "0")}:${introSlotsMinutes.toString().padStart(2, "0")}`,
        };
        setChatMessages(prev => [...prev, introSlotsMessage]);
      }
      
      // Agrupa slots por data
      interface SlotItem {
        localTime: string;
        localDate: string;
        dayName: string;
        duration?: number;
      }
      
      const slotsByDate: Record<string, SlotItem[]> = {};
      availableSlots.forEach((slot: any) => {
        const dateKey = `${slot.localDate} - ${slot.dayName}`;
        if (!slotsByDate[dateKey]) {
          slotsByDate[dateKey] = [];
        }
        slotsByDate[dateKey].push(slot);
      });
      
      // Função auxiliar para formatar data (DD/MM/YYYY -> DD de mês de YYYY)
      const formatDateFull = (dateStr: string): string => {
        try {
          const [day, month, year] = dateStr.split('/');
          const monthNames = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
          ];
          const monthIndex = parseInt(month) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            return `${day} de ${monthNames[monthIndex]} de ${year}`;
          }
          return dateStr;
        } catch {
          return dateStr;
        }
      };
      
      // Função auxiliar para calcular horário de término
      const calculateEndTime = (startTime: string, durationMinutes: number = 60): string => {
        try {
          const [hours, minutes] = startTime.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes + durationMinutes;
          const endHours = Math.floor(totalMinutes / 60) % 24;
          const endMins = totalMinutes % 60;
          return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
        } catch {
          return startTime;
        }
      };
      
      // Função auxiliar para formatar horário com início e término
      const formatTimeRange = (slot: SlotItem): string => {
        const startTime = slot.localTime;
        const duration = slot.duration || 60; // Default 60 minutos se não especificado
        const endTime = calculateEndTime(startTime, duration);
        return `${startTime}h às ${endTime}h`;
      };
      
      // Cria uma mensagem para cada dia
      let messageOffset = mentor ? 1 : (introSlotsOffset > 0 ? introSlotsOffset + 1 : 0);
      for (const dateKey in slotsByDate) {
        const slots = slotsByDate[dateKey];
        messageOffset++;
        const slotMinutes = (baseMinutes + messageOffset) % 60;
        const slotHours = baseMinutes + messageOffset >= 60 ? (baseHours + 1) % 24 : baseHours;
        
        // Extrai apenas o nome do dia e a data (remove " - ")
        const [date, dayName] = dateKey.split(' - ');
        const dayMessage: JourneyMessage = {
          id: messageIdCounter.current++,
          sender: "mentor",
          type: "text",
          content: `${dayName} (${date}):\n${slots.map((slot) => `• ${formatTimeRange(slot)}`).join('\n')}`,
          timestamp: `${slotHours.toString().padStart(2, "0")}:${slotMinutes.toString().padStart(2, "0")}`,
        };
        setChatMessages(prev => [...prev, dayMessage]);
      }
      
      // Mensagem final
      const finalOffset = messageOffset + 1;
      const finalMinutes = (baseMinutes + finalOffset) % 60;
      const finalHours = baseMinutes + finalOffset >= 60 ? (baseHours + 1) % 24 : baseHours;
      const finalMessage: JourneyMessage = {
        id: messageIdCounter.current++,
        sender: "mentor",
        type: "text",
        content: "Por favor, me informe qual horário você gostaria de escolher!",
        timestamp: `${finalHours.toString().padStart(2, "0")}:${finalMinutes.toString().padStart(2, "0")}`,
      };
      setChatMessages(prev => [...prev, finalMessage]);
    } else if (messageType === 'appointment_created' && rawData) {
      // Formatação especial para confirmação de agendamento
      const sessionData = rawData;
      const activeSlot = sessionData.activeSlot || sessionData;
      // Tenta encontrar mentor no rawData ou usa o mentor do contexto anterior
      let sessionMentor = sessionData.mentor || mentor;
      
      // Se não encontrou mentor, tenta extrair do answer (pode conter nome do mentor)
      if (!sessionMentor && response.formattedResponse?.answer) {
        const answer = response.formattedResponse.answer;
        const mentorMatch = answer.match(/\*\*([^*]+)\*\*/);
        if (mentorMatch) {
          sessionMentor = { name: mentorMatch[1] } as ChatMentor;
        }
      }
      
      // Converte UTC para horário local
      const formatDateFromUtc = (utcDate: string, timezone: string = 'America/Sao_Paulo'): { date: string; time: string; dayName: string } => {
        try {
          const date = new Date(utcDate);
          const formatter = new Intl.DateTimeFormat('pt-BR', {
            timeZone: timezone,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
          const parts = formatter.formatToParts(date);
          
          const dayName = parts.find(p => p.type === 'weekday')?.value || '';
          const day = parts.find(p => p.type === 'day')?.value || '';
          const month = parts.find(p => p.type === 'month')?.value || '';
          const year = parts.find(p => p.type === 'year')?.value || '';
          const hour = parts.find(p => p.type === 'hour')?.value || '';
          const minute = parts.find(p => p.type === 'minute')?.value || '';
          
          // Capitaliza primeira letra do dia da semana
          const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
          
          // Garante formato HH:mm
          const formattedHour = hour.padStart(2, '0');
          const formattedMinute = minute.padStart(2, '0');
          
          return {
            date: `${capitalizedDayName}, ${day} de ${month} de ${year}`,
            time: `${formattedHour}:${formattedMinute}`,
            dayName: capitalizedDayName,
          };
        } catch {
          return { date: '', time: '', dayName: '' };
        }
      };
      
      // Calcula horário de término
      const calculateEndTime = (startTime: string, durationMinutes: number = 60): string => {
        try {
          const [hours, minutes] = startTime.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes + durationMinutes;
          const endHours = Math.floor(totalMinutes / 60) % 24;
          const endMins = totalMinutes % 60;
          return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
        } catch {
          return startTime;
        }
      };
      
      // Extrai informações da sessão
      const startAtUtc = activeSlot.startAtUtc || sessionData.scheduledAt;
      const duration = sessionData.duration || 60;
      const timezone = activeSlot.timezone || 'America/Sao_Paulo';
      const formatted = formatDateFromUtc(startAtUtc, timezone);
      const endTime = calculateEndTime(formatted.time, duration);
      
      // Mensagem 1: Confirmação com nome do mentor
      let confirmationMessage = "Sua sessão foi agendada com sucesso!";
      if (sessionMentor) {
        const mentorName = sessionMentor.name || 'mentor';
        const mentorTitle = sessionMentor.role ? `, ${sessionMentor.role}` : '';
        confirmationMessage = `Sua sessão com ${mentorName}${mentorTitle} foi agendada com sucesso!`;
      }
      
      const confirmationMsg: JourneyMessage = {
        id: messageIdCounter.current++,
        sender: "mentor",
        type: "text",
        content: confirmationMessage,
        timestamp: `${baseHours.toString().padStart(2, "0")}:${baseMinutes.toString().padStart(2, "0")}`,
      };
      setChatMessages(prev => [...prev, confirmationMsg]);
      
      // Mensagem 2: Detalhes da sessão
      const detailsOffset = 1;
      const detailsMinutes = (baseMinutes + detailsOffset) % 60;
      const detailsHours = baseMinutes + detailsOffset >= 60 ? (baseHours + 1) % 24 : baseHours;
      
      let detailsContent = "Aqui estão os detalhes:\n\n";
      if (sessionMentor) {
        detailsContent += `• Mentora: ${sessionMentor.name}\n`;
      }
      if (formatted.date) {
        detailsContent += `• Data: ${formatted.date}\n`;
      }
      if (formatted.time) {
        detailsContent += `• Horário: ${formatted.time}h às ${endTime}h\n`;
      }
      detailsContent += `• Duração: ${duration} minutos`;
      
      const detailsMsg: JourneyMessage = {
        id: messageIdCounter.current++,
        sender: "mentor",
        type: "text",
        content: detailsContent,
        timestamp: `${detailsHours.toString().padStart(2, "0")}:${detailsMinutes.toString().padStart(2, "0")}`,
      };
      setChatMessages(prev => [...prev, detailsMsg]);
      
      // Mensagem 3: Mensagem final de disponibilidade
      const finalOffset = 2;
      const finalMinutes = (baseMinutes + finalOffset) % 60;
      const finalHours = baseMinutes + finalOffset >= 60 ? (baseHours + 1) % 24 : baseHours;
      const finalMsg: JourneyMessage = {
        id: messageIdCounter.current++,
        sender: "mentor",
        type: "text",
        content: "Se precisar de mais alguma coisa ou tiver alguma dúvida, estou à disposição!",
        timestamp: `${finalHours.toString().padStart(2, "0")}:${finalMinutes.toString().padStart(2, "0")}`,
      };
      setChatMessages(prev => [...prev, finalMsg]);
    } else if (isListMentors && mentor) {
      // Mensagem 1: Introdução
      const introMessage: JourneyMessage = {
        id: messageIdCounter.current++,
        sender: "mentor",
        type: "text",
        content: "Aqui estão os mentores disponíveis na plataforma:",
        timestamp: `${baseHours.toString().padStart(2, "0")}:${baseMinutes.toString().padStart(2, "0")}`,
      };
      setChatMessages(prev => [...prev, introMessage]);

      // Mensagem 2: Listagem de mentores (1 minuto depois)
      const mentorsMinutes = (baseMinutes + 1) % 60;
      const mentorsHours = baseMinutes + 1 >= 60 ? (baseHours + 1) % 24 : baseHours;
      const mentorsMessage: JourneyMessage = {
        id: messageIdCounter.current++,
        sender: "mentor",
        type: "mentors",
        content: "Listagem dos mentores",
        timestamp: `${mentorsHours.toString().padStart(2, "0")}:${mentorsMinutes.toString().padStart(2, "0")}`,
        mentors: [mentor],
      };
      setChatMessages(prev => [...prev, mentorsMessage]);

      // Mensagem 3: Mensagem final (2 minutos depois)
      const finalMinutes = (baseMinutes + 2) % 60;
      const finalHours = baseMinutes + 2 >= 60 ? (baseHours + 1) % 24 : baseHours;
      const finalMessage: JourneyMessage = {
        id: messageIdCounter.current++,
        sender: "mentor",
        type: "text",
        content: "Se você quiser mais informações sobre algum mentor específico ou se deseja agendar uma sessão, é só me avisar!",
        timestamp: `${finalHours.toString().padStart(2, "0")}:${finalMinutes.toString().padStart(2, "0")}`,
      };
      setChatMessages(prev => [...prev, finalMessage]);
    } else {
      // Resposta normal - gera timestamp no formato HH:mm
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const botMessage: JourneyMessage = {
        id: messageIdCounter.current++,
        sender: "mentor",
        type: "text",
        content: response.formattedResponse?.answer || response.answer,
        timestamp: `${hours}:${minutes}`,
      };
      setChatMessages(prev => {
        // Atualiza o contador de referência para mensagens individuais
        lastMessagesCountRef.current = prev.length;
        return [...prev, botMessage];
      });
    }
  }, []);

  // Mensagem inicial automática removida - usuário deve enviar mensagem manualmente

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage.trim();
    setInputMessage("");

    // Gera timestamp no formato HH:mm para consistência com as jornadas
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const timestamp = `${hours}:${minutes}`;

    // Adiciona mensagem do usuário imediatamente
    const userMessage: JourneyMessage = {
      id: messageIdCounter.current++,
      sender: "mentee",
      type: "text",
      content: messageText,
      timestamp: timestamp,
    };
    setChatMessages(prev => {
      // Atualiza o contador de referência para mensagens individuais
      lastMessagesCountRef.current = prev.length;
      return [...prev, userMessage];
    });

    try {
      // Obtém userId do localStorage se o usuário estiver logado
      const userStr = localStorage.getItem('user');
      let userId: string | undefined;
      let userWhatsapp: string | undefined;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.id;
          // Tenta obter whatsappNumber do localStorage
          userWhatsapp = user.whatsappNumber;
          // Se não encontrar whatsappNumber, tenta buscar do perfil da API
          if (!userWhatsapp && userId) {
            // Busca do perfil via API (pode estar desatualizado no localStorage)
            try {
              const token = localStorage.getItem('token');
              if (token) {
                const apiUrl = import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
                const profileUrl = `${apiUrl}/auth/profile`;
                const profileResponse = await fetch(profileUrl, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });
                if (profileResponse.ok) {
                  const profileData = await profileResponse.json();
                  const profileUser = profileData.user || profileData;
                  userWhatsapp = profileUser.whatsappNumber;
                  // Atualiza o localStorage com o whatsappNumber se encontrado
                  if (userWhatsapp) {
                    const updatedUser = { ...user, whatsappNumber: userWhatsapp };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                  }
                }
              }
            } catch (e) {
              // Ignora erro ao buscar perfil
              console.error('Erro ao buscar whatsappNumber do perfil:', e);
            }
          }
        } catch (e) {
          // Ignora erro de parsing
        }
      }
      
      // Obtém contexto da rota atual
      const routeContext = getChatContextFromRoute();
      
      // Constrói DTO com sessionId ou phoneNumber
      let dto: { 
        message: string; 
        userCtx?: Record<string, unknown>;
        phoneNumber?: string;
        sessionId?: string;
      };
      
      if (userId) {
        const userCtx: Record<string, unknown> = {
          userId,
          language: 'pt-BR',
        };
        
        if (routeContext.mentorId) {
          userCtx.mentorId = routeContext.mentorId;
        }
        if (routeContext.planId) {
          userCtx.planId = routeContext.planId;
        }
        
        // Se já temos sessionId, usa ele (chamadas subsequentes)
        if (sessionId) {
          dto = { 
            message: messageText, 
            userCtx,
            sessionId: sessionId
          };
        } else if (userWhatsapp) {
          // Primeira chamada: envia phoneNumber (whatsappNumber) para criar/buscar conversa
          // Remove formatação e garante que tenha prefixo 55
          let phoneNumber = userWhatsapp.replace(/\D/g, '');
          if (phoneNumber && !phoneNumber.startsWith('55')) {
            phoneNumber = `55${phoneNumber}`;
          }
          dto = { 
            message: messageText, 
            userCtx,
            phoneNumber: phoneNumber
          };
        } else {
          // Sem phoneNumber nem sessionId, envia apenas userCtx
          // Mas tenta buscar whatsappNumber do perfil se não estiver no localStorage
          dto = { message: messageText, userCtx };
        }
      } else {
        dto = { message: messageText };
      }
      
      const response = await sendMessageAsync(dto);
      
      // Captura sessionId da resposta e armazena
      if (response.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
        localStorage.setItem('chatSessionId', response.sessionId);
        // Salva o userId atual para verificar mudanças de sessão
        if (userId) {
          localStorage.setItem('lastChatUserId', userId);
        }
      }
      
      // Processa resposta do chatbot
      processChatResponse(response);
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    }
  }, [inputMessage, isLoading, sendMessageAsync, processChatResponse, sessionId]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const visibleMessages = allMessages.slice(0, visibleMessagesCount);

  return (
    <div className="flex flex-col h-full min-h-0">
      <WhatsAppHeader 
        name={mentorName}
        avatar={mentorAvatar}
        status="online"
      />
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 min-h-0"
        style={{
          backgroundImage: `url("https://personalmarketingdigital.com.br/wp-content/uploads/2018/05/background-whatsapp-7.jpg")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#e5ddd5'
        }}
      >
        {visibleMessages.map((message) => {
          // Type guard para verificar se é mensagem com mentores
          const mentorsMessage = message as JourneyMessage;
          if (mentorsMessage.type === "mentors" && mentorsMessage.mentors) {
            return (
              <div key={message.id} className="mb-2 animate-fade-in">
                <MentorsList mentors={mentorsMessage.mentors} />
              </div>
            );
          }
          return (
            <ChatBubble
              key={message.id}
              type={message.type as "text" | "image" | "audio"}
              content={message.content}
              sender={message.sender as "mentor" | "mentee"}
              timestamp={message.timestamp}
              caption={message.caption}
              duration={message.duration}
            />
          );
        })}
      </div>
      
      <div className="bg-white px-4 py-3 flex items-center gap-2 border-t border-gray-200 flex-shrink-0">
        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
          <input 
            type="text" 
            placeholder="Mensagem"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="bg-transparent text-gray-900 text-sm w-full outline-none placeholder:text-gray-500 disabled:opacity-50 touch-manipulation"
            autoComplete="off"
          />
        </div>
        <button 
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95 transition-transform"
          type="button"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

