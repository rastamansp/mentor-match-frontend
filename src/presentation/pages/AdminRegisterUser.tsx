import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { container } from '@/shared/di/container';
import { User, Mail, Phone, MessageSquare, Lock, ArrowLeft, UserPlus } from 'lucide-react';

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
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-2">Cadastrar Novo Usuário</h1>
              <p className="text-lg text-muted-foreground">
                Preencha os dados para cadastrar um novo usuário no sistema
              </p>
            </div>
          </div>

          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informações Básicas */}
              <div>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Informações Básicas
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-base font-medium">
                      Nome Completo <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Nome completo do usuário"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11"
                        required
                        disabled={loading}
                        minLength={3}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base font-medium">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Informações de Contato
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone" className="text-base font-medium">
                      Telefone <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(11) 98722-1050"
                        value={phone}
                        onChange={handlePhoneChange}
                        className="pl-10 h-11"
                        required
                        disabled={loading}
                        minLength={14}
                        maxLength={15}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Digite apenas números (10 ou 11 dígitos)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="whatsappNumber" className="text-base font-medium">
                      WhatsApp <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-2">
                      <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="whatsappNumber"
                        type="tel"
                        placeholder="(11) 98722-1050"
                        value={whatsappNumber}
                        onChange={handleWhatsappChange}
                        className="pl-10 h-11"
                        required
                        disabled={loading}
                        minLength={14}
                        maxLength={15}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Digite apenas números (10 ou 11 dígitos)
                    </p>
                  </div>
                </div>
              </div>

              {/* Segurança */}
              <div>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Segurança
                </h2>
                <div>
                  <Label htmlFor="password" className="text-base font-medium">
                    Senha <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    A senha deve ter no mínimo 6 caracteres
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1 h-11"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-gradient-hero border-0 hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Cadastrar Usuário
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterUser;
