import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegionSelector from "@/components/RegionSelector";
import UnifiedFeed from "@/components/UnifiedFeed";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ChevronRight, Search, Dog, Cat, PawPrint, Heart, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-adoption.jpg";
import ComoAyudarSection from "@/components/ComoAyudarSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import SmartPublicationWizard from "@/components/SmartPublicationWizard";

const Index = () => {
  useScrollAnimation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [viewLanding, setViewLanding] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    checkUser();
    if (searchParams.get("action") === "publish") {
      setShowWizard(true);
    }
  }, [searchParams]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const forceLanding = searchParams.get("forceLanding") === "true";

      if (session) {
        setUser(session.user);
        setViewLanding(forceLanding);

        if (!forceLanding) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!profileData?.country || !profileData?.province) {
            setShowRegionSelector(true);
          }
        }
      } else {
        setViewLanding(true);
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleWizardClose = (open: boolean) => {
    setShowWizard(open);
    if (!open) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("action");
      newParams.delete("type");
      setSearchParams(newParams);
    }
  };

  if (loadingUser) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  // APP MODE (LOGGED IN)
  if (user && !viewLanding) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="pt-20 flex-1">
          <UnifiedFeed onOpenWizard={(type) => {
            if (type) {
              // Update URL for consistency/shareability without reload
              const newParams = new URLSearchParams(searchParams);
              newParams.set("action", "publish");
              newParams.set("type", type === "adopcion" ? "adoption" : "lost");
              setSearchParams(newParams);
            }
            setShowWizard(true);
          }} />
        </main>

        <Dialog open={showWizard} onOpenChange={handleWizardClose}>
          <DialogContent className="sm:max-w-3xl p-6 overflow-y-auto max-h-[90vh] rounded-[2rem]">
            <DialogHeader className="sr-only">
              <DialogTitle>Publicar Mascota</DialogTitle>
              <DialogDescription>Asistente para crear una nueva publicación de mascota en adopción o perdida.</DialogDescription>
            </DialogHeader>
            <SmartPublicationWizard onSuccess={() => {
              setShowWizard(false);
              window.location.href = "/"; // Force reload to see new post
            }} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // LANDING MODE
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header minimal={true} />

      <main className="flex-1">

        {/* Legal Warning Banner */}
        <section className="bg-destructive/10 border-y border-destructive/20 py-3">
          <div className="container-custom px-4 flex items-center justify-center gap-2 text-destructive font-medium text-sm md:text-base text-center">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>
              <span className="font-bold">ADVERTENCIA LEGAL:</span> En Huellas Digitales está estrictamente prohibida la venta de animales. Fomentamos únicamente la adopción responsable.
            </p>
          </div>
        </section>

        {/* HERO SECTION */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt="Mascota feliz"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background/90" />
          </div>

          <div className="container relative z-10 px-4 md:px-6 pt-20 text-center md:text-left">
            <div className="max-w-3xl animate-fade-in-up mx-auto md:mx-0">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-md mb-6 shadow-xl">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                La red más grande de rescate animal
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.1] drop-shadow-2xl">
                Cada huella <br />
                cuenta una <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">historia</span>.
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed max-w-xl mx-auto md:mx-0 font-light text-shadow-sm">
                Conectamos corazones con patas. Huellas Digitales es la plataforma integral para adoptar, reportar perdidos y colaborar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white text-lg px-8 h-14 rounded-full shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:-translate-y-1"
                  onClick={() => navigate("/auth")}
                >
                  Adoptar ahora <Heart className="ml-2 w-5 h-5 fill-current" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-8 h-14 rounded-full backdrop-blur-md transition-all hover:scale-105 hover:-translate-y-1"
                  onClick={() => navigate("/perdidos")}
                >
                  Reportar perdido <Search className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50 cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-white/50 rounded-full animate-scroll" />
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-foreground">Todo en un solo lugar</h2>
              <p className="text-muted-foreground text-xl">Herramientas diseñadas para facilitar el bienestar animal y la conexión comunitaria.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Heart className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Adopción Responsable</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">Encuentra a tu compañero ideal con filtros avanzados de búsqueda y perfiles detallados.</p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-amber-500/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <MapPin className="text-amber-500 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Mapa Interactivo</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">Visualiza mascotas perdidas, refugios y veterinarias cercanas en tiempo real.</p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-rose-500/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Shield className="text-rose-500 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Seguridad y Confianza</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">Usuarios verificados y sistema de reportes para garantizar una comunidad segura.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION (Moved Up) */}
        <section className="py-24 relative overflow-hidden bg-black text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          <div className="container px-4 md:px-6 relative z-10 text-center">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                ¿Listo para cambiar <br /> <span className="text-primary">una vida?</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
                Tu próximo mejor amigo está esperando. Únete a miles de personas que ya están haciendo la diferencia.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 text-lg px-10 h-16 rounded-full font-bold shadow-2xl hover:shadow-white/20 transition-all hover:scale-105"
                  onClick={() => navigate("/auth")}
                >
                  Registrarme ahora
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* COMO AYUDAR (Donations) - Moved to bottom as requested */}
        <section id="ayudar" className="py-20 bg-muted/30">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground/50 uppercase tracking-widest text-sm mb-4">Colabora</h2>
            <p className="text-muted-foreground">Si deseas aportar tu granito de arena.</p>
          </div>
          <ComoAyudarSection />
        </section>

      </main>

      {/* Shared Wizard Dialog for specific landing actions that link to ?action=publish */}
      <Dialog open={showWizard} onOpenChange={handleWizardClose}>
        <DialogContent className="sm:max-w-3xl p-6 overflow-y-auto max-h-[90vh] rounded-[2rem]">
          <DialogHeader className="sr-only">
            <DialogTitle>Publicar Mascota</DialogTitle>
            <DialogDescription>Asistente para crear una nueva publicación de mascota.</DialogDescription>
          </DialogHeader>
          <SmartPublicationWizard onSuccess={() => {
            setShowWizard(false);
            window.location.href = "/"; // Force reload to see new post
          }} />
        </DialogContent>
      </Dialog>


      <Footer />

      {
        showRegionSelector && user && !searchParams.get("forceLanding") && (
          <RegionSelector
            open={showRegionSelector}
            userId={user.id}
            onRegionSet={() => {
              setShowRegionSelector(false);
              checkUser();
            }}
          />
        )
      }
    </div>
  );
};

export default Index;
