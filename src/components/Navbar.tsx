import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, Users, LogOut, Search, Calendar, LayoutDashboard, GraduationCap, Home, Bot } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin, isMentor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout realizado com sucesso!");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="font-bold text-xl text-foreground">MentorMatch</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary font-medium"
            >
              Home
            </NavLink>
            <NavLink
              to="/mentors"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary font-medium"
            >
              Encontrar Mentores
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/minhas-sessoes"
                className="text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-primary font-medium"
              >
                Minhas Sessões
              </NavLink>
            )}
            {isAuthenticated && (isMentor || isAdmin) && (
              <NavLink
                to="/dashboard-mentor"
                className="text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-primary font-medium"
              >
                Dashboard Mentor
              </NavLink>
            )}
            <NavLink
              to="/testar-chatbot"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary font-medium"
            >
              Teste Chatbot
            </NavLink>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {getUserInitials()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{user?.name || "Usuário"}</span>
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name || "Usuário"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/");
                      setMobileMenuOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/mentors");
                      setMobileMenuOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    <span>Encontrar Mentores</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/minhas-sessoes");
                      setMobileMenuOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Minhas Sessões</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/minha-area");
                      setMobileMenuOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Minha Área</span>
                  </DropdownMenuItem>
                  {(isMentor || isAdmin) && (
                    <DropdownMenuItem
                      onClick={() => {
                        navigate("/dashboard-mentor");
                        setMobileMenuOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard Mentor</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/testar-chatbot");
                      setMobileMenuOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    <span>Teste Chatbot</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          navigate("/admin/users");
                          setMobileMenuOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <span>Gerenciar Usuários</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          navigate("/admin/mentors");
                          setMobileMenuOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <GraduationCap className="mr-2 h-4 w-4" />
                        <span>Gerenciar Mentores</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
                <Button variant="ghost" size="sm" asChild>
                  <NavLink to="/login">Entrar</NavLink>
                </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <NavLink
                to="/"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                activeClassName="text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/mentors"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                activeClassName="text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Encontrar Mentores
              </NavLink>
              {isAuthenticated && (
                <NavLink
                  to="/minhas-sessoes"
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  activeClassName="text-primary font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Minhas Sessões
                </NavLink>
              )}
              {isAuthenticated && (isMentor || isAdmin) && (
                <NavLink
                  to="/dashboard-mentor"
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  activeClassName="text-primary font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard Mentor
                </NavLink>
              )}
              <NavLink
                to="/testar-chatbot"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                activeClassName="text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Teste Chatbot
              </NavLink>
              {isAuthenticated ? (
                <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center space-x-3 px-2 py-2">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-foreground truncate">{user?.name || "Usuário"}</p>
                        {isAdmin && (
                          <Badge variant="secondary" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <>
                      <NavLink
                        to="/admin/users"
                        className="text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center"
                        activeClassName="text-primary font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Gerenciar Usuários
                      </NavLink>
                      <NavLink
                        to="/admin/mentors"
                        className="text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center"
                        activeClassName="text-primary font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Gerenciar Mentores
                      </NavLink>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-destructive hover:text-destructive/80 transition-colors py-2 flex items-center text-left"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4">
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <NavLink to="/login">Entrar</NavLink>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
