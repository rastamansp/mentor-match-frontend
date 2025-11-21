import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, DollarSign } from "lucide-react";
import { Mentor } from "@domain/entities/Mentor.entity";

interface MentorCardProps {
  mentor: Mentor;
  onViewProfile: (mentorId: string) => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, onViewProfile }) => {
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={() => onViewProfile(mentor.id)}
    >
      <div className="p-6">
        {/* Avatar & Basic Info */}
        <div className="flex items-start space-x-4 mb-4">
          {mentor.avatar ? (
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="w-16 h-16 rounded-full bg-gradient-hero"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {mentor.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{mentor.name}</h3>
            {mentor.role && (
              <p className="text-sm text-muted-foreground truncate">{mentor.role}</p>
            )}
            {mentor.company && (
              <p className="text-sm text-primary font-medium">{mentor.company}</p>
            )}
          </div>
        </div>

        {/* Areas Badge */}
        {mentor.areas && mentor.areas.length > 0 && (
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            {mentor.areas[0]}
          </Badge>
        )}

        {/* Skills */}
        {mentor.skills && mentor.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {mentor.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {mentor.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{mentor.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-sm">
          {mentor.rating !== null && mentor.rating !== undefined && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{mentor.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({mentor.reviews || 0})</span>
            </div>
          )}
          {mentor.location && (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{mentor.location}</span>
            </div>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-5 h-5 text-accent" />
            <span className="font-bold text-xl">R$ {mentor.pricePerHour || mentor.price}</span>
            <span className="text-sm text-muted-foreground">/hora</span>
          </div>
          <Button 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile(mentor.id);
            }}
          >
            Ver Perfil
          </Button>
        </div>
      </div>
    </Card>
  );
};

