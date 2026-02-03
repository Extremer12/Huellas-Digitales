import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegionSelector from "@/components/RegionSelector";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ChevronRight, Heart, Search, Star, MapPin, Shield, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-adoption.jpg"; // Ensure this asset exists or use a fallback

const Index = () => {
  useScrollAnimation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showRegionSelector, setShowRegionSelector] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (!profileData?.country || !profileData?.province) {
        setShowRegionSelector(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">

        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2086&auto=format&fit=crop"
              alt="Mascota feliz"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>

          <div className="container relative z-10 px-4 md:px-6 pt-20">
            <div className="max-w-2xl animate-fade-in-up">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                La red más grande de rescate animal
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                Cada huella cuenta una <span className="text-primary">historia</span>.
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-lg">
                Conectamos corazones con patas. Huellas Digitales es la plataforma integral para adoptar, reportar perdidos y colaborar con refugios.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white text-lg px-8 h-14 rounded-full shadow-lg shadow-primary/25 transition-all hover:scale-105"
                  onClick={() => navigate("/adopcion")}
                >
                  Adoptar ahora <Heart className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-8 h-14 rounded-full backdrop-blur-sm transition-all"
                  onClick={() => navigate("/perdidos")}
                >
                  Reportar perdido <Search className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-white/50 rounded-full animate-scroll" />
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 bg-muted/30 relative">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Todo lo que necesitas en un solo lugar</h2>
              <p className="text-muted-foreground text-lg">Nuestra plataforma ofrece herramientas diseñadas para facilitar el bienestar animal y la conexión comunitaria.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 rounded-3xl bg-background border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="text-primary w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Adopción Responsable</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">Encuentra a tu compañero ideal con filtros avanzados de búsqueda y perfiles detallados.</p>
                <Button variant="ghost" className="p-0 hover:bg-transparent text-primary hover:text-primary/80" onClick={() => navigate("/adopcion")}>
                  Explorar adopciones <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-3xl bg-background border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="text-amber-500 w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Mapa Interactivo</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">Visualiza mascotas perdidas, refugios y veterinarias cercanas en tiempo real.</p>
                <Button variant="ghost" className="p-0 hover:bg-transparent text-amber-500 hover:text-amber-600" onClick={() => navigate("/mapa")}>
                  Ver mapa <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-3xl bg-background border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="text-rose-500 w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Seguridad y Confianza</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">Usuarios verificados y sistema de reportes para garantizar una comunidad segura.</p>
                <Button variant="ghost" className="p-0 hover:bg-transparent text-rose-500 hover:text-rose-600" onClick={() => navigate("/auth")}>
                  Únete ahora <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-black tracking-tighter counter-animate">2.5k+</div>
                <div className="text-primary-foreground/80 font-medium">Adopciones</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-black tracking-tighter counter-animate">1.2k+</div>
                <div className="text-primary-foreground/80 font-medium">Reencuentros</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-black tracking-tighter counter-animate">500+</div>
                <div className="text-primary-foreground/80 font-medium">Refugios</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-black tracking-tighter counter-animate">15k+</div>
                <div className="text-primary-foreground/80 font-medium">Usuarios</div>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-24 relative overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="relative rounded-[2.5rem] overflow-hidden bg-black text-white p-8 md:p-16 text-center shadow-2xl">
              {/* Background Glows */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">¿Listo para cambiar una vida?</h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Miles de animales esperan una segunda oportunidad. Tu próximo mejor amigo está a un clic de distancia.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-gray-100 text-lg px-8 h-14 rounded-full font-bold shadow-xl transition-transform hover:scale-105"
                    onClick={() => navigate("/auth")}
                  >
                    Comenzar ahora
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 text-lg px-8 h-14 rounded-full"
                    onClick={() => navigate("/historias")}
                  >
                    Leer historias de éxito
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      {showRegionSelector && user && (
        <RegionSelector
          open={showRegionSelector}
          userId={user.id}
          onRegionSet={() => {
            setShowRegionSelector(false);
            checkUser();
          }}
        />
      )}
    </div>
  );
};

export default Index;
