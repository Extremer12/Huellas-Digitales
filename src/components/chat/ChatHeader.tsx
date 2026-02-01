import { X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatHeaderProps {
  userName: string;
  animalName: string;
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
}

const ChatHeader = ({
  userName,
  animalName,
  isMinimized,
  onMinimize,
  onClose,
}: ChatHeaderProps) => {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-xl">
      <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
        <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{userName}</h3>
        <p className="text-xs opacity-80 truncate">
          Sobre {animalName}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMinimize}
          className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
        >
          {isMinimized ? (
            <Maximize2 className="w-4 h-4" />
          ) : (
            <Minimize2 className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
