import { useState, useEffect } from "react";
import { FileText, PawPrint, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PublicationForm from "./PublicationForm";
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
    const element = document.getElementById("animales");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  return <section id="publicar" className="section-padding bg-background scroll-reveal">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Compartí un animalito en adopción</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Completá este formulario para que más personas puedan verlo y ayudar a encontrarle un hogar.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card-animal p-6 text-center">
              <PawPrint className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Fácil y Rápido</h3>
              <p className="text-sm text-muted-foreground">Completá el formulario en minutos</p>
            </div>
            <div className="card-animal p-6 text-center">
              <FileText className="w-10 h-10 text-secondary mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Sin Costo</h3>
              <p className="text-sm text-muted-foreground">Compartí gratis y ayudá a más peludos</p>
            </div>
            <div className="card-animal p-6 text-center">
              <PawPrint className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Gran Alcance</h3>
              <p className="text-sm text-muted-foreground">Miles de personas verán tu publicación</p>
            </div>
          </div>

          {/* Publicar Animal */}
          <div className="card-animal p-8">
            <div className="bg-muted/30 rounded-2xl p-12 text-center border-2 border-dashed border-primary/30">
              <Upload className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Formulario para Compartir</h3>
              <p className="text-muted-foreground mb-6">
                {isAuthenticated ? "Completa el formulario con los datos del animal que quieres compartir." : "Debes iniciar sesión para compartir un animal en adopción."}
              </p>
              <Button onClick={handlePublishClick} className="btn-hero" size="lg" disabled={loading}>
                <FileText className="w-5 h-5 mr-2" />
                {isAuthenticated ? "Compartir Animal" : "Iniciar Sesión"}
              </Button>
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-primary/10 rounded-2xl p-6">
              <h4 className="font-semibold mb-3 text-lg">📝 Información que necesitarás:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Fotos claras del animal (mínimo 2-3 fotos)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Tipo de animal (perro/gato), edad aproximada, tamaño</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Ubicación donde se encuentra</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Breve descripción de su personalidad y estado de salud</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compartir Animal en Adopción</DialogTitle>
          </DialogHeader>
          <PublicationForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </section>;
};
export default PublicarSection;