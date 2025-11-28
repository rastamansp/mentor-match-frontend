import { useEffect, useRef } from "react";
import { ChatBubble } from "./ChatBubble";
import { WhatsAppHeader } from "./WhatsAppHeader";
import chatData from "@shared/data/chatData.json";

export const ChatInterface = () => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { conversation } = chatData;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <WhatsAppHeader 
        name={conversation.participants.mentor.name}
        avatar={conversation.participants.mentor.avatar}
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
        {conversation.messages.map((message) => (
          <ChatBubble
            key={message.id}
            type={message.type as "text" | "image" | "audio"}
            content={message.content}
            sender={message.sender as "mentor" | "mentee"}
            timestamp={message.timestamp}
            caption={message.caption}
            duration={message.duration}
          />
        ))}
      </div>
      
      <div className="bg-white px-4 py-3 flex items-center gap-2 border-t border-gray-200 flex-shrink-0">
        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
          <input 
            type="text" 
            placeholder="Mensagem"
            className="bg-transparent text-gray-900 text-sm w-full outline-none placeholder:text-gray-500"
          />
        </div>
        <button className="text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

