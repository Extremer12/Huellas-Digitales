import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  isRead?: boolean;
}

const ChatMessage = ({ content, timestamp, isOwn, isRead }: ChatMessageProps) => {
  return (
    <div className={cn("flex w-full mb-3 px-1 animate-in fade-in slide-in-from-bottom-2", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] px-4 py-2.5 shadow-sm text-sm relative group transition-all",
          isOwn
            ? "bg-primary text-primary-foreground rounded-[1.25rem] rounded-tr-none shadow-primary/10"
            : "bg-muted/80 backdrop-blur-sm text-foreground rounded-[1.25rem] rounded-tl-none border border-border/40 shadow-slate-200"
        )}
      >
        <p className="break-words whitespace-pre-wrap leading-snug pb-3 text-[14.5px] font-medium tracking-tight">
          {content}
        </p>
        <div
          className={cn(
            "absolute bottom-1.5 right-2.5 flex items-center gap-1.5",
            isOwn ? "text-[10px] text-primary-foreground/75" : "text-[10px] text-muted-foreground/80"
          )}
        >
          <span className="font-bold opacity-80">
            {format(new Date(timestamp), "HH:mm")}
          </span>
          {isOwn && (
            isRead ? (
              <CheckCheck className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            ) : (
              <Check className="w-4 h-4 opacity-70" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
