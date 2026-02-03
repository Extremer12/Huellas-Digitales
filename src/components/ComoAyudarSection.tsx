import { useState } from "react";
import { Heart, Share2, DollarSign, PawPrint, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const ComoAyudarSection = () => {
  const { toast } = useToast();
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: "Huellas Digitales",
      text: "¡Ayudá a encontrar hogares para animales rescatados! 🐾",
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "¡Compartido!",
          description: "Gracias por ayudar a difundir 💚",
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copiado",
          description: "El link se copió al portapapeles",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo copiar el link",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopyAlias = async () => {
    try {
      await navigator.clipboard.writeText("huellasdigitales");
      setCopied(true);
      toast({
        title: "¡Alias copiado!",
        description: "El alias de MercadoPago se copió al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el alias",
        variant: "destructive",
      });
    }
  };
  return (
    <>
      <section id="ayudar" className="section-padding bg-gradient-to-b from-primary/10 to-background scroll-reveal">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">

            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Sumate a la causa 🐾
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hay muchas formas de ayudar. Cada acción cuenta para cambiar vidas.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            {/* Card 1 */}
            <div className="card-animal p-8 text-center">
              <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PawPrint className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Adoptá, no compres</h3>
              <p className="text-muted-foreground">
                Miles de animales esperan un hogar. La adopción salva vidas y combate el abandono.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card-animal p-8 text-center">
              <div className="bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Compartí la web</h3>
              <p className="text-muted-foreground">
                Ayudá a difundir. Cuanta más gente nos conozca, más animales podremos ayudar.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card-animal p-8 text-center">
              <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rescatá y publicá</h3>
              <p className="text-muted-foreground">
                Si ves un animal en la calle, podés publicarlo acá y ayudarlo a encontrar familia.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
            <Button onClick={handleShare} size="lg" className="btn-hero text-lg w-full sm:w-auto">
              <Share2 className="w-5 h-5 mr-2" />
              Compartir en redes
            </Button>

            <Button onClick={() => setShowDonateModal(true)} size="lg" className="btn-secondary text-lg w-full sm:w-auto">
              <DollarSign className="w-5 h-5 mr-2" />
              <span className="flex flex-col items-start">
                <span>Donar vía MercadoPago</span>
              </span>
            </Button>
          </div>

          {/* Donation Info */}
          <p className="text-center text-sm text-muted-foreground mt-4 max-w-2xl mx-auto">
            Todo el dinero recaudado se usará para mantener la web y se donará a refugios
            o para ayudar a animales callejeros rescatados que lo requieran.
          </p>

          {/* Info Banner */}
          <div className="mt-16 bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-primary/20 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <PawPrint className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">¿Por qué es importante la adopción?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  En Argentina, miles de perros y gatos son abandonados cada año. La adopción responsable
                  no solo le da una segunda oportunidad a un animal, sino que también ayuda a combatir
                  el comercio irresponsable de mascotas. Cada adopción es un acto de amor que transforma
                  dos vidas: la del animal y la tuya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donate Modal */}
      <Dialog open={showDonateModal} onOpenChange={setShowDonateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Heart className="w-6 h-6 text-primary" />
              Donar vía MercadoPago
            </DialogTitle>
            <DialogDescription className="text-base">
              Tu donación ayuda a mantener la plataforma y se destina a refugios y animales rescatados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-card/50 rounded-2xl p-6 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-3">Alias de MercadoPago (Cuenta Ualá):</p>
              <div className="flex items-center justify-between gap-3 bg-background/50 rounded-xl p-4">
                <span className="text-xl md:text-2xl font-bold text-primary truncate">huellasdigitales</span>
                <Button
                  onClick={handleCopyAlias}
                  size="sm"
                  variant="outline"
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>💚 El dinero recaudado se usa para:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Mantener la plataforma funcionando</li>
                <li>Donar a refugios de animales</li>
                <li>Ayudar a animales callejeros rescatados</li>
              </ul>
            </div>

            <p className="text-center text-sm font-medium text-primary">
              ¡Gracias por tu generosidad! 🐾
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default ComoAyudarSection;