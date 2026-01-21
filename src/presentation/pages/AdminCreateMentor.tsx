import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Loader2, ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useCreateMentor } from '../hooks/useCreateMentor';
import { CreateMentorDto } from '@application/dto/CreateMentorDto';

const AdminCreateMentor = () => {
  const navigate = useNavigate();
  const createMentor = useCreateMentor();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState('');
  const [pricePerHour, setPricePerHour] = useState<number>(0);
  const [status, setStatus] = useState<string>('ACTIVE');
  
  // Arrays
  const [areas, setAreas] = useState<string[]>([]);
  const [newArea, setNewArea] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [languages, setLanguages] = useState<string[]>(['pt-BR']);
  const [newLanguage, setNewLanguage] = useState('');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState('');
  const [experience, setExperience] = useState<Array<{
    title: string;
    company: string;
    period: string;
    description: string;
  }>>([]);
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    period: '',
    description: '',
  });

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

  const handleAddArea = () => {
    if (newArea.trim() && !areas.includes(newArea.trim())) {
      setAreas([...areas, newArea.trim()]);
      setNewArea('');
    }
  };

  const handleRemoveArea = (area: string) => {
    setAreas(areas.filter(a => a !== area));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (language: string) => {
    setLanguages(languages.filter(l => l !== language));
  };

  const handleAddAchievement = () => {
    if (newAchievement.trim() && !achievements.includes(newAchievement.trim())) {
      setAchievements([...achievements, newAchievement.trim()]);
      setNewAchievement('');
    }
  };

  const handleRemoveAchievement = (achievement: string) => {
    setAchievements(achievements.filter(a => a !== achievement));
  };

  const handleAddExperience = () => {
    if (newExperience.title.trim() && newExperience.company.trim() && newExperience.period.trim()) {
      setExperience([...experience, { ...newExperience }]);
      setNewExperience({ title: '', company: '', period: '', description: '' });
    }
  };

  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    try {
      const dto: CreateMentorDto = {
        name: name.trim(),
        email: email.trim(),
        role: role.trim() || null,
        company: company.trim() || null,
        specialty: specialty.trim() || null,
        phone: getCleanPhone() || null,
        whatsappNumber: whatsappNumber || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        avatar: avatar.trim() || null,
        areas: areas.length > 0 ? areas : null,
        skills: skills.length > 0 ? skills : null,
        languages: languages.length > 0 ? languages : ['pt-BR'],
        achievements: achievements.length > 0 ? achievements : null,
        experience: experience.length > 0 ? experience : null,
        pricePerHour: pricePerHour > 0 ? pricePerHour : undefined,
        status: status || 'ACTIVE',
      };

      const createdMentor = await createMentor.mutateAsync(dto);
      toast.success('Mentor criado com sucesso!');
      navigate(`/admin/mentors/${createdMentor.id}/edit`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar mentor';
      toast.error(message);
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
              onClick={() => navigate('/admin/mentors')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-4xl font-bold mb-2">Criar Novo Mentor</h1>
            <p className="text-lg text-muted-foreground">
              Preencha as informações do novo mentor
            </p>
          </div>

          {/* Form */}
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
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-[100px]"
                  placeholder="Descrição sobre o mentor..."
                />
              </div>

              {/* Areas */}
              <div>
                <Label>Áreas de Atuação</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArea())}
                    placeholder="Adicionar área..."
                  />
                  <Button type="button" onClick={handleAddArea} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {areas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {areas.map((area) => (
                      <div key={area} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
                        <span className="text-sm">{area}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveArea(area)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills */}
              <div>
                <Label>Skills</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Adicionar skill..."
                  />
                  <Button type="button" onClick={handleAddSkill} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <div key={skill} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
                        <span className="text-sm">{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Languages */}
              <div>
                <Label>Idiomas</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                    placeholder="Adicionar idioma..."
                  />
                  <Button type="button" onClick={handleAddLanguage} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {languages.map((language) => (
                      <div key={language} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
                        <span className="text-sm">{language}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(language)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div>
                <Label>Conquistas</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())}
                    placeholder="Adicionar conquista..."
                  />
                  <Button type="button" onClick={handleAddAchievement} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {achievements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {achievements.map((achievement) => (
                      <div key={achievement} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
                        <span className="text-sm">{achievement}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAchievement(achievement)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div>
                <Label>Experiência Profissional</Label>
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="exp-title">Título</Label>
                      <Input
                        id="exp-title"
                        value={newExperience.title}
                        onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                        placeholder="Ex: Senior Software Engineer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exp-company">Empresa</Label>
                      <Input
                        id="exp-company"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                        placeholder="Ex: Tech Corp"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exp-period">Período</Label>
                      <Input
                        id="exp-period"
                        value={newExperience.period}
                        onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                        placeholder="Ex: 2020 - Presente"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exp-description">Descrição</Label>
                      <Input
                        id="exp-description"
                        value={newExperience.description}
                        onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                        placeholder="Descrição da experiência..."
                      />
                    </div>
                  </div>
                  <Button type="button" onClick={handleAddExperience} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Experiência
                  </Button>
                  {experience.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {experience.map((exp, index) => (
                        <div key={index} className="p-3 border rounded-md flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">{exp.title} - {exp.company}</p>
                            <p className="text-sm text-muted-foreground">{exp.period}</p>
                            {exp.description && (
                              <p className="text-sm mt-1">{exp.description}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExperience(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/mentors')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMentor.isPending}
                  className="bg-gradient-hero border-0 hover:opacity-90"
                >
                  {createMentor.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Criar Mentor
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

export default AdminCreateMentor;
