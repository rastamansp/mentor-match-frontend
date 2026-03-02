import { useRef, useState } from "react";
import { PhoneMockup } from "@/presentation/components/chatbot-showcase/PhoneMockup";
import { ChatInterface } from "@/presentation/components/chatbot-showcase/ChatInterface";
import Navbar from "@/components/Navbar";

const ComoFunciona = () => {
  const phoneMockupRef = useRef<HTMLDivElement>(null);
  const [lastResult, setLastResult] = useState<{
    intent: string;
    confidence: number;
    keywords: string[];
    intentLabel: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 min-h-[calc(100vh-6rem)]">
          <div className="flex-1 max-w-2xl text-center lg:text-left space-y-6 animate-fade-in">
            <div className="inline-block">
              <span className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                🧪 Teste de Intenções
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
              Teste de Intenções
              <span className="block text-primary animate-gradient">Melhore o prompt do assistente</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Digite frases no chat ao lado para ver qual intenção é detectada (intenção, confiança e
              palavras-chave). Use o resultado para refinar o prompt do assistente e melhorar a
              detecção de intenções na plataforma.
            </p>

            {lastResult && (
              <div className="rounded-lg border bg-muted/40 p-4 text-left space-y-2">
                <p className="text-sm font-medium text-foreground">Última detecção</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Intenção:</span> {lastResult.intentLabel}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Confiança:</span> {Math.round(lastResult.confidence * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Palavras-chave:</span>{" "}
                  {lastResult.keywords.length > 0 ? lastResult.keywords.join(", ") : "—"}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {lastResult ? lastResult.intentLabel : "Intenção"}
                </div>
                <div className="text-sm text-muted-foreground">O que o modelo classifica</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {lastResult != null ? `${Math.round(lastResult.confidence * 100)}%` : "Confiança"}
                </div>
                <div className="text-sm text-muted-foreground">Score retornado</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary break-words">
                  {lastResult?.keywords?.length ? lastResult.keywords.join(", ") : "Palavras-chave"}
                </div>
                <div className="text-sm text-muted-foreground">Para ajuste do prompt</div>
              </div>
            </div>
          </div>

          <div ref={phoneMockupRef} className="flex-shrink-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <PhoneMockup>
              <ChatInterface
                useDetectIntent
                onDetectIntentResult={(data) =>
                  setLastResult({
                    intent: data.intent,
                    confidence: data.confidence,
                    keywords: data.keywords,
                    intentLabel: data.intentLabel,
                  })
                }
              />
            </PhoneMockup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComoFunciona;
