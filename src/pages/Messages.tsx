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
      <div className="flex-1 flex overflow-hidden lg:pt-20"> {/* PT-20 for fixed header on desktop */}
        <div className="w-full max-w-[1600px] mx-auto flex h-full lg:h-[calc(100vh-100px)] lg:rounded-[3rem] lg:my-4 shadow-2xl overflow-hidden bg-card border border-primary/5">
          {/* Sidebar */}
          <div className={`w-full md:w-[400px] border-r border-border flex flex-col bg-muted/5 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            {/* Sidebar Header */}
            <div className="h-24 px-8 border-b border-border flex items-center justify-between bg-gradient-to-br from-primary/5 to-transparent">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Chats</h2>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Bandeja de Entrada</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10">
                  <User className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Search Bar - Premium Style */}
            <div className="p-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar conversaciones..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted/50 border border-transparent focus:border-primary/20 focus:bg-background transition-all outline-none text-sm font-medium"
                />
              </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1 px-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sincronizando...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="px-8 py-20 text-center">
                  <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                    <MessageCircle className="w-10 h-10 text-primary/30" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Sin conversaciones</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Las personas interesadas en tus mascotas aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1 pb-10">
                  {conversations.map((conv) => {
                    const isUnread = (conv.unread_count || 0) > 0;
                    const dateStr = formatConversationDate(conv.updated_at);
                    const isSelected = selectedConversation?.id === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`group px-4 py-4 cursor-pointer transition-all relative flex gap-4 items-center rounded-[2rem] hover:bg-primary/5 ${isSelected ? 'bg-primary/10' : ''
                          }`}
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-14 w-14 rounded-2xl border-2 border-background shadow-md">
                            <AvatarImage src={conv.other_user_avatar || undefined} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                              {conv.other_user_name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {isUnread && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background animate-pulse" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold truncate text-foreground">
                              {conv.other_user_name}
                            </h3>
                            <span className={`text-[10px] font-bold ${isUnread ? 'text-primary' : 'text-muted-foreground/50'}`}>
                              {dateStr}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <p className={`text-[13px] truncate ${isUnread ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                              {conv.last_message || <span className="italic opacity-50">Multimeda</span>}
                            </p>
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/20 text-primary bg-primary/5 font-bold uppercase truncate max-w-[120px]">
                                {conv.animal_name}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Hover Action */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-10 h-10 rounded-xl absolute right-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(conv.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
                <div className="relative mb-10">
                  <div className="w-48 h-48 bg-primary/5 rounded-[3rem] flex items-center justify-center mb-6 animate-pulse rotate-6 border border-primary/10">
                    <MessageCircle className="w-24 h-24 text-primary/20 -rotate-6" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                </div>

                <h2 className="text-4xl font-black tracking-tighter text-foreground mb-4">Huellas Digitales Web</h2>
                <p className="text-muted-foreground max-w-md text-lg font-medium leading-relaxed">
                  Selecciona una conversación para comenzar a chatear.
                  Conecta directamente con refugios y dueños para adoptar o reportar mascotas.
                </p>

                <div className="mt-12 flex items-center gap-3 px-6 py-3 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold text-primary uppercase tracking-[0.2em]">
                  <Lock className="w-4 h-4" />
                  <span>Mensajería Privada y Segura</span>
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
