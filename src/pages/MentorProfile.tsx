import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Briefcase, Award, Calendar, DollarSign } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app this would come from API
  const mentor = {
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
    skills: ["Product Strategy", "Agile", "User Research", "Roadmap Planning", "Stakeholder Management"],
    bio: "Com mais de 10 anos de experiência em Product Management, já liderei o desenvolvimento de produtos que impactaram milhões de usuários. Minha paixão é ajudar profissionais a desenvolverem suas habilidades em gestão de produtos e a avançarem em suas carreiras.",
    experience: [
      {
        title: "Senior Product Manager",
        company: "Google",
        period: "2020 - Presente",
        description: "Liderando o desenvolvimento de features para o Google Search"
      },
      {
        title: "Product Manager",
        company: "Amazon",
        period: "2017 - 2020",
        description: "Gerenciei produtos na área de logística e entrega"
      },
      {
        title: "Associate Product Manager",
        company: "Nubank",
        period: "2015 - 2017",
        description: "Trabalhei no desenvolvimento do app mobile"
      }
    ],
    achievements: [
      "Lançamento de produto com 5M+ usuários no primeiro ano",
      "Certificação Product Management pela Product School",
      "Speaker em conferências de Product",
      "Mentoria de 100+ profissionais"
    ],
    availability: [
      "Segunda: 18h - 21h",
      "Quarta: 18h - 21h",
      "Sábado: 9h - 12h"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate('/mentors')}
          >
            ← Voltar para mentores
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <div className="text-center mb-6">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-hero"
                  />
                  <h2 className="text-2xl font-bold mb-1">{mentor.name}</h2>
                  <p className="text-muted-foreground mb-2">{mentor.role}</p>
                  <p className="text-primary font-semibold mb-4">{mentor.company}</p>
                  
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg">{mentor.rating}</span>
                    <span className="text-muted-foreground">({mentor.reviews} avaliações)</span>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-6">
                    <MapPin className="w-4 h-4" />
                    <span>{mentor.location}</span>
                  </div>

                  <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 text-base px-4 py-1">
                    {mentor.specialty}
                  </Badge>
                </div>

                <div className="border-t border-border pt-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">Valor por sessão:</span>
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-accent" />
                      <span className="font-bold text-2xl">R$ {mentor.price}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center mb-4">Sessões de 1 hora via Zoom</p>
                </div>

                <Button 
                  className="w-full bg-gradient-hero border-0 hover:opacity-90 text-lg py-6"
                  onClick={() => navigate(`/agendar/${mentor.id}`)}
                >
                  Agendar Sessão
                </Button>
              </Card>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Sobre</h3>
                <p className="text-muted-foreground leading-relaxed">{mentor.bio}</p>
              </Card>

              {/* Skills */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Experience */}
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Experiência</h3>
                </div>
                <div className="space-y-4">
                  {mentor.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <h4 className="font-semibold">{exp.title}</h4>
                      <p className="text-sm text-primary">{exp.company}</p>
                      <p className="text-sm text-muted-foreground mb-1">{exp.period}</p>
                      <p className="text-muted-foreground">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Achievements */}
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="w-5 h-5 text-accent" />
                  <h3 className="text-xl font-bold">Conquistas</h3>
                </div>
                <ul className="space-y-2">
                  {mentor.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-muted-foreground">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Availability */}
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Disponibilidade</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {mentor.availability.map((slot, index) => (
                    <div key={index} className="p-3 bg-secondary/50 rounded-lg text-center">
                      <p className="text-sm font-medium">{slot}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  * Horários em fuso horário de Brasília (BRT)
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;
