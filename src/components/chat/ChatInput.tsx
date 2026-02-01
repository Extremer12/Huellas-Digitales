import { useState } from "react";
import { Send, Loader2, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || sending || disabled) return;

    if (trimmed.length > 1000) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const characterCount = message.length;
  const isNearLimit = characterCount > 900;
  const isOverLimit = characterCount > 1000;

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              disabled={sending || disabled}
              className={cn(
                "min-h-[44px] max-h-32 resize-none pr-12 rounded-2xl border-muted-foreground/20 focus-visible:ring-primary/50",
                isOverLimit && "border-destructive focus-visible:ring-destructive/50"
              )}
              rows={1}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={sending || !message.trim() || isOverLimit || disabled}
            className="h-11 w-11 rounded-full shrink-0 shadow-md hover:shadow-lg transition-shadow"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        {isNearLimit && (
          <div className="flex justify-end">
            <span
              className={cn(
                "text-xs",
                isOverLimit ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {characterCount}/1000
            </span>
          </div>
        )}
      </div>
    </form>
  );
};

export default ChatInput;
