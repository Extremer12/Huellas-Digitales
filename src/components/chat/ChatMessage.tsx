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
    <div className={cn("flex w-full mb-2", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-4 py-2 shadow-md text-sm relative group",
          isOwn
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-muted text-foreground rounded-tl-none border border-border/50"
        )}
      >
        <p className="break-words whitespace-pre-wrap leading-relaxed pb-4 text-[14.2px]">
          {content}
        </p>
        <div
          className={cn(
            "absolute bottom-1 right-2 flex items-center gap-1",
            isOwn ? "text-[10px] text-primary-foreground/70" : "text-[10px] text-muted-foreground"
          )}
        >
          <span>
            {format(new Date(timestamp), "HH:mm")}
          </span>
          {isOwn && (
            isRead ? (
              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
