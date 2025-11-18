import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MessageSquare } from "lucide-react";
import { Session } from "@domain/entities/Session.entity";

interface SessionCardProps {
  session: Session;
  onViewDetails?: (sessionId: string) => void;
  variant?: 'upcoming' | 'past';
}

export const SessionCard: React.FC<SessionCardProps> = ({ 
  session, 
  onViewDetails,
  variant = 'upcoming'
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left Section - Mentor Info */}
        <div className="flex items-start space-x-4 flex-1">
          <img
            src={session.mentorAvatar}
            alt={session.mentorName}
            className="w-16 h-16 rounded-full bg-gradient-hero"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">{session.mentorName}</h3>
            <p className="font-medium text-foreground mb-2">{session.topic}</p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {variant === 'past' 
                  ? `${formatDate(session.date)} às ${session.time}`
                  : formatDate(session.date)
                }
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section - Date/Time (only for upcoming) */}
        {variant === 'upcoming' && (
          <div className="flex flex-col space-y-2 min-w-[200px]">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{session.time} BRT</span>
            </div>
            <Badge className="w-fit bg-accent/10 text-accent hover:bg-accent/20">
              {session.status === 'scheduled' ? 'Agendada' : 'Pendente'}
            </Badge>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex flex-col space-y-2 min-w-[200px]">
          {variant === 'past' && (
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
          )}
          {variant === 'upcoming' && onViewDetails && (
            <Button variant="outline" size="sm" onClick={() => onViewDetails(session.id)}>
              Detalhes
            </Button>
          )}
          {variant === 'past' && (
            <Button variant="outline" size="sm">
              Avaliar Sessão
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

