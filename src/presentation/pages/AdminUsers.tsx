import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Edit, Shield, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useUsers } from '../hooks/useUsers';
import { User } from '@domain/entities/User.entity';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const { data: users = [], isLoading, error } = useUsers();

  // Função para formatar telefone
  const formatPhone = (phone?: string): string => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  // Função para formatar data
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Função para obter cor do badge de role
  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'MENTOR':
        return 'default';
      case 'USER':
      default:
        return 'secondary';
    }
  };

  // Filtrar usuários
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

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
    const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar usuários';
    const isAuthError = errorMessage.includes('não autenticado') || errorMessage.includes('Token não encontrado');
    
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="text-center py-16">
              <p className="text-lg text-destructive mb-4">
                {isAuthError ? 'Sessão expirada ou token não encontrado' : 'Erro ao carregar usuários'}
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
            <h1 className="text-4xl font-bold mb-4">Administração de Usuários</h1>
            <p className="text-lg text-muted-foreground">
              Gerencie todos os usuários da plataforma
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
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="role-filter" className="sr-only">Filtrar por role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger id="role-filter">
                    <SelectValue placeholder="Filtrar por role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="USER">Usuários</SelectItem>
                    <SelectItem value="ADMIN">Administradores</SelectItem>
                    <SelectItem value="MENTOR">Mentores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Tabela de Usuários */}
          <Card>
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nenhum usuário encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm || roleFilter !== 'ALL' 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Ainda não há usuários cadastrados na plataforma.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{formatPhone(user.phone)}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigate(`/admin/users/${user.id}/edit`);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>

          {/* Estatísticas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">{users.length}</div>
              <div className="text-sm text-muted-foreground">Total de Usuários</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">
                {users.filter(u => u.role === 'USER').length}
              </div>
              <div className="text-sm text-muted-foreground">Usuários</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">
                {users.filter(u => u.role === 'ADMIN').length}
              </div>
              <div className="text-sm text-muted-foreground">Administradores</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">
                {users.filter(u => u.role === 'MENTOR').length}
              </div>
              <div className="text-sm text-muted-foreground">Mentores</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
