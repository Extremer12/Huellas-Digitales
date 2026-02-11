import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegionSelector from "@/components/RegionSelector";
import UnifiedFeed from "@/components/UnifiedFeed";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Heart, MapPin, Shield, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import SmartPublicationWizard from "@/components/SmartPublicationWizard";
import Hero from "@/components/Hero";
import { motion } from "framer-motion";
import OrgRequestModal from "@/components/OrgRequestModal";
import { Building2, Stethoscope } from "lucide-react";
import HowItWorks from "@/components/HowItWorks";
import SeoHead from "@/components/SeoHead";

const Index = () => {
  useScrollAnimation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [viewLanding, setViewLanding] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    animals: 0,
    orgs: 0
  });

  useEffect(() => {
    checkUser();
    fetchStats();
    if (searchParams.get("action") === "publish") {
      setShowWizard(true);
    }
  }, [searchParams]);

  const fetchStats = async () => {
    try {
      const [{ count: usersCount }, { count: animalsCount }, { count: orgsCount }] = await Promise.all([
        supabase.from("profiles").select("*", { count: 'exact', head: true }),
        supabase.from("animals").select("*", { count: 'exact', head: true }),
        supabase.from("organizations").select("*", { count: 'exact', head: true })
      ]);

      setStats({
        users: usersCount || 0,
        animals: animalsCount || 0,
        orgs: orgsCount || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

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
      <SeoHead />
      <Header minimal={true} />

      <main className="flex-1">
        <Hero />

        {/* IMPACT & INFO SECTION (Previously in Hero) */}
        <section className="py-20 bg-background relative z-10 -mt-10 rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] border-t border-white/5">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Plataforma en Crecimiento
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Datos que <span className="text-primary">importan.</span></h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Huellas Digitales no es solo un sitio web, es una red viva de colaboración.
                  Mantenemos un estricto control sobre nuestra comunidad.
                </p>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                  <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                  <p className="font-medium text-sm">
                    Importante: Prohibida estrictamente la venta de animales.
                    Detectamos y bloqueamos automáticamente cuentas sospechosas.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="p-6 rounded-3xl bg-secondary/30 backdrop-blur-sm border border-border/50 hover:bg-secondary/50 transition-colors">
                  <div className="text-4xl font-black mb-2 text-primary">+{stats.orgs}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Instituciones</div>
                </div>
                <div className="p-6 rounded-3xl bg-secondary/30 backdrop-blur-sm border border-border/50 hover:bg-secondary/50 transition-colors translate-y-8">
                  <div className="text-4xl font-black mb-2 text-purple-500">+{stats.animals}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Mascotas</div>
                </div>
                <div className="p-6 rounded-3xl bg-secondary/30 backdrop-blur-sm border border-border/50 hover:bg-secondary/50 transition-colors">
                  <div className="text-4xl font-black mb-2 text-emerald-500">+{stats.users}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Usuarios</div>
                </div>
                <div className="p-6 rounded-3xl bg-secondary/30 backdrop-blur-sm border border-border/50 hover:bg-secondary/50 transition-colors translate-y-8">
                  <div className="text-4xl font-black mb-2 text-amber-500">Gratis</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Para Todos</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <HowItWorks />

        {/* FEATURES GRID */}
        <section className="py-32 bg-background relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-2xl mx-auto mb-20"
            >
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-foreground">El ecosistema completo</h2>
              <p className="text-muted-foreground text-xl leading-relaxed">Tecnología al servicio de quienes no tienen voz.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -10 }}
                className="group p-8 rounded-[2rem] bg-card border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Adopción Responsable</h3>
                <p className="text-muted-foreground leading-relaxed">Algoritmos de emparejamiento que aseguran hogares definitivos y compatibles.</p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -10 }}
                className="group p-8 rounded-[2rem] bg-card border border-border/50 hover:border-amber-500/50 shadow-sm hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="text-amber-500 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Geolocalización Real</h3>
                <p className="text-muted-foreground leading-relaxed">Mapa interactivo con capas de información para perdidos, veterinarias y refugios.</p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -10 }}
                className="group p-8 rounded-[2rem] bg-card border border-border/50 hover:border-rose-500/50 shadow-sm hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="text-rose-500 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Entorno Seguro</h3>
                <p className="text-muted-foreground leading-relaxed">Verificación de identidad y sistema de reportes comunitario para evitar fraudes.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ORGANIZATIONS & VETERINARIES SECTION */}
        <section className="py-24 bg-secondary/10">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-card to-background border border-primary/20 overflow-hidden shadow-2xl">
              <div className="grid md:grid-cols-2">
                <div className="p-12 space-y-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="text-primary w-6 h-6" />
                  </div>
                  <h2 className="text-4xl font-black tracking-tight">Potenciamos a tu <span className="text-primary">Organización</span></h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Si eres veterinaria, refugio o rescatista independiente, Huellas Digitales es tu mejor aliado.
                    Regístrate para aparecer en nuestro mapa interactivo y formar parte de una red colaborativa por el bienestar animal.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <Stethoscope className="w-4 h-4 text-primary" /> Verificación oficial de tu clínica
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-primary" /> Posicionamiento GEO para urgencias
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <Shield className="w-4 h-4 text-primary" /> Acceso a herramientas de gestión
                    </li>
                  </ul>
                  <div className="pt-4">
                    <OrgRequestModal />
                  </div>
                </div>
                <div className="hidden md:block bg-[url('https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center grayscale-[0.5] hover:grayscale-0 transition-all duration-700" />
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-32 relative overflow-hidden bg-foreground text-background">
          <div className="container px-4 relative z-10">
            <div className="flex flex-col items-center text-center space-y-8">
              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-8xl font-black tracking-tighter"
              >
                EMPIEZA <span className="text-primary">AHORA</span>
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90 text-xl h-20 px-12 rounded-full font-bold shadow-2xl transition-transform hover:scale-110"
                  onClick={() => navigate("/auth")}
                >
                  Crear Cuenta Gratis <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Abstract Background Shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50vh] h-[50vh] bg-primary rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vh] h-[60vh] bg-blue-600 rounded-full blur-[120px]" />
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
    </div >
  );
};

export default Index;
