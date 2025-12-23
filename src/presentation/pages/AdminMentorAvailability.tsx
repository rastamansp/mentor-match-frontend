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
import { Loader2, ArrowLeft, Calendar, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { useMentorById } from '../hooks/useMentorById';
import { useMentorAvailability } from '../hooks/useMentorAvailability';
import { useCreateAvailability } from '../hooks/useCreateAvailability';
import { useUpdateAvailability } from '../hooks/useUpdateAvailability';
import { useDeleteAvailability } from '../hooks/useDeleteAvailability';
import { useAuth } from '@/contexts/AuthContext';
import { Availability } from '@domain/entities/Availability.entity';
import { CreateAvailabilityDto } from '@application/dto/CreateAvailabilityDto';
import { UpdateAvailabilityDto } from '@application/dto/UpdateAvailabilityDto';
import { getDayName, DAYS_OF_WEEK } from '@/shared/constants/daysOfWeek';

const AdminMentorAvailability = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [deleteAvailabilityId, setDeleteAvailabilityId] = useState<string | null>(null);

  // Form states
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  const [timezone, setTimezone] = useState<string>('America/Sao_Paulo');
  const [isActive, setIsActive] = useState<boolean>(true);

  // Fetch mentor and availability
  const { data: mentor, isLoading: isLoadingMentor, error: mentorError } = useMentorById(id || '');
  const { data: availabilities = [], isLoading: isLoadingAvailability } = useMentorAvailability(id || '');
  const createAvailability = useCreateAvailability(id || '');
  const updateAvailability = useUpdateAvailability(id || '');
  const deleteAvailability = useDeleteAvailability(id || '');

  // Verificar permissões
  useEffect(() => {
    if (id && user) {
      // Admin pode acessar qualquer mentor
      // Mentor só pode acessar próprio
      // Nota: A validação real de permissão é feita no backend
      // Aqui apenas verificamos se é admin (pode acessar qualquer mentor)
      // Se não for admin, permitimos acesso mas o backend vai validar se é o próprio mentor
      const canAccess = isAdmin || true; // Permitir acesso - backend valida permissão
      setHasPermission(canAccess);
    } else if (!user) {
      setHasPermission(false);
    }
  }, [id, user, isAdmin]);

  // Reset form
  const resetForm = () => {
    setDayOfWeek(1);
    setStartTime('09:00');
    setEndTime('18:00');
    setTimezone('America/Sao_Paulo');
    setIsActive(true);
    setSelectedAvailability(null);
  };

  // Open create dialog
  const handleOpenCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEdit = (availability: Availability) => {
    setSelectedAvailability(availability);
    setDayOfWeek(availability.dayOfWeek);
    setStartTime(availability.startTime.substring(0, 5)); // Remove seconds if present
    setEndTime(availability.endTime.substring(0, 5));
    setTimezone(availability.timezone);
    setIsActive(availability.isActive);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const handleOpenDelete = (availabilityId: string) => {
    setDeleteAvailabilityId(availabilityId);
    setIsDeleteDialogOpen(true);
  };

  // Handle create
  const handleCreate = async () => {
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
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar disponibilidade';
      toast.error(message);
    }
  };

  // Handle update
  const handleUpdate = async () => {
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
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar disponibilidade';
      toast.error(message);
    }
  };

  // Handle delete
  const handleDelete = async () => {
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
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/mentors')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-4xl font-bold mb-2">Gerenciar Disponibilidades</h1>
            <p className="text-lg text-muted-foreground">
              Mentor: <span className="font-semibold">{mentor.name}</span>
            </p>
          </div>

          {/* Disponibilidades */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Disponibilidades</h2>
              <Button onClick={handleOpenCreate}>
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
                          onClick={() => handleOpenEdit(availability)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDelete(availability.id)}
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

      {/* Create Dialog */}
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
              onClick={handleCreate}
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

      {/* Edit Dialog */}
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
              onClick={handleUpdate}
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

      {/* Delete Dialog */}
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
              onClick={handleDelete}
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

export default AdminMentorAvailability;
