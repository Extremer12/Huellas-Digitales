import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNotifications = (userId: string | undefined) => {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "No soportado",
        description: "Las notificaciones no están soportadas en este navegador",
        variant: "destructive",
      });
      return false;
    }

    if (Notification.permission === "granted") {
      toast({
        title: "Ya activadas",
        description: "Las notificaciones ya están activadas",
      });
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast({
          title: "¡Notificaciones activadas!",
          description: "Recibirás notificaciones de nuevos mensajes",
        });
        
        // Show a test notification
        showNotification("¡Bienvenido!", {
          body: "Las notificaciones están funcionando correctamente",
        });
        
        return true;
      } else {
        toast({
          title: "Notificaciones bloqueadas",
          description: "Puedes habilitarlas desde la configuración del navegador",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Error",
        description: "No se pudo solicitar permisos de notificación",
        variant: "destructive",
      });
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          icon: "/logo-192.png",
          badge: "/logo-192.png",
          requireInteraction: false,
          silent: false,
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    }
  };

  useEffect(() => {
    if (!userId || Notification.permission !== "granted") return;

    console.log("Setting up realtime notifications for user:", userId);

    // Listen for new messages in conversations where user is involved
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log("New message received:", payload);
          
          // Ignore messages sent by current user
          if (payload.new.sender_id === userId) return;

          // Get conversation details
          const { data: conversation } = await supabase
            .from('conversations')
            .select('animal_id, adopter_id, publisher_id')
            .eq('id', payload.new.conversation_id)
            .single();

          if (!conversation) return;

          const isInvolved = 
            conversation.adopter_id === userId || 
            conversation.publisher_id === userId;

          if (isInvolved) {
            // Get sender info
            const { data: sender } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', payload.new.sender_id)
              .single();

            const senderName = sender?.full_name || sender?.email?.split('@')[0] || "Alguien";
            
            // Show browser notification if tab is not focused
            if (document.hidden) {
              showNotification("💬 Nuevo mensaje", {
                body: `${senderName} te ha enviado un mensaje`,
                tag: `chat-${payload.new.conversation_id}`,
              });
            }

            // Always show toast notification
            toast({
              title: "💬 Nuevo mensaje",
              description: `${senderName} te ha enviado un mensaje`,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Notification subscription status:", status);
      });

    return () => {
      console.log("Cleaning up notification subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);

  return {
    permission,
    requestPermission,
    showNotification,
  };
};