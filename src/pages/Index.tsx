import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegionSelector from "@/components/RegionSelector";
import UnifiedFeed from "@/components/UnifiedFeed";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ChevronRight, Search, Dog, Cat, PawPrint, Heart, Info, AlertTriangle, MapPin, Shield } from "lucide-react";
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

        {/* HERO SECTION REDESIGNED */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

          {/* Dynamic Background */}
          <div className="absolute inset-0 z-0">
            {/* Image Base */}
            <div className="absolute inset-0 bg-black/60 z-10" />
            <img
              src={heroImage}
              alt="Mascota feliz"
              className="w-full h-full object-cover scale-105 animate-slow-zoom"
            />

            {/* Mesh Gradients Overlay */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-background via-transparent to-black/40" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 animate-pulse-slow delay-1000" />
          </div>

          <div className="container relative z-30 px-4 md:px-6 pt-20 flex flex-col items-center text-center md:items-start md:text-left">

            {/* Growth Badge */}
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md mb-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-1000">
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="tracking-wide">Web en etapa de crecimiento</span>
            </div>

            <div className="max-w-4xl space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.95] drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                Cada huella <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">cuenta una historia.</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                La plataforma que está revolucionando la forma en que conectamos corazones con patas. Adopta, busca y colabora desde cualquier lugar.
              </p>

              {/* Warning Banner Integrated */}
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 py-4">
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-destructive/20 border border-destructive/30 backdrop-blur-sm text-white/90">
                  <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
                  <p className="text-sm font-medium">
                    <span className="font-bold text-destructive">Importante:</span> Prohibida estrictamente la venta de animales.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white text-lg px-8 h-14 rounded-full shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.5)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(var(--primary-rgb),0.6)]"
                  onClick={() => navigate("/auth")}
                >
                  Adoptar ahora <Heart className="ml-2 w-5 h-5 fill-current" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-lg px-8 h-14 rounded-full backdrop-blur-md transition-all hover:scale-105"
                  onClick={() => navigate("/perdidos")}
                >
                  Reportar perdido <Search className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce cursor-pointer z-30 opacity-70 hover:opacity-100 transition-opacity" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
            <span className="text-xs font-medium text-white/50 uppercase tracking-widest">Descubrí más</span>
            <div className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center pt-1">
              <div className="w-1 h-2 bg-white rounded-full animate-scroll" />
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

        {/* COMO AYUDAR (Donations) - Removed as per request (Growth Stage) */}
        {/* 
        <section id="ayudar" className="py-20 bg-muted/30">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground/50 uppercase tracking-widest text-sm mb-4">Colabora</h2>
            <p className="text-muted-foreground">Si deseas aportar tu granito de arena.</p>
          </div>
          <ComoAyudarSection />
        </section> 
        */}

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
