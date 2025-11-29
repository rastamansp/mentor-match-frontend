import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <Card>
            <CardHeader>
              <CardTitle>Erro</CardTitle>
              <CardDescription>Usuário não encontrado</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const getUserInitials = () => {
    if (!user.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case "ADMIN":
        return "Administrador";
      case "MENTOR":
        return "Mentor";
      case "USER":
        return "Usuário";
      default:
        return "Usuário";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>Gerencie suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold">
                  {getUserInitials()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                  <p className="text-muted-foreground">{getRoleLabel()}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Conta</p>
                    <p className="text-foreground font-medium">{getRoleLabel()}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">Editar Perfil</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;

