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
  headerName?: string;
  headerAvatar?: string;
}

export const ChatInterface = ({ 
  journeyMessages, 
  headerName, 
  headerAvatar 
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
  const { sendMessageAsync, isLoading } = useChat();

  const mentorName = headerName || conversation.participants.mentor.name;
  const mentorAvatar = headerAvatar || conversation.participants.mentor.avatar;

  // Se houver journeyMessages, usa eles (modo demo)
  // Caso contrário, se houver chatMessages, usa eles
  // Caso contrário, usa conversation.messages padrão
  const allMessages = journeyMessages || (chatMessages.length > 0 ? chatMessages : conversation.messages);

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
      // Se for modo demo (journeyMessages), inicia animação
      // Se for modo real (chatMessages), mostra todas imediatamente
      if (journeyMessages) {
        setVisibleMessagesCount(0);
      } else {
        setVisibleMessagesCount(allMessages.length);
      }
    }
  }, [messagesKey, journeyMessages, allMessages.length]);

  // Animate messages appearing one by one (apenas no modo demo)
  useEffect(() => {
    if (!journeyMessages) return; // Não anima no modo real
    
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
  }, [visibleMessagesCount, journeyMessages]);

  // Auto-scroll when new message appears
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [visibleMessagesCount, chatMessages]);

  // Função para processar resposta do chatbot
  const processChatResponse = useCallback((response: any) => {
    const isListMentors = response.toolsUsed?.some(
      (tool: { name: string }) => tool.name === 'list_mentors'
    );

    if (isListMentors && response.formattedResponse?.data?.rawData) {
      const mentors = response.formattedResponse.data.rawData as ChatMentor[];
      
      // Mensagem 1: Introdução
      const introMessage: JourneyMessage = {
        id: messageIdCounter.current++,
        sender: "mentor",
        type: "text",
        content: "Aqui estão os mentores disponíveis na plataforma:",
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, introMessage]);

      // Mensagem 2: Listagem de mentores
      const mentorsMessage: JourneyMessage = {
        id: messageIdCounter.current++,
        sender: "mentor",
        type: "mentors",
        content: "Listagem dos mentores",
        timestamp: new Date().toISOString(),
        mentors: mentors,
      };
      setChatMessages(prev => [...prev, mentorsMessage]);

      // Mensagem 3: Mensagem final
      const finalMessage: JourneyMessage = {
        id: messageIdCounter.current++,
        sender: "mentor",
        type: "text",
        content: "Se você quiser mais informações sobre algum mentor específico ou se deseja agendar uma sessão, é só me avisar!",
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, finalMessage]);
    } else {
      // Resposta normal
      const botMessage: JourneyMessage = {
        id: messageIdCounter.current++,
        sender: "mentor",
        type: "text",
        content: response.formattedResponse?.answer || response.answer,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, botMessage]);
    }
  }, []);

  // Enviar mensagem inicial automaticamente quando não houver journeyMessages
  useEffect(() => {
    if (!journeyMessages && !isInitialMessageSent && chatMessages.length === 0) {
      const sendInitialMessage = async () => {
        try {
          setIsInitialMessageSent(true);
          const initialMessage = "Olá, como posso ajudar?";
          
          // Adiciona mensagem do usuário
          const userMessage: JourneyMessage = {
            id: messageIdCounter.current++,
            sender: "mentee",
            type: "text",
            content: initialMessage,
            timestamp: new Date().toISOString(),
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

    // Adiciona mensagem do usuário imediatamente
    const userMessage: JourneyMessage = {
      id: messageIdCounter.current++,
      sender: "mentee",
      type: "text",
      content: messageText,
      timestamp: new Date().toISOString(),
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
          if (message.type === "mentors" && message.mentors) {
            return (
              <div key={message.id} className="mb-2 animate-fade-in">
                <MentorsList mentors={message.mentors} />
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
            disabled={isLoading || !!journeyMessages}
            className="bg-transparent text-gray-900 text-sm w-full outline-none placeholder:text-gray-500 disabled:opacity-50"
          />
        </div>
        <button 
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim() || !!journeyMessages}
          className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

