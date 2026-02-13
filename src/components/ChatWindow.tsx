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
import PublicProfileModal from "./PublicProfileModal";

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
  const [showPublicProfile, setShowPublicProfile] = useState(false);
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
      <div className="flex flex-col h-full bg-background/30 backdrop-blur-sm">
        {/* Helper header with profile access */}
        <div className="h-16 px-4 py-2 border-b border-border/60 bg-muted/30 backdrop-blur-sm flex items-center justify-between shadow-sm z-20">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowPublicProfile(true)}>
            <Avatar className="h-10 w-10 cursor-pointer ring-0 group-hover:ring-2 ring-primary/20 transition-all">
              <AvatarImage src={otherUserAvatar || undefined} alt={otherUserName} className="object-cover" />
              <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                {otherUserName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground text-[16px] leading-tight truncate">{otherUserName}</h3>
              <p className="text-[13px] text-muted-foreground truncate">
                Interesado en {animalName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Action buttons could go here */}
          </div>
        </div>

        <ScrollArea className="flex-1 bg-transparent" ref={scrollRef}>
          <div className="p-4 md:px-16 lg:px-24 py-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <ChatEmptyState animalName={animalName} />
            ) : (
              <div className="space-y-1">
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

        <div className="p-3 bg-muted/30 border-t border-border/60">
          <ChatInput onSend={sendMessage} disabled={loading} />
        </div>

        <PublicProfileModal
          userId={showPublicProfile ? (otherUserId || null) : null}
          onClose={() => setShowPublicProfile(false)}
        />
      </div>
    );
  }

  // Floating window version
  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-500 ease-in-out shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]",
        "inset-x-2 bottom-4 md:inset-auto md:bottom-6 md:right-6 md:w-[400px]",
        isMinimized ? "h-[70px]" : "h-[calc(100vh-120px)] md:h-[600px]",
        "bg-background/95 backdrop-blur-md border border-border/40 rounded-[2rem] overflow-hidden flex flex-col animate-in slide-in-from-bottom-5"
      )}
    >
      <ChatHeader
        userName={otherUserName}
        animalName={animalName}
        avatar={otherUserAvatar}
        isMinimized={isMinimized}
        onMinimize={() => setIsMinimized(!isMinimized)}
        onClose={onClose}
      />

      {!isMinimized && (
        <>
          <ScrollArea
            className="flex-1 bg-gradient-to-b from-muted/20 to-background/50 relative"
            ref={scrollRef}
          >
            {/* Background pattern could go here */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="p-4 relative z-10 flex flex-col gap-2">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                </div>
              ) : messages.length === 0 ? (
                <ChatEmptyState animalName={animalName} />
              ) : (
                <div className="space-y-1">
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

          <div className="p-4 bg-background/80 border-t border-border/30 backdrop-blur-md">
            <ChatInput onSend={sendMessage} disabled={loading} />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
