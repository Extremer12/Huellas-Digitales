import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";

interface StoryReportModalProps {
  storyId: string | null;
  onClose: () => void;
}

const StoryReportModal = ({ storyId, onClose }: StoryReportModalProps) => {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Por favor describe el motivo del reporte",
        variant: "destructive",
      });
      return;
    }

    if (reason.length < 10) {
      toast({
        title: "Error",
        description: "El motivo debe tener al menos 10 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para reportar",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check for duplicate report
      const { data: existingReport } = await supabase
        .from('story_reports')
        .select('id')
        .eq('story_id', storyId)
        .eq('reporter_user_id', user.id)
        .maybeSingle();

      if (existingReport) {
        toast({
          title: "Reporte duplicado",
          description: "Ya has reportado esta historia anteriormente",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("story_reports")
        .insert({
          story_id: storyId,
          reporter_user_id: user.id,
          reason: reason.trim(),
        });

      if (error) {
        // Check if error is due to unique constraint
        if (error.code === '23505') {
          toast({
            title: "Reporte duplicado",
            description: "Ya has reportado esta historia anteriormente",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        setLoading(false);
        return;
      }

      toast({
        title: "Reporte enviado",
        description: "Gracias por ayudarnos a mantener la comunidad segura",
      });

      setReason("");
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el reporte",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!storyId} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Reportar Historia
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason">Motivo del reporte</Label>
            <Textarea
              id="reason"
              placeholder="Describe por qué estás reportando esta historia..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              required
              minLength={10}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo 10 caracteres
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Enviando..." : "Enviar Reporte"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StoryReportModal;
