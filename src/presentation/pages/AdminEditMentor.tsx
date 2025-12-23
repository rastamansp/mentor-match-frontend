import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Loader2, ArrowLeft, Save, Calendar, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { useMentorById } from '../hooks/useMentorById';
import { useUpdateMentor } from '../hooks/useUpdateMentor';
import { useMentorAvailability } from '../hooks/useMentorAvailability';
import { useCreateAvailability } from '../hooks/useCreateAvailability';
import { useUpdateAvailability } from '../hooks/useUpdateAvailability';
import { useDeleteAvailability } from '../hooks/useDeleteAvailability';
import { useAuth } from '@/contexts/AuthContext';
import { Mentor } from '@domain/entities/Mentor.entity';
import { UpdateMentorDto } from '@application/dto/UpdateMentorDto';
import { Availability } from '@domain/entities/Availability.entity';
import { CreateAvailabilityDto } from '@application/dto/CreateAvailabilityDto';
import { UpdateAvailabilityDto } from '@application/dto/UpdateAvailabilityDto';
import { getDayName, DAYS_OF_WEEK } from '@/shared/constants/daysOfWeek';

const AdminEditMentor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const { data: mentor, isLoading: isLoadingMentor, error: mentorError } = useMentorById(id || '');
  const updateMentor = useUpdateMentor();
  const [hasPermission, setHasPermission] = useState(false);
  
  // Availability states
  const { data: availabilities = [], isLoading: isLoadingAvailability } = useMentorAvailability(id || '');
  const createAvailability = useCreateAvailability(id || '');
  const updateAvailability = useUpdateAvailability(id || '');
  const deleteAvailability = useDeleteAvailability(id || '');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [deleteAvailabilityId, setDeleteAvailabilityId] = useState<string | null>(null);
  
  // Availability form states
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  const [timezone, setTimezone] = useState<string>('America/Sao_Paulo');
  const [isActive, setIsActive] = useState<boolean>(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('');
  const [company, setCompany] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState('');
  const [pricePerHour, setPricePerHour] = useState<number>(0);
  const [status, setStatus] = useState<string>('ACTIVE');

  // Verificar permissões
  useEffect(() => {
    if (id && user && mentor) {
      // Admin pode acessar qualquer mentor
      // Mentor só pode acessar próprio (verifica se o email do mentor corresponde ao email do usuário)
      const canAccess = isAdmin || (user.email && mentor.email && user.email.toLowerCase() === mentor.email.toLowerCase());
      setHasPermission(canAccess);
      
      if (!canAccess) {
        toast.error('Você não tem permissão para editar este mentor.');
        navigate(isAdmin ? '/admin/mentors' : '/');
      }
    } else if (!user) {
      setHasPermission(false);
    }
  }, [id, user, mentor, isAdmin, navigate]);

  // Carregar dados do mentor
  useEffect(() => {
    if (mentor) {
      setName(mentor.name || '');
      setEmail(mentor.email || '');
      setRole(mentor.role || '');
      setCompany(mentor.company || '');
      setSpecialty(mentor.specialty || '');
      setPhone(mentor.phone || '');
      setWhatsappNumber(mentor.whatsappNumber || '');
      setBio(mentor.bio || '');
      setLocation(mentor.location || '');
      setAvatar(mentor.avatar || '');
      setPricePerHour(mentor.pricePerHour || 0);
      setStatus(mentor.status || 'ACTIVE');
    }
  }, [mentor]);

  // Função para aplicar máscara de telefone brasileiro
  const applyPhoneMask = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 11) {
      return phone;
    }
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
    const cleaned = e.target.value.replace(/\D/g, '');
    setWhatsappNumber(cleaned);
  };

  // Remove máscara antes de enviar
  const getCleanPhone = (): string => {
    return phone.replace(/\D/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const dto: UpdateMentorDto = {
        name: name || undefined,
        email: email || undefined,
        role: role || null,
        company: company || null,
        specialty: specialty || null,
        phone: getCleanPhone() || null,
        whatsappNumber: whatsappNumber || null,
        bio: bio || null,
        location: location || null,
        avatar: avatar || null,
        pricePerHour: pricePerHour > 0 ? pricePerHour : undefined,
        status: status || undefined,
      };

      await updateMentor.mutateAsync({ id, dto });
      toast.success('Mentor atualizado com sucesso!');
      // Se for mentor (não admin), não redireciona para /admin/mentors
      if (isAdmin) {
        navigate('/admin/mentors');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar mentor';
      toast.error(message);
    }
  };

  // Reset availability form
  const resetAvailabilityForm = () => {
    setDayOfWeek(1);
    setStartTime('09:00');
    setEndTime('18:00');
    setTimezone('America/Sao_Paulo');
    setIsActive(true);
    setSelectedAvailability(null);
  };

  // Open create availability dialog
  const handleOpenCreateAvailability = () => {
    resetAvailabilityForm();
    setIsCreateDialogOpen(true);
  };

  // Open edit availability dialog
  const handleOpenEditAvailability = (availability: Availability) => {
    setSelectedAvailability(availability);
    setDayOfWeek(availability.dayOfWeek);
    setStartTime(availability.startTime.substring(0, 5));
    setEndTime(availability.endTime.substring(0, 5));
    setTimezone(availability.timezone);
    setIsActive(availability.isActive);
    setIsEditDialogOpen(true);
  };

  // Open delete availability dialog
  const handleOpenDeleteAvailability = (availabilityId: string) => {
    setDeleteAvailabilityId(availabilityId);
    setIsDeleteDialogOpen(true);
  };

  // Handle create availability
  const handleCreateAvailability = async () => {
    try {
      const dto: CreateAvailabilityDto = {
        dayOfWeek,
        startTime,
        endTime,
        timezone,
        isActive,
      };
      await createAvailability.mutateAsync(dto);
      toast.success('Disponibilidade criada com sucesso!');
      setIsCreateDialogOpen(false);
      resetAvailabilityForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar disponibilidade';
      toast.error(message);
    }
  };

  // Handle update availability
  const handleUpdateAvailability = async () => {
    if (!selectedAvailability) return;
    
    try {
      const dto: UpdateAvailabilityDto = {
        dayOfWeek,
        startTime,
        endTime,
        timezone,
        isActive,
      };
      await updateAvailability.mutateAsync({
        availabilityId: selectedAvailability.id,
        dto,
      });
      toast.success('Disponibilidade atualizada com sucesso!');
      setIsEditDialogOpen(false);
      resetAvailabilityForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar disponibilidade';
      toast.error(message);
    }
  };

  // Handle delete availability
  const handleDeleteAvailability = async () => {
    if (!deleteAvailabilityId) return;
    
    try {
      await deleteAvailability.mutateAsync(deleteAvailabilityId);
      toast.success('Disponibilidade deletada com sucesso!');
      setIsDeleteDialogOpen(false);
      setDeleteAvailabilityId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar disponibilidade';
      toast.error(message);
    }
  };

  if (isLoadingMentor || !hasPermission) {
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

  if (mentorError || !mentor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="text-center py-16">
              <p className="text-lg text-destructive mb-4">Mentor não encontrado</p>
              <Button onClick={() => navigate('/admin/mentors')}>
                Voltar para Lista de Mentores
              </Button>
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
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => {
                if (isAdmin) {
                  navigate('/admin/mentors');
                } else {
                  navigate('/dashboard-mentor');
                }
              }}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-4xl font-bold mb-2">
              {isAdmin ? 'Editar Mentor' : 'Meu Perfil'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isAdmin 
                ? 'Atualize as informações do mentor' 
                : 'Gerencie suas informações e disponibilidades'}
            </p>
          </div>

          {/* Informações do Mentor */}
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-6">Informações do Mentor</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Cargo</Label>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Ex: Design Director"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ex: Nubank"
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Ex: UX/UI Design"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 98765-4321"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsappNumber">WhatsApp</Label>
                  <Input
                    id="whatsappNumber"
                    value={whatsappNumber}
                    onChange={handleWhatsappChange}
                    placeholder="11987654321"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerHour">Preço por Hora (R$)</Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Ativo</SelectItem>
                      <SelectItem value="INACTIVE">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="avatar">Avatar (URL)</Label>
                  <Input
                    id="avatar"
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Biografia</Label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 text-sm border border-input bg-background rounded-md"
                  placeholder="Descrição sobre o mentor..."
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isAdmin) {
                      navigate('/admin/mentors');
                    } else {
                      navigate('/dashboard-mentor');
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateMentor.isPending}
                >
                  {updateMentor.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Disponibilidades */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Disponibilidades</h2>
              <Button onClick={handleOpenCreateAvailability}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Disponibilidade
              </Button>
            </div>

            {isLoadingAvailability ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : availabilities.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma disponibilidade cadastrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availabilities.map((availability) => (
                  <Card key={availability.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {getDayName(availability.dayOfWeek)}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            availability.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {availability.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{availability.startTime.substring(0, 5)} - {availability.endTime.substring(0, 5)}</span>
                          </div>
                          <span>Timezone: {availability.timezone}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditAvailability(availability)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDeleteAvailability(availability.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Create Availability Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Disponibilidade</DialogTitle>
            <DialogDescription>
              Defina os horários de disponibilidade para este mentor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dayOfWeek">Dia da Semana</Label>
              <Select value={dayOfWeek.toString()} onValueChange={(v) => setDayOfWeek(Number(v))}>
                <SelectTrigger id="dayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DAYS_OF_WEEK).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Horário de Início</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Horário de Fim</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="America/Sao_Paulo"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isActive">Disponibilidade ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateAvailability}
              disabled={createAvailability.isPending}
            >
              {createAvailability.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Availability Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Disponibilidade</DialogTitle>
            <DialogDescription>
              Atualize os horários de disponibilidade
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editDayOfWeek">Dia da Semana</Label>
              <Select value={dayOfWeek.toString()} onValueChange={(v) => setDayOfWeek(Number(v))}>
                <SelectTrigger id="editDayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DAYS_OF_WEEK).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStartTime">Horário de Início</Label>
                <Input
                  id="editStartTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="editEndTime">Horário de Fim</Label>
                <Input
                  id="editEndTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editTimezone">Timezone</Label>
              <Input
                id="editTimezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="America/Sao_Paulo"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="editIsActive">Disponibilidade ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateAvailability}
              disabled={updateAvailability.isPending}
            >
              {updateAvailability.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Availability Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta disponibilidade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAvailability}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAvailability.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Deletar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEditMentor;
