import { useState, useEffect } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ChatWindow from "./ChatWindow";

interface Conversation {
  id: string;
  animal_id: string;
  adopter_id: string;
  publisher_id: string;
  updated_at: string;
  animal_name?: string;
  other_user_name?: string;
  last_message?: string;
  unread_count?: number;
}

interface ChatListProps {
  userId: string;
}

const ChatList = ({ userId }: ChatListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();

    // Subscribe to new conversations
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `adopter_id=eq.${userId},publisher_id=eq.${userId}`
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadConversations = async () => {
    try {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`adopter_id.eq.${userId},publisher_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      // Load additional data for each conversation
      const enrichedConversations = await Promise.all(
        (convData || []).map(async (conv) => {
          // Get animal name
          const { data: animalData } = await supabase
            .from('animals')
            .select('name')
            .eq('id', conv.animal_id)
            .single();

          // Get other user's name
          const otherUserId = conv.adopter_id === userId ? conv.publisher_id : conv.adopter_id;
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', otherUserId)
            .single();

          // Get last message
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', userId);

          return {
            ...conv,
            animal_name: animalData?.name || 'Animal',
            other_user_name: profileData?.full_name || profileData?.email || 'Usuario',
            last_message: lastMessageData?.content || '',
            unread_count: unreadCount || 0,
          };
        })
      );

      setConversations(enrichedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las conversaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No tienes conversaciones aún</p>
        <p className="text-sm text-muted-foreground mt-2">
          Inicia una conversación desde la página de un animal
        </p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[600px] pr-4 -mr-4">
        <div className="space-y-3 p-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={cn(
                "w-full text-left p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                "bg-card/40 border border-border/50 hover:border-primary/40 hover:bg-accent/5 hover:shadow-md",
                selectedConversation?.id === conv.id && "bg-primary/[0.03] border-primary/30 ring-1 ring-primary/20",
                conv.unread_count! > 0 && "bg-primary/[0.02]"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {conv.other_user_name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {conv.unread_count! > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h4 className={cn(
                      "font-bold text-[15px] truncate max-w-[140px] sm:max-w-none",
                      conv.unread_count! > 0 ? "text-foreground" : "text-foreground/90"
                    )}>
                      {conv.other_user_name}
                    </h4>
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                      {format(new Date(conv.updated_at), 'HH:mm')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/20 bg-primary/5 text-primary">
                      {conv.animal_name}
                    </Badge>
                  </div>

                  {conv.last_message ? (
                    <p className={cn(
                      "text-[13px] truncate leading-tight mt-1",
                      conv.unread_count! > 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                    )}>
                      {conv.last_message}
                    </p>
                  ) : (
                    <p className="text-[13px] italic text-muted-foreground/60 mt-1">Sin mensajes aún</p>
                  )}
                </div>
              </div>

              {selectedConversation?.id === conv.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full my-3" />
              )}
            </button>
          ))}
        </div>
      </ScrollArea>

      {selectedConversation && (
        <ChatWindow
          conversationId={selectedConversation.id}
          animalName={selectedConversation.animal_name!}
          otherUserName={selectedConversation.other_user_name!}
          currentUserId={userId}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </>
  );
};

export default ChatList;
