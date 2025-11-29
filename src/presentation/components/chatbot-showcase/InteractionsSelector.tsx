import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInteractions } from "@/presentation/hooks/useInteractions";

interface Journey {
  name: string;
  description?: string;
  messages: Array<{ from: "user" | "concierge"; text: string }>;
}

interface InteractionsSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectJourney: (journey: Journey) => void;
}

export const InteractionsSelector = ({
  open,
  onOpenChange,
  onSelectJourney,
}: InteractionsSelectorProps) => {
  const { journeys } = useInteractions();

  const handleJourneyClick = (journey: Journey) => {
    onSelectJourney(journey);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Jornadas de Conversação</DialogTitle>
          <DialogDescription>
            Selecione uma jornada para visualizar no chat. Cada jornada representa um cenário diferente de uso do MentorMatch.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {journeys.map((journey, index) => (
            <button
              key={index}
              onClick={() => handleJourneyClick(journey)}
              className="group relative p-6 bg-card border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all duration-300 text-left hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {journey.name}
                </h3>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  {journey.messages.length} mensagens
                </span>
              </div>
              
              {journey.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {journey.description}
                </p>
              )}
              
              <div className="flex items-center text-xs text-primary font-medium mt-4">
                <span>Visualizar jornada</span>
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

