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
          "max-w-[75%] rounded-lg px-3 py-1.5 shadow-sm text-sm relative group",
          isOwn
            ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-foreground rounded-tr-none"
            : "bg-white dark:bg-[#202c33] text-foreground rounded-tl-none"
        )}
      >
        <p className="break-words whitespace-pre-wrap leading-relaxed pb-4 text-[14.2px]">
          {content}
        </p>
        <div
          className={cn(
            "absolute bottom-1 right-2 flex items-center gap-1",
            "text-[10px] text-gray-500 dark:text-gray-400"
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
