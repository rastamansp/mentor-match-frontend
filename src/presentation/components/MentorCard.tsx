import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, DollarSign } from "lucide-react";
import { Mentor } from "@domain/entities/Mentor.entity";

interface MentorCardProps {
  mentor: Mentor;
  onViewProfile: (mentorId: number) => void;
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
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-16 h-16 rounded-full bg-gradient-hero"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{mentor.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{mentor.role}</p>
            <p className="text-sm text-primary font-medium">{mentor.company}</p>
          </div>
        </div>

        {/* Specialty Badge */}
        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
          {mentor.specialty}
        </Badge>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {mentor.skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{mentor.rating}</span>
            <span className="text-muted-foreground">({mentor.reviews})</span>
          </div>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{mentor.location}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-5 h-5 text-accent" />
            <span className="font-bold text-xl">R$ {mentor.price}</span>
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

