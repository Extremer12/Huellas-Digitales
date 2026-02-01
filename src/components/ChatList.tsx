import { useState, useEffect } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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
      <ScrollArea className="h-[600px]">
        <div className="space-y-2 p-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold truncate">{conv.other_user_name}</h4>
                    {conv.unread_count! > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    sobre {conv.animal_name}
                  </p>
                  {conv.last_message && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(conv.updated_at), 'dd/MM')}
                </span>
              </div>
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
