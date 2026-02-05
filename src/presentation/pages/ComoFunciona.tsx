import { useRef } from "react";
import { PhoneMockup } from "@/presentation/components/chatbot-showcase/PhoneMockup";
import { ChatInterface } from "@/presentation/components/chatbot-showcase/ChatInterface";
import Navbar from "@/components/Navbar";

const ComoFunciona = () => {
  const phoneMockupRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 min-h-[calc(100vh-6rem)]">
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

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">3</div>
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
              <ChatInterface useDetectIntent />
            </PhoneMockup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComoFunciona;
