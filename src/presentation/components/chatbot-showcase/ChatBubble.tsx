import { useState } from "react";
import { Play, Pause } from "lucide-react";

interface ChatBubbleProps {
  type: "text" | "image" | "audio";
  content: string;
  sender: "mentor" | "mentee";
  timestamp: string;
  caption?: string;
  duration?: string;
}

export const ChatBubble = ({ type, content, sender, timestamp, caption, duration }: ChatBubbleProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isSent = sender === "mentee";

  const bubbleClass = isSent 
    ? "bg-chat-sent ml-auto rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-sm" 
    : "bg-chat-received mr-auto rounded-tl-lg rounded-tr-lg rounded-br-lg rounded-bl-sm";

  // Formata o timestamp para exibir apenas o horário (HH:mm)
  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return timestamp; // Retorna o timestamp original se houver erro
    }
  };

  const formattedTime = formatTime(timestamp);

  if (type === "text") {
    return (
      <div className={`max-w-[75%] ${isSent ? "ml-auto" : "mr-auto"} mb-2 animate-fade-in`}>
        <div className={`${bubbleClass} px-4 py-2 shadow-sm`}>
          <p className="text-gray-900 text-sm leading-relaxed">{content}</p>
          <span className="text-xs text-gray-600 mt-1 block text-right">{formattedTime}</span>
        </div>
      </div>
    );
  }

  if (type === "image") {
    return (
      <div className={`max-w-[75%] ${isSent ? "ml-auto" : "mr-auto"} mb-2 animate-fade-in`}>
        <div className={`${bubbleClass} overflow-hidden shadow-md`}>
          <img 
            src={content} 
            alt="Chat image" 
            className="w-full h-auto"
            loading="lazy"
          />
          {caption && (
            <div className="px-4 py-2">
              <p className="text-gray-900 text-sm">{caption}</p>
              <span className="text-xs text-gray-600 mt-1 block text-right">{formattedTime}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === "audio") {
    return (
      <div className={`max-w-[75%] ${isSent ? "ml-auto" : "mr-auto"} mb-2 animate-fade-in`}>
        <div className={`${bubbleClass} rounded-full px-4 py-3 shadow-sm flex items-center gap-3`}>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-primary" />
            ) : (
              <Play className="w-4 h-4 text-primary ml-0.5" />
            )}
          </button>
          <div className="flex-1">
            <div className="h-6 flex items-center gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i}
                  className="w-1 bg-primary rounded-full transition-all"
                  style={{ 
                    height: `${Math.random() * 100}%`,
                    opacity: isPlaying ? 0.8 : 0.4
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col items-end">
            <span className="text-xs text-gray-600">{duration}</span>
            <span className="text-xs text-gray-600">{formattedTime}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

