import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="font-bold text-xl text-foreground">Mentor Match</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/mentors"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary font-medium"
            >
              Encontrar Mentores
            </NavLink>
            <NavLink
              to="/minhas-sessoes"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary font-medium"
            >
              Minhas Sessões
            </NavLink>
            <NavLink
              to="/dashboard-mentor"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary font-medium"
            >
              Dashboard Mentor
            </NavLink>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">Entrar</Button>
            <Button size="sm" className="bg-gradient-hero border-0 hover:opacity-90">
              Cadastrar
            </Button>
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
                to="/mentors"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                activeClassName="text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Encontrar Mentores
              </NavLink>
              <NavLink
                to="/minhas-sessoes"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                activeClassName="text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Minhas Sessões
              </NavLink>
              <NavLink
                to="/dashboard-mentor"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                activeClassName="text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard Mentor
              </NavLink>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" size="sm" className="w-full">Entrar</Button>
                <Button size="sm" className="w-full bg-gradient-hero border-0 hover:opacity-90">
                  Cadastrar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
