import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, Calendar, Loader2, Users, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useMentors } from '../hooks/useMentors';
import { Mentor } from '@domain/entities/Mentor.entity';

const AdminMentors = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: mentors = [], isLoading, error } = useMentors();

  // Função para formatar data
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Filtrar mentores
  const filteredMentors = useMemo(() => {
    return mentors.filter(mentor => {
      const matchesSearch = 
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mentor.specialty && mentor.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }, [mentors, searchTerm]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar mentores';
    const isAuthError = errorMessage.includes('não autenticado') || errorMessage.includes('Token não encontrado');
    
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="text-center py-16">
              <p className="text-lg text-destructive mb-4">
                {isAuthError ? 'Sessão expirada ou token não encontrado' : 'Erro ao carregar mentores'}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {isAuthError ? 'Por favor, faça login novamente para continuar.' : errorMessage}
              </p>
              {isAuthError ? (
                <Button onClick={() => window.location.href = '/login'}>
                  Ir para Login
                </Button>
              ) : (
                <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Administração de Mentores</h1>
            <p className="text-lg text-muted-foreground">
              Gerencie disponibilidades de agendamento dos mentores
            </p>
          </div>

          {/* Filtros e Busca */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Buscar por nome, email ou especialidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Tabela de Mentores */}
          <Card>
            {filteredMentors.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nenhum mentor encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Ainda não há mentores cadastrados na plataforma.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMentors.map((mentor) => (
                      <TableRow key={mentor.id}>
                        <TableCell className="font-medium">{mentor.name}</TableCell>
                        <TableCell>{mentor.email}</TableCell>
                        <TableCell>{mentor.specialty || '-'}</TableCell>
                        <TableCell>{mentor.company || '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            mentor.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {mentor.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigate(`/admin/mentors/${mentor.id}/edit`);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigate(`/admin/mentors/${mentor.id}/availability`);
                              }}
                            >
                              <Calendar className="w-4 h-4 mr-1" />
                              Disponibilidade
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>

          {/* Estatísticas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">{mentors.length}</div>
              <div className="text-sm text-muted-foreground">Total de Mentores</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">
                {mentors.filter(m => m.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-muted-foreground">Mentores Ativos</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">
                {mentors.filter(m => m.status !== 'ACTIVE').length}
              </div>
              <div className="text-sm text-muted-foreground">Mentores Inativos</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMentors;
