import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, Users, TrendingUp, Clock, Edit } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { toast } from "sonner";

const MentorDashboard = () => {
  const [bio, setBio] = useState("Com mais de 10 anos de experiência em Product Management...");
  const [price, setPrice] = useState("200");
  const [specialty, setSpecialty] = useState("Product Management");

  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      label: "Total de Mentorados",
      value: "127",
      change: "+12 este mês"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: "Sessões Realizadas",
      value: "156",
      change: "+8 esta semana"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: "Receita Total",
      value: "R$ 31.200",
      change: "+R$ 1.600 este mês"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: "Avaliação Média",
      value: "4.9",
      change: "156 avaliações"
    }
  ];

  const upcomingSessions = [
    {
      id: 1,
      mentee: "João Silva",
      topic: "Product Strategy",
      date: "2025-11-25",
      time: "14:00",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao"
    },
    {
      id: 2,
      mentee: "Maria Santos",
      topic: "Career Transition",
      date: "2025-11-26",
      time: "16:00",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
    },
    {
      id: 3,
      mentee: "Pedro Costa",
      topic: "Interview Prep",
      date: "2025-11-27",
      time: "10:00",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro"
    }
  ];

  const availability = [
    { day: "Segunda", slots: ["18:00 - 21:00"] },
    { day: "Terça", slots: [] },
    { day: "Quarta", slots: ["18:00 - 21:00"] },
    { day: "Quinta", slots: [] },
    { day: "Sexta", slots: [] },
    { day: "Sábado", slots: ["09:00 - 12:00"] },
    { day: "Domingo", slots: [] }
  ];

  const handleSaveProfile = () => {
    toast.success("Perfil atualizado com sucesso!");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard do Mentor</h1>
            <p className="text-lg text-muted-foreground">
              Gerencie seu perfil, horários e acompanhe suas mentorias
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-accent">{stat.change}</p>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="sessions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="sessions">Próximas Sessões</TabsTrigger>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
            </TabsList>

            {/* Upcoming Sessions Tab */}
            <TabsContent value="sessions" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6">Sessões Agendadas</h3>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={session.avatar}
                          alt={session.mentee}
                          className="w-12 h-12 rounded-full bg-gradient-hero"
                        />
                        <div>
                          <h4 className="font-semibold">{session.mentee}</h4>
                          <p className="text-sm text-muted-foreground">{session.topic}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatDate(session.date)}</p>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{session.time}</span>
                          </div>
                        </div>
                        <Button size="sm">Ver Detalhes</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Edit className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Editar Perfil</h3>
                </div>
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <Label htmlFor="specialty">Especialidade Principal</Label>
                    <Input
                      id="specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="mt-2 min-h-32"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Descreva sua experiência e como você pode ajudar seus mentorados
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="price">Valor por Sessão (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Sessões de 1 hora
                    </p>
                  </div>

                  <div>
                    <Label>Habilidades</Label>
                    <div className="flex flex-wrap gap-2 mt-2 p-4 border border-border rounded-lg">
                      <Badge>Product Strategy</Badge>
                      <Badge>Agile</Badge>
                      <Badge>User Research</Badge>
                      <Badge>Roadmap Planning</Badge>
                      <Button variant="outline" size="sm" className="ml-2">
                        + Adicionar
                      </Button>
                    </div>
                  </div>

                  <Button 
                    className="bg-gradient-hero border-0 hover:opacity-90"
                    onClick={handleSaveProfile}
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Gerenciar Disponibilidade</h3>
                </div>
                <div className="space-y-4 max-w-2xl">
                  {availability.map((day, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{day.day}</p>
                        {day.slots.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {day.slots.map((slot, slotIndex) => (
                              <Badge key={slotIndex} variant="secondary">
                                {slot}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">Indisponível</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button className="bg-gradient-hero border-0 hover:opacity-90">
                    Salvar Horários
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
