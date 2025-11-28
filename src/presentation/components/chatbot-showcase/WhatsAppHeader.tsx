import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";

interface WhatsAppHeaderProps {
  name: string;
  avatar: string;
  status?: string;
}

export const WhatsAppHeader = ({ name, avatar, status = "online" }: WhatsAppHeaderProps) => {
  return (
    <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-200 flex-shrink-0">
      <button className="text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 font-medium text-sm truncate">{name}</h3>
          <p className="text-gray-500 text-xs">{status}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-gray-600 hover:text-gray-900">
          <Video className="w-5 h-5" />
        </button>
        <button className="text-gray-600 hover:text-gray-900">
          <Phone className="w-5 h-5" />
        </button>
        <button className="text-gray-600 hover:text-gray-900">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

