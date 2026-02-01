import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Loader2, ArrowLeft, Trash2, User, Circle } from "lucide-react";
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
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-20 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Mis Mensajes</h1>
              <p className="text-muted-foreground">Gestiona tus conversaciones</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[380px_1fr] gap-6">
            {/* Conversations List */}
            <Card className="lg:h-[650px] border-0 shadow-lg bg-card/50 backdrop-blur">
              <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Conversaciones
                </CardTitle>
                <CardDescription>
                  {conversations.length} {conversations.length === 1 ? "chat activo" : "chats activos"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">No tienes conversaciones</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Inicia una conversación desde la página de un animal
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[530px]">
                    <div className="divide-y">
                      {conversations.map((conv) => {
                        const isUnread = (conv.unread_count || 0) > 0;
                        const dateStr = formatConversationDate(conv.updated_at);
                        
                        return (
                          <div
                            key={conv.id}
                            className={`group relative transition-all duration-200 ${
                              selectedConversation?.id === conv.id 
                                ? 'bg-primary/10 border-l-4 border-l-primary' 
                                : isUnread 
                                  ? 'bg-accent/50 hover:bg-accent/80'
                                  : 'hover:bg-muted/50'
                            }`}
                          >
                            <button
                              onClick={() => setSelectedConversation(conv)}
                              className="w-full text-left p-4"
                            >
                              <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                    <AvatarImage src={conv.other_user_avatar || undefined} alt={conv.other_user_name} />
                                    <AvatarFallback className={`${isUnread ? 'bg-primary text-primary-foreground' : 'bg-muted'} font-semibold`}>
                                      {conv.other_user_name?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  {isUnread && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                      <Circle className="w-2 h-2 fill-primary-foreground text-primary-foreground" />
                                    </span>
                                  )}
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <h4 className={`font-semibold truncate ${isUnread ? 'text-foreground' : 'text-foreground/80'}`}>
                                      {conv.other_user_name}
                                    </h4>
                                    <span className={`text-xs whitespace-nowrap ${isUnread ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                      {dateStr}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <Badge variant="secondary" className="text-xs px-2 py-0 h-5 font-normal">
                                      🐾 {conv.animal_name}
                                    </Badge>
                                    {isUnread && (
                                      <Badge className="text-xs px-2 py-0 h-5 bg-primary">
                                        {conv.unread_count} nuevo{conv.unread_count! > 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {conv.last_message && (
                                    <p className={`text-sm truncate ${isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                      {conv.last_message}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                            
                            {/* Action buttons */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 bg-background/80 hover:bg-background shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/profile?user=${conv.other_user_id}`);
                                }}
                                title="Ver perfil"
                              >
                                <User className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 bg-background/80 hover:bg-destructive/10 hover:text-destructive shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(conv.id);
                                }}
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:h-[650px] flex flex-col border-0 shadow-lg bg-card/50 backdrop-blur overflow-hidden">
              {selectedConversation ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <ChatWindow
                    conversationId={selectedConversation.id}
                    animalName={selectedConversation.animal_name!}
                    otherUserName={selectedConversation.other_user_name!}
                    otherUserId={selectedConversation.other_user_id}
                    otherUserAvatar={selectedConversation.other_user_avatar}
                    currentUserId={user?.id}
                    onClose={() => setSelectedConversation(null)}
                    embedded
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-muted/20 to-transparent">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <MessageCircle className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Selecciona una conversación</h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Elige una conversación de la lista para ver los mensajes
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar conversación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta conversación? Se eliminarán todos los mensajes y esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDeleteConversation(deleteConfirm)}
              className="flex-1"
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;
