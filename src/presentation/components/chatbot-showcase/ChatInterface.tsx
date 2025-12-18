import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { ChatBubble } from "./ChatBubble";
import { WhatsAppHeader } from "./WhatsAppHeader";
import { MentorsList } from "./MentorsList";
import chatData from "@shared/data/chatData.json";
import { useChat } from "@/presentation/hooks/useChat";
import { toast } from "sonner";
import { ChatMentor } from "@application/use-cases/chat/SendChatMessage.usecase";

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
  const [isInitialMessageSent, setIsInitialMessageSent] = useState(false);
  const messageIdCounter = useRef(1);
  const lastJourneyKeyRef = useRef<string>(""); // Rastreia a última jornada adicionada para evitar duplicação imediata
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
        
        // Notifica que as mensagens foram adicionadas
        if (onJourneyMessagesAdded) {
          onJourneyMessagesAdded();
        }
      }
    }
  }, [journeyMessages, journeySelectionKey, onJourneyMessagesAdded]);

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

  // Update messages ref when messages change
  useEffect(() => {
    messagesRef.current = allMessages as JourneyMessage[];
  }, [allMessages]);

  // Reset visible messages when messages change
  useEffect(() => {
    if (messagesKeyRef.current !== messagesKey) {
      messagesKeyRef.current = messagesKey;
      // Se for modo demo (journeyMessages) e não houver chatMessages, inicia animação
      // Se for modo real (chatMessages), mostra todas imediatamente
      if (journeyMessages && chatMessages.length === 0) {
        setVisibleMessagesCount(0);
      } else {
        // Mostra todas as mensagens imediatamente quando há chatMessages
        setVisibleMessagesCount(allMessages.length);
      }
    }
  }, [messagesKey, journeyMessages, chatMessages.length, allMessages.length]);

  // Animate messages appearing one by one (apenas no modo demo, quando não há chatMessages)
  useEffect(() => {
    // Não anima se já houver chatMessages (usuário interagiu ou jornada foi adicionada)
    if (chatMessages.length > 0) return;
    if (!journeyMessages) return;
    
    const currentMessages = messagesRef.current;
    if (visibleMessagesCount < currentMessages.length) {
      const nextMessage = currentMessages[visibleMessagesCount];
      // Mentor messages take longer to "type", user messages are faster
      const delay = nextMessage.sender === "mentor" ? 1500 : 800;
      const timer = setTimeout(() => {
        setVisibleMessagesCount(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [visibleMessagesCount, journeyMessages, chatMessages.length]);

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
    const isListMentors = response.toolsUsed?.some(
      (tool: { name: string }) => tool.name === 'list_mentors'
    );

    if (isListMentors && response.formattedResponse?.data?.rawData) {
      const mentors = response.formattedResponse.data.rawData as ChatMentor[];
      
      // Gera timestamps no formato HH:mm para consistência
      const now = new Date();
      const baseHours = now.getHours();
      const baseMinutes = now.getMinutes();
      
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
        mentors: mentors,
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
      setChatMessages(prev => [...prev, botMessage]);
    }
  }, []);

  // Enviar mensagem inicial automaticamente quando não houver journeyMessages e chatMessages estiver vazio
  useEffect(() => {
    if (!journeyMessages && !isInitialMessageSent && chatMessages.length === 0) {
      const sendInitialMessage = async () => {
        try {
          setIsInitialMessageSent(true);
          const initialMessage = "Olá, como posso ajudar?";
          
          // Gera timestamp no formato HH:mm
          const now = new Date();
          const hours = now.getHours().toString().padStart(2, "0");
          const minutes = now.getMinutes().toString().padStart(2, "0");
          
          // Adiciona mensagem do usuário
          const userMessage: JourneyMessage = {
            id: messageIdCounter.current++,
            sender: "mentee",
            type: "text",
            content: initialMessage,
            timestamp: `${hours}:${minutes}`,
          };
          setChatMessages([userMessage]);

          // Envia para API e aguarda resposta
          const response = await sendMessageAsync({ message: initialMessage });
          
          // Processa resposta do chatbot
          processChatResponse(response);
        } catch (error) {
          toast.error('Erro ao enviar mensagem inicial');
        }
      };

      sendInitialMessage();
    }
  }, [journeyMessages, isInitialMessageSent, chatMessages.length, sendMessageAsync, processChatResponse]);

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
    setChatMessages(prev => [...prev, userMessage]);

    try {
      // Envia para API
      const response = await sendMessageAsync({ message: messageText });
      
      // Processa resposta do chatbot
      processChatResponse(response);
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    }
  }, [inputMessage, isLoading, sendMessageAsync, processChatResponse]);

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

