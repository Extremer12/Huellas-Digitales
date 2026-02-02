import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Loader2, ArrowLeft, Trash2, User, Circle, Search, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import ChatWindow from "@/components/ChatWindow";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  id: string;
  animal_id: string;
  adopter_id: string;
  publisher_id: string;
  updated_at: string;
  animal_name?: string;
  other_user_name?: string;
  other_user_id?: string;
  other_user_avatar?: string;
  last_message?: string;
  unread_count?: number;
}

const formatConversationDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  if (isYesterday(date)) {
    return 'Ayer';
  }
  return format(date, 'd MMM', { locale: es });
};

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const conversationIdFromUrl = searchParams.get("conversation");

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (conversationIdFromUrl && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationIdFromUrl);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [conversationIdFromUrl, conversations]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    loadConversations(session.user.id);
  };

  const loadConversations = async (userId: string) => {
    try {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`adopter_id.eq.${userId},publisher_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      const enrichedConversations = await Promise.all(
        (convData || []).map(async (conv) => {
          const { data: animalData } = await supabase
            .from('animals')
            .select('name')
            .eq('id', conv.animal_id)
            .maybeSingle();

          const otherUserId = conv.adopter_id === userId ? conv.publisher_id : conv.adopter_id;
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email, avatar_url')
            .eq('id', otherUserId)
            .maybeSingle();

          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

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
            other_user_id: otherUserId,
            other_user_avatar: profileData?.avatar_url || null,
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

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      // First delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Then delete the conversation
      const { error: convError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (convError) throw convError;

      toast({
        title: "Éxito",
        description: "Conversación eliminada correctamente",
      });

      setConversations(conversations.filter(c => c.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la conversación",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="inline-flex items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-lg text-muted-foreground">Cargando mensajes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden pt-20"> {/* PT-20 to account for fixed header */}
        <div className="w-full max-w-[1600px] mx-auto flex h-[calc(100vh-80px)] shadow-2xl overflow-hidden bg-card">
          {/* Sidebar */}
          <div className={`w-full md:w-[400px] border-r border-border flex flex-col bg-muted/10 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            {/* Sidebar Header */}
            <div className="h-16 px-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h2 className="text-xl font-bold">Mensajes</h2>
              <div className="flex gap-2">
                {/* Future buttons like status, new chat, menu could go here */}
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar o empezar un nuevo chat"
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Cargando chats...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">No tienes mensajes</h3>
                  <p className="text-sm text-muted-foreground">
                    Contacta a alguien en la sección de Adopción para comenzar.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {conversations.map((conv) => {
                    const isUnread = (conv.unread_count || 0) > 0;
                    const dateStr = formatConversationDate(conv.updated_at);
                    const isSelected = selectedConversation?.id === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`group px-4 py-3 cursor-pointer transition-colors relative flex gap-3 items-center border-b border-border/40 hover:bg-muted/30 ${isSelected ? 'bg-muted/50' : ''
                          }`}
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={conv.other_user_avatar || undefined} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {conv.other_user_name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online status indicator mock - could be real later */}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h3 className="font-medium truncate text-foreground text-[15px]">
                              {conv.other_user_name}
                            </h3>
                            <span className={`text-[11px] ${isUnread ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                              {dateStr}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <p className={`text-[13px] truncate pr-2 ${isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {/* Checkmark icon for own last message logic could go here */}
                              {conv.last_message ? conv.last_message : <span className="italic opacity-70">Imagen o adjunto</span>}
                            </p>
                            {isUnread && (
                              <span className="bg-primary text-primary-foreground text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full">
                                {conv.unread_count}
                              </span>
                            )}
                            {/* Hidden delete button that shows on hover */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(conv.id);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                            Interesado en: {conv.animal_name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            <div className="p-3 border-t text-center text-xs text-muted-foreground bg-muted/10">
              <p>Tus mensajes personales están cifrados de extremo a extremo.</p>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className={`flex-1 flex-col bg-background/50 relative ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            {/* Dark Mode Chat Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

            {selectedConversation ? (
              <div className="flex-1 flex flex-col h-full relative z-10">
                {/* New ChatWindow Header is handled internally if 'embedded' is true? 
                            Actually, the current ChatWindow 'embedded' mode brings its own header. 
                            Let's rely on ChatWindow but maybe we need to tweak it to match the WhatsApp style 100%.
                            For now, let's pass a prop or rely on the embedded mode styling.
                        */}
                <div className="h-full w-full">
                  <ChatWindow
                    conversationId={selectedConversation.id}
                    animalName={selectedConversation.animal_name!}
                    otherUserName={selectedConversation.other_user_name!}
                    otherUserId={selectedConversation.other_user_id}
                    otherUserAvatar={selectedConversation.other_user_avatar}
                    currentUserId={user?.id}
                    onClose={() => setSelectedConversation(null)}
                    embedded={true}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-muted/5 z-10 relative">
                <div className="w-64 h-64 bg-primary/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <MessageCircle className="w-32 h-32 text-primary/20" />
                </div>
                <h2 className="text-3xl font-light text-foreground mb-4">Huellas Digitales Web</h2>
                <p className="text-muted-foreground max-w-md text-lg">
                  Envía y recibe mensajes para adoptar a tu próxima mascota.
                  Conecta directamente con refugios y dueños.
                </p>
                <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span>Protegido y seguro</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar chat</DialogTitle>
            <DialogDescription>
              ¿Quieres borrar esta conversación? No podrás recuperarla.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4 justify-end">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDeleteConversation(deleteConfirm)}
            >
              Eliminar chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;
