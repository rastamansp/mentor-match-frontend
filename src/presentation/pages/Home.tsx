import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Calendar, Video, MessageSquare, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-mentorship.jpg";
import { Chatbot } from "../components/Chatbot";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Encontre seu Mentor Ideal",
      description: "Busque por especialidade, experiência e disponibilidade"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Agendamento Fácil",
      description: "Agende sessões de acordo com sua disponibilidade"
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Sessões via Zoom",
      description: "Reuniões integradas e automáticas pelo Zoom"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Chatbot Inteligente",
      description: "Consulte transcrições de sessões anteriores"
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8 text-accent" />,
      title: "Acelere sua Carreira",
      description: "Aprenda com profissionais experientes e alcance seus objetivos mais rápido"
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: "Network Qualificado",
      description: "Conecte-se com mentores de empresas líderes do mercado"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Conecte-se com
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Mentores </span>
                que transformam carreiras
              </h1>
              <p className="text-xl text-muted-foreground">
                Encontre especialistas, agende sessões e acelere seu desenvolvimento profissional com o MentorMatch
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-hero border-0 hover:opacity-90 text-lg px-8"
                  onClick={() => navigate('/mentors')}
                >
                  Encontrar Mentores
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8"
                >
                  Como Funciona
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={heroImage} 
                  alt="Mentoria profissional" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">500+ Mentores</p>
                    <p className="text-sm text-muted-foreground">Especialistas disponíveis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-lg text-muted-foreground">Uma plataforma completa para sua jornada de mentoria</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Por que MentorMatch?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transforme sua carreira com orientação profissional personalizada
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8 bg-gradient-card border-0 shadow-md">
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="font-semibold text-xl mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground text-lg">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Encontre o mentor ideal e dê o próximo passo na sua carreira
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8"
            onClick={() => navigate('/mentors')}
          >
            Explorar Mentores
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 MentorMatch. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Home;
