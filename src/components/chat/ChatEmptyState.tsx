import { MessageCircle, Shield } from "lucide-react";

interface ChatEmptyStateProps {
  animalName: string;
}

const ChatEmptyState = ({ animalName }: ChatEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <MessageCircle className="w-8 h-8 text-primary" />
      </div>
      <h4 className="font-semibold text-lg mb-2">¡Inicia la conversación!</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Pregunta sobre {animalName} y coordina los detalles de la adopción
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-full">
        <Shield className="w-3.5 h-3.5" />
        <span>Chat seguro y privado</span>
      </div>
    </div>
  );
};

export default ChatEmptyState;
