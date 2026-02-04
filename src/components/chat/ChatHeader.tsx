import { X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatHeaderProps {
  userName: string;
  animalName: string;
  avatar?: string;
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
}

const ChatHeader = ({
  userName,
  animalName,
  avatar,
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
    <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-[2rem]">
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 border-2 border-primary-foreground/20 shadow-sm">
          <AvatarImage src={avatar} className="object-cover" />
          <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-primary rounded-full shadow-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold truncate text-[15px] leading-tight">{userName}</h3>
        <p className="text-[11px] opacity-90 truncate font-medium flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 bg-primary-foreground/30 rounded-full" />
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
