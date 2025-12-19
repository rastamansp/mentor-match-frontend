import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Star, DollarSign, Loader2, UserPlus } from 'lucide-react';
import { useMentors } from '../hooks/useMentors';
import { Mentor } from '@domain/entities/Mentor.entity';
import { MentorFiltersDto } from '@application/dto/MentorFiltersDto';

interface MentorSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMentor: (mentor: Mentor) => void;
  excludeMentorIds?: string[]; // IDs de mentores já associados para excluir da lista
  isLoading?: boolean;
}

const MentorSearchDialog: React.FC<MentorSearchDialogProps> = ({
  open,
  onOpenChange,
  onSelectMentor,
  excludeMentorIds = [],
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Monta filtros para a busca
  const filters: MentorFiltersDto | undefined = useMemo(() => {
    const filterObj: MentorFiltersDto = {};
    
    if (searchTerm.trim()) {
      filterObj.searchTerm = searchTerm.trim();
    }
    
    if (selectedArea) {
      filterObj.area = selectedArea;
    }
    
    if (maxPrice) {
      const price = parseFloat(maxPrice);
      if (!isNaN(price) && price > 0) {
        filterObj.maxPrice = price;
      }
    }
    
    return Object.keys(filterObj).length > 0 ? filterObj : undefined;
  }, [searchTerm, selectedArea, maxPrice]);

  const { data: mentors = [], isLoading: isLoadingMentors } = useMentors(filters);

  // Filtra mentores excluindo os já associados
  const filteredMentors = useMemo(() => {
    return mentors.filter(mentor => !excludeMentorIds.includes(mentor.id));
  }, [mentors, excludeMentorIds]);

  const handleSelectMentor = (mentor: Mentor) => {
    onSelectMentor(mentor);
    // Não fecha o dialog automaticamente para permitir associar múltiplos
  };

  // Extrai áreas únicas dos mentores para o filtro
  const availableAreas = useMemo(() => {
    const areasSet = new Set<string>();
    mentors.forEach(mentor => {
      mentor.areas?.forEach(area => areasSet.add(area));
    });
    return Array.from(areasSet).sort();
  }, [mentors]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buscar e Associar Mentor</DialogTitle>
          <DialogDescription>
            Busque mentores disponíveis e associe ao usuário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de Busca e Filtros */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por nome, especialidade, empresa ou área..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Todas as áreas</option>
                {availableAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>

              <Input
                type="number"
                placeholder="Preço máximo (R$)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-40"
                min="0"
              />
            </div>
          </div>

          {/* Lista de Mentores */}
          {isLoadingMentors ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMentors.length === 0 ? (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum mentor encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedArea || maxPrice
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Não há mentores disponíveis no momento.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`}
                        alt={mentor.name}
                        className="w-16 h-16 rounded-full bg-gradient-hero object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1">{mentor.name}</h3>
                        {mentor.specialty && (
                          <p className="text-sm text-muted-foreground mb-2">{mentor.specialty}</p>
                        )}
                        {mentor.company && (
                          <p className="text-xs text-muted-foreground mb-2">{mentor.company}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {mentor.areas?.slice(0, 3).map((area) => (
                            <Badge key={area} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                          {mentor.areas && mentor.areas.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{mentor.areas.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {mentor.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{mentor.rating.toFixed(1)}</span>
                              {mentor.reviews && (
                                <span className="ml-1">({mentor.reviews})</span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>R$ {mentor.pricePerHour}/h</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSelectMentor(mentor)}
                      disabled={isLoading}
                      size="sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Associando...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Associar
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MentorSearchDialog;
