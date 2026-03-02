import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneMockup } from "@/presentation/components/chatbot-showcase/PhoneMockup";
import { ChatInterface } from "@/presentation/components/chatbot-showcase/ChatInterface";
import { InteractionsSelector } from "@/presentation/components/chatbot-showcase/InteractionsSelector";
import { useInteractions } from "@/presentation/hooks/useInteractions";
import Navbar from "@/components/Navbar";

interface Journey {
  name: string;
  description?: string;
  messages: Array<{ from: "user" | "concierge"; text: string }>;
}

const TestChatbot = () => {
  const navigate = useNavigate();
  const [isInteractionsOpen, setIsInteractionsOpen] = useState(false);
  const { selectedJourney, selectJourney, convertJourneyToMessages, journeys } = useInteractions();
  const phoneMockupRef = useRef<HTMLDivElement>(null);
  const journeySelectionCounterRef = useRef(0); // Contador para forçar atualização quando jornada é selecionada
  const hasLoadedInitialJourney = useRef(false); // Flag para garantir que carregue apenas uma vez

  // Zera o sessionId ao carregar a página para simular nova interação
  useEffect(() => {
    // Remove sessionId do localStorage para começar uma nova conversa
    localStorage.removeItem('chatSessionId');
  }, []); // Executa apenas uma vez ao montar o componente

  // Exibir automaticamente a jornada "Descoberta" ao carregar a página
  useEffect(() => {
    // Carrega apenas uma vez quando as jornadas estiverem disponíveis
    if (journeys.length > 0 && !hasLoadedInitialJourney.current) {
      const discoveryJourney = journeys.find(j => j.name === "1 - Descoberta");
      if (discoveryJourney) {
        hasLoadedInitialJourney.current = true; // Marca como carregada
        journeySelectionCounterRef.current += 1; // Incrementa contador para a jornada inicial
        selectJourney(discoveryJourney);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeys]); // Executa apenas quando journeys estiver disponível

  // Scroll automático para o iPhone quando uma jornada é selecionada (especialmente no mobile)
  useEffect(() => {
    if (selectedJourney && phoneMockupRef.current) {
      // Delay para garantir que o DOM foi atualizado e as mensagens começaram a aparecer
      const timeoutId = setTimeout(() => {
        if (phoneMockupRef.current) {
          // No mobile, usa 'start' para garantir que o topo do iPhone fique visível
          // No desktop, usa 'center' para centralizar
          const isMobile = window.innerWidth < 1024;
          phoneMockupRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: isMobile ? 'start' : 'center',
            inline: 'nearest'
          });
        }
      }, 300); // Delay maior para garantir que a animação das mensagens começou
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedJourney]);

  const handleSelectJourney = (journey: Journey) => {
    // Incrementa o contador para forçar atualização no ChatInterface
    journeySelectionCounterRef.current += 1;
    // Sempre seleciona a jornada (as mensagens serão adicionadas ao histórico no ChatInterface)
    selectJourney(journey);
    setIsInteractionsOpen(false); // Fecha o seletor após selecionar
  };

  const journeyMessages = selectedJourney ? convertJourneyToMessages(selectedJourney) : undefined;
  const headerName = selectedJourney ? "John — Concierge MentorMatch" : undefined;
  const headerAvatar = selectedJourney ? "🤖" : undefined;
  // Passa o contador como prop para forçar atualização no ChatInterface
  const journeySelectionKey = selectedJourney ? `${selectedJourney.name}-${journeySelectionCounterRef.current}` : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 min-h-[calc(100vh-6rem)]" id="test-chatbot-content">
          <div className="flex-1 max-w-2xl text-center lg:text-left space-y-6 animate-fade-in">
            <div className="inline-block">
              <span className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                🤖 Experimente a Plataforma MentorMatch
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
              Experimente a
              <span className="block text-primary animate-gradient">Plataforma MentorMatch</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Experimente diferentes jornadas de conversação e veja como nossa plataforma 
              guia usuários desde o primeiro contato até o agendamento de sessões de mentoria.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => setIsInteractionsOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
              >
                Ver Jornadas de Conversação
              </button>
              {selectedJourney && (
                <button
                  onClick={() => navigate('/como-funciona')}
                  className="bg-muted hover:bg-muted/80 text-foreground px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105"
                >
                  Testar Intenções
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">{journeys.length}</div>
                <div className="text-sm text-muted-foreground">Jornadas Disponíveis</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Interativo</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">IA</div>
                <div className="text-sm text-muted-foreground">Inteligente</div>
              </div>
            </div>
          </div>
          
          <div ref={phoneMockupRef} className="flex-shrink-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <PhoneMockup>
              <ChatInterface 
                journeyMessages={journeyMessages}
                journeyName={selectedJourney?.name}
                journeySelectionKey={journeySelectionKey}
                headerName={headerName}
                headerAvatar={headerAvatar}
              />
            </PhoneMockup>
          </div>
        </div>
      </div>

      <InteractionsSelector
        open={isInteractionsOpen}
        onOpenChange={setIsInteractionsOpen}
        onSelectJourney={handleSelectJourney}
      />
    </div>
  );
};

export default TestChatbot;

