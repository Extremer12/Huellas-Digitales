import { useState, useEffect, useRef } from "react";
import { Loader2, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatHeader from "./chat/ChatHeader";
import ChatMessage from "./chat/ChatMessage";
import ChatInput from "./chat/ChatInput";
import ChatEmptyState from "./chat/ChatEmptyState";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  animalName: string;
  otherUserName: string;
  otherUserId?: string;
  otherUserAvatar?: string;
  currentUserId: string;
  onClose: () => void;
  embedded?: boolean;
}

const ChatWindow = ({
  conversationId,
  animalName,
  otherUserName,
  otherUserId,
  otherUserAvatar,
  currentUserId,
  onClose,
  embedded = false,
}: ChatWindowProps) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    markMessagesAsRead();

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          // Mark as read if from other user
          if (newMessage.sender_id !== currentUserId) {
            markMessagesAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isMinimized]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, content, sender_id, created_at, read")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", currentUserId)
        .eq("read", false);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async (content: string) => {
    if (content.length > 1000) {
      toast({
        title: "Mensaje muy largo",
        description: "El mensaje no puede superar los 1000 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: content,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Embedded version for Messages page
  if (embedded) {
    return (
      <div className="flex flex-col h-full">
        {/* Enhanced header with profile access */}
        <div className="p-4 border-b bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
              <AvatarImage src={otherUserAvatar || undefined} alt={otherUserName} />
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-semibold">
                {otherUserName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{otherUserName}</h3>
              <p className="text-sm opacity-80 truncate">🐾 {animalName}</p>
            </div>
            {otherUserId && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => navigate(`/profile?user=${otherUserId}`)}
              >
                <User className="w-4 h-4 mr-1" />
                Ver perfil
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="flex-1 bg-gradient-to-b from-muted/30 to-transparent" ref={scrollRef}>
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <ChatEmptyState animalName={animalName} />
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    content={message.content}
                    timestamp={message.created_at}
                    isOwn={message.sender_id === currentUserId}
                    isRead={message.read}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <ChatInput onSend={sendMessage} disabled={loading} />
      </div>
    );
  }

  // Floating window version
  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out shadow-2xl",
        "inset-4 md:inset-auto md:bottom-4 md:right-4 md:w-[380px]",
        isMinimized ? "md:h-[68px]" : "md:h-[550px]",
        "bg-background border rounded-xl overflow-hidden flex flex-col"
      )}
    >
      <ChatHeader
        userName={otherUserName}
        animalName={animalName}
        isMinimized={isMinimized}
        onMinimize={() => setIsMinimized(!isMinimized)}
        onClose={onClose}
      />

      {!isMinimized && (
        <>
          <ScrollArea
            className="flex-1 bg-gradient-to-b from-muted/30 to-transparent"
            ref={scrollRef}
          >
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <ChatEmptyState animalName={animalName} />
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      content={message.content}
                      timestamp={message.created_at}
                      isOwn={message.sender_id === currentUserId}
                      isRead={message.read}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <ChatInput onSend={sendMessage} disabled={loading} />
        </>
      )}
    </div>
  );
};

export default ChatWindow;
