import { PhoneMockup } from "@/presentation/components/chatbot-showcase/PhoneMockup";
import { ChatInterface } from "@/presentation/components/chatbot-showcase/ChatInterface";
import Navbar from "@/components/Navbar";

const TestChatbot = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 min-h-[calc(100vh-6rem)]">
          <div className="flex-1 max-w-2xl text-center lg:text-left space-y-6 animate-fade-in">
            <div className="inline-block">
              <span className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                ✨ Demonstração Interativa
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
              Teste seu
              <span className="block text-primary animate-gradient">Chatbot AI</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Veja como funciona a interação entre mentor e mentorado através do WhatsApp. 
              Mensagens de texto, imagens e áudio em tempo real.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105">
                Experimentar Agora
              </button>
              <button className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105">
                Saiba Mais
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Conversas Ativas</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Satisfação</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Disponível</div>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <PhoneMockup>
              <ChatInterface />
            </PhoneMockup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestChatbot;

