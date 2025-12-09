import { ChatMentor } from '@application/use-cases/chat/SendChatMessage.usecase';
import { Star } from 'lucide-react';

interface MentorsListProps {
  mentors: ChatMentor[];
}

export const MentorsList = ({ mentors }: MentorsListProps) => {
  return (
    <div className="space-y-3 max-w-[85%] mr-auto">
      {mentors.map((mentor) => (
        <div
          key={mentor.id}
          className="bg-chat-received rounded-lg p-3 shadow-sm"
        >
          <div className="flex items-start gap-3">
            {mentor.avatar ? (
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {mentor.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                    {mentor.name}
                  </h4>
                  {mentor.role && mentor.company && (
                    <p className="text-xs text-gray-600 truncate">
                      {mentor.role} na {mentor.company}
                    </p>
                  )}
                  {mentor.specialty && (
                    <p className="text-xs text-primary font-medium mt-0.5">
                      {mentor.specialty}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {mentor.rating !== null && mentor.rating !== undefined && (
                    <>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-gray-700">
                        {mentor.rating.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {mentor.bio && (
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {mentor.bio}
                </p>
              )}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-900">
                  R$ {mentor.pricePerHour}/hora
                </span>
                {mentor.reviews > 0 && (
                  <span className="text-xs text-gray-500">
                    {mentor.reviews} avaliações
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

