import { useState, useEffect } from "react";
import { FileText, PawPrint, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SmartPublicationWizard from "./SmartPublicationWizard";

const PublicarSection = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setLoading(false);
  };

  const handlePublishClick = () => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else {
      setShowForm(true);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    // Refresh page or feed? For now just close.
  };

  return <section id="publicar" className="section-padding bg-background scroll-reveal">
    <div className="container-custom">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">

        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Compartí un animalito</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Ayudá a que más personas puedan verlo y encontrarle un hogar o reunirlo con su familia.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card-animal p-6 text-center">
            <PawPrint className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Adopción</h3>
            <p className="text-sm text-muted-foreground">Encontrale un hogar lleno de amor.</p>
          </div>
          <div className="card-animal p-6 text-center">
            <FileText className="w-10 h-10 text-secondary mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Perdidos</h3>
            <p className="text-sm text-muted-foreground">Reportá mascotas perdidas o encontradas.</p>
          </div>
          <div className="card-animal p-6 text-center">
            <PawPrint className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Historias</h3>
            <p className="text-sm text-muted-foreground">Inspirá a otros con historias de éxito.</p>
          </div>
        </div>

        {/* Publicar Animal */}
        <div className="card-animal p-8">
          <div className="bg-muted/30 rounded-2xl p-12 text-center border-2 border-dashed border-primary/30">
            <Upload className="w-16 h-16 text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">Centro de Publicación</h3>
            <p className="text-muted-foreground mb-6">
              {isAuthenticated ? "Elige qué tipo de publicación deseas realizar." : "Debes iniciar sesión para publicar."}
            </p>
            <Button onClick={handlePublishClick} className="btn-hero" size="lg" disabled={loading}>
              <FileText className="w-5 h-5 mr-2" />
              {isAuthenticated ? "Comenzar Publicación" : "Iniciar Sesión"}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <Dialog open={showForm} onOpenChange={setShowForm}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
        <div className="bg-background border rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-center text-2xl">Nueva Publicación</DialogTitle>
          </DialogHeader>
          <SmartPublicationWizard onSuccess={handleFormSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  </section>;
};
export default PublicarSection;