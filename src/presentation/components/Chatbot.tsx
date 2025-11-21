import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '../hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessageDto } from '@application/dto/ChatMessageDto';
import { ChatMentor } from '@application/use-cases/chat/SendChatMessage.usecase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  suggestions?: string[];
  mentors?: ChatMentor[];
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Olá! Sou o assistente virtual do Mentor Match. Como posso ajudá-lo hoje? Você pode perguntar sobre mentores disponíveis, agendamentos e muito mais.',
      isBot: true,
    },
  ]);
  const { sendMessageAsync, isLoading } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Por favor, digite uma mensagem');
      return;
    }

    const userMessage = message.trim();
    const userId = user?.id || 'user-123';
    const dto: ChatMessageDto = {
      message: userMessage,
      userCtx: {
        userId,
        language: 'pt-BR',
      },
    };

    // Adiciona mensagem do usuário ao chat
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: userMessage,
      isBot: false,
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');

    try {
      const response = await sendMessageAsync(dto);
      
      // Verifica se há mentores nos dados
      const mentors = Array.isArray(response.formattedResponse?.data?.rawData)
        ? response.formattedResponse.data.rawData
        : undefined;
      
      // Adiciona resposta do bot ao chat
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.answer || response.formattedResponse?.answer || 'Resposta recebida',
        isBot: true,
        suggestions: response.formattedResponse?.data?.suggestions,
        mentors,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      // Erro já é tratado no hook useChat
      // Remove a mensagem do usuário em caso de erro
      setMessages((prev) => prev.filter((msg) => msg.id !== userMsg.id));
    }
  };

  const handleMentorClick = (mentorId: string) => {
    setIsOpen(false);
    // Navega para a página de mentores - pode precisar ajustar conforme a rota
    navigate('/mentors');
    // Scroll para o mentor específico ou mostrar modal
    setTimeout(() => {
      toast.info('Use a busca para encontrar o mentor específico');
    }, 500);
  };

  const handleBookMentor = (mentorId: string) => {
    setIsOpen(false);
    navigate(`/agendar/${mentorId}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 bg-gradient-hero border-0 hover:opacity-90"
        size="icon"
        aria-label="Abrir chatbot"
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </Button>

      {/* Modal do Chatbot */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl font-bold">Chatbot Mentor Match</DialogTitle>
            <DialogDescription className="mt-1">
              Faça perguntas sobre mentores e agendamentos
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.isBot ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.isBot ? 'bg-gradient-hero' : 'bg-primary'
                    }`}
                  >
                    {msg.isBot ? (
                      <MessageSquare className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div
                      className={`rounded-lg p-4 ${
                        msg.isBot
                          ? 'bg-muted text-foreground'
                          : 'bg-gradient-hero text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    
                    {/* Cards de Mentores */}
                    {msg.mentors && msg.mentors.length > 0 && (
                      <div className="space-y-3 mt-3">
                        {msg.mentors.map((mentor) => (
                          <Card
                            key={mentor.id}
                            className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-lg">
                                  {mentor.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm mb-1">{mentor.name}</h4>
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {mentor.bio}
                                </p>
                                {mentor.areas && mentor.areas.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {mentor.areas.slice(0, 3).map((area, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {area}
                                      </Badge>
                                    ))}
                                    {mentor.areas.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{mentor.areas.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                {(!mentor.areas || mentor.areas.length === 0) && mentor.specialty && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {mentor.specialty}
                                    </Badge>
                                  </div>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      <span>R$ {mentor.pricePerHour}/h</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMentorClick(mentor.id);
                                      }}
                                    >
                                      Ver Perfil
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs bg-gradient-hero border-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleBookMentor(mentor.id);
                                      }}
                                    >
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Agendar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs h-7"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="px-6 pb-6 pt-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem aqui..."
                className="min-h-[80px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
                className="self-end bg-gradient-hero border-0 hover:opacity-90"
                size="icon"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Pressione Enter para enviar, Shift+Enter para nova linha
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

