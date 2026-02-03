import { useState } from "react";
import { Heart, Share2, DollarSign, PawPrint, Copy, Check, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-primary/20">
              TU AYUDA CUENTA
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
            Sumate a la <span className="text-primary">causa</span> 🐾
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Desde compartir en redes hasta una pequeña donación. Cada acción cuenta para cambiar vidas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Card 1 */}
          <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300">
            <CardHeader className="text-center pt-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Share2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Difusión</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-muted-foreground mb-6 h-auto min-h-[3rem]">
                Ayudá a difundir. Cuanta más gente nos conozca, más animales podremos ayudar.
              </p>
              <Button onClick={handleShare} variant="outline" className="w-full rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors">
                Compartir web
              </Button>
            </CardContent>
          </Card>

          {/* Card 2 - Featured */}
          <Card className="border-2 border-primary/20 shadow-xl bg-card relative overflow-hidden transform md:-translate-y-4">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-amber-500" />
            <CardHeader className="text-center pt-10">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Donación</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-10">
              <p className="text-muted-foreground mb-6">
                Tu aporte nos ayuda a crecer y seguir rescatando. 100% transparente y directo a la causa.
              </p>
              <Button onClick={() => setShowDonateModal(true)} className="w-full h-12 rounded-full text-lg shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all">
                Donar ahora
              </Button>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300">
            <CardHeader className="text-center pt-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4">
                <PawPrint className="w-8 h-8 text-rose-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Rescate</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-muted-foreground mb-6 h-auto min-h-[3rem]">
                Si ves un animal en la calle, publicalo. Sé el primer eslabón en su cadena de rescate.
              </p>
              <Button asChild variant="outline" className="w-full rounded-full border-rose-500/20 hover:bg-rose-500/5 hover:text-rose-500 transition-colors">
                <a href="#contacto">Publicar caso</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-primary/5 to-amber-500/5 rounded-3xl p-8 border border-primary/10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="p-4 bg-background rounded-full shadow-sm">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 text-foreground">¿Por qué es segura tu donación?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Utilizamos MercadoPago, la plataforma líder en Latinoamérica. Tu dinero llega directamente a la cuenta de la organización sin intermediarios.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Donate Modal */}
      <Dialog open={showDonateModal} onOpenChange={setShowDonateModal}>
        <DialogContent className="max-w-md border-0 bg-card p-0 overflow-hidden shadow-2xl rounded-3xl">
          <div className="bg-primary/5 p-8 pb-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4 relative z-10">
              <Heart className="w-8 h-8 text-primary fill-current" />
            </div>
            <DialogTitle className="text-2xl font-bold mb-2">¡Gracias por tu apoyo!</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Elegí la opción que prefieras para colaborar.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-6 bg-background">
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Alias / CVU</label>
              <div className="group relative bg-muted/40 hover:bg-muted/60 border border-border transition-colors rounded-2xl p-4 flex items-center justify-between cursor-pointer" onClick={handleCopyAlias}>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xl font-bold text-foreground font-mono tracking-tight">huellasdigitales</span>
                    <span className="text-xs text-muted-foreground">Cuenta oficial MercadoPago</span>
                  </div>
                </div>

                <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center group-hover:scale-105 transition-transform">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Transparencia total:</strong> El 100% de lo recaudado se destina al mantenimiento de servidores y campañas de esterilización.
              </p>
            </div>

            <Button onClick={() => setShowDonateModal(false)} variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComoAyudarSection;