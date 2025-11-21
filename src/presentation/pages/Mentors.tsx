import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MapPin, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useMentors } from "../hooks/useMentors";

const Mentors = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: mentors = [], isLoading, error } = useMentors({ searchTerm: searchTerm || undefined });

  const oldMentors = [
    {
      id: 1,
      name: "Ana Silva",
      role: "Senior Product Manager",
      company: "Google",
      specialty: "Product Management",
      rating: 4.9,
      reviews: 127,
      price: 200,
      location: "São Paulo, SP",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      skills: ["Product Strategy", "Agile", "User Research"]
    },
    {
      id: 2,
      name: "Carlos Santos",
      role: "Tech Lead",
      company: "Meta",
      specialty: "Software Engineering",
      rating: 4.8,
      reviews: 98,
      price: 180,
      location: "Rio de Janeiro, RJ",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      skills: ["React", "Node.js", "System Design"]
    },
    {
      id: 3,
      name: "Marina Costa",
      role: "Design Director",
      company: "Nubank",
      specialty: "UX/UI Design",
      rating: 5.0,
      reviews: 156,
      price: 220,
      location: "São Paulo, SP",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marina",
      skills: ["UI Design", "Design Systems", "Figma"]
    },
    {
      id: 4,
      name: "Pedro Oliveira",
      role: "Engineering Manager",
      company: "Amazon",
      specialty: "Leadership",
      rating: 4.7,
      reviews: 89,
      price: 250,
      location: "Belo Horizonte, MG",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
      skills: ["Team Management", "Career Growth", "Technical Leadership"]
    },
    {
      id: 5,
      name: "Julia Ferreira",
      role: "Data Science Lead",
      company: "Microsoft",
      specialty: "Data Science",
      rating: 4.9,
      reviews: 112,
      price: 210,
      location: "São Paulo, SP",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julia",
      skills: ["Machine Learning", "Python", "Data Analytics"]
    },
    {
      id: 6,
      name: "Ricardo Almeida",
      role: "CTO",
      company: "Startup Tech",
      specialty: "Startup & Entrepreneurship",
      rating: 4.8,
      reviews: 74,
      price: 300,
      location: "Florianópolis, SC",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo",
      skills: ["Startup Strategy", "Fundraising", "Tech Stack"]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="text-center py-16">
              <p className="text-lg text-destructive mb-4">Erro ao carregar mentores</p>
              <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredMentors = mentors;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Encontre seu Mentor</h1>
            <p className="text-lg text-muted-foreground">
              Conecte-se com especialistas que podem ajudar você a crescer
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por nome, especialidade ou habilidade..."
                className="pl-12 h-14 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 'es' : ''} encontrado{filteredMentors.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Mentors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card 
                key={mentor.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/mentor/${mentor.id}`)}
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
                        navigate(`/mentor/${mentor.id}`);
                      }}
                    >
                      Ver Perfil
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredMentors.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">
                Nenhum mentor encontrado com esses critérios
              </p>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Limpar Busca
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mentors;
