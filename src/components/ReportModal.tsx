import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

interface ReportModalProps {
  animalId: string | null;
  onClose: () => void;
}

const ReportModal = ({ animalId, onClose }: ReportModalProps) => {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (reason.trim().length < 10) {
      toast({
        title: "Razón muy corta",
        description: "Por favor describe el motivo del reporte con al menos 10 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para reportar",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check for duplicate report
      const { data: existingReport } = await supabase
        .from('reports')
        .select('id')
        .eq('animal_id', animalId)
        .eq('reporter_user_id', user.id)
        .maybeSingle();

      if (existingReport) {
        toast({
          title: "Reporte duplicado",
          description: "Ya has reportado esta publicación anteriormente",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("reports")
        .insert({
          animal_id: animalId,
          reporter_user_id: user.id,
          reason: reason.trim(),
        });

      if (error) {
        // Check if error is due to unique constraint
        if (error.code === '23505') {
          toast({
            title: "Reporte duplicado",
            description: "Ya has reportado esta publicación anteriormente",
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

      onClose();
      setReason("");
    } catch (error: any) {
      toast({
        title: "Error al enviar reporte",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!animalId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Reportar publicación
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason">Motivo del reporte</Label>
            <Textarea
              id="reason"
              placeholder="Describe por qué reportas esta publicación..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={500}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reason.length}/500 caracteres
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Enviando..." : "Enviar reporte"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
