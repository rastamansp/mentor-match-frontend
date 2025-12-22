import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { container } from '@/shared/di/container';

const AdminRegisterUser = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Função para aplicar máscara de telefone brasileiro
  const applyPhoneMask = (value: string): string => {
    // Remove tudo que não é número
    const cleaned = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    if (cleaned.length > 11) {
      return phone;
    }
    
    // Aplica máscara: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (cleaned.length <= 10) {
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyPhoneMask(e.target.value);
    setPhone(masked);
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyPhoneMask(e.target.value);
    setWhatsappNumber(masked);
  };

  // Remove máscara antes de enviar
  const getCleanPhone = (): string => {
    return phone.replace(/\D/g, '');
  };

  const getCleanWhatsapp = (): string => {
    const cleaned = whatsappNumber.replace(/\D/g, '');
    // Adiciona prefixo 55 se não começar com 55
    if (cleaned && !cleaned.startsWith('55')) {
      return `55${cleaned}`;
    }
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await container.registerWithRoleUseCase.execute({
        name,
        email,
        password,
        phone: getCleanPhone(),
        whatsappNumber: getCleanWhatsapp(),
      });
      toast.success('Usuário cadastrado com sucesso! O usuário receberá 5 mensagens de boas-vindas via WhatsApp.');
      // Redirecionar para a lista de usuários após sucesso
      navigate('/admin/users');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cadastrar usuário';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Cadastrar Novo Usuário</h1>
              <p className="text-muted-foreground">
                Preencha os dados para cadastrar um novo usuário no sistema
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nome completo do usuário"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                  required
                  disabled={loading}
                  minLength={3}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 98722-1050"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="mt-2"
                  required
                  disabled={loading}
                  minLength={14}
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Digite apenas números (10 ou 11 dígitos)
                </p>
              </div>

              <div>
                <Label htmlFor="whatsappNumber">WhatsApp</Label>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  placeholder="(11) 98722-1050"
                  value={whatsappNumber}
                  onChange={handleWhatsappChange}
                  className="mt-2"
                  required
                  disabled={loading}
                  minLength={14}
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Digite apenas números (10 ou 11 dígitos)
                </p>
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full"
                disabled={loading}
              >
                Voltar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterUser;
