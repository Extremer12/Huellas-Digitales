import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PublicarSection from "@/components/PublicarSection";
import AnimalesSection from "@/components/AnimalesSection";
import ComoAyudarSection from "@/components/ComoAyudarSection";
import Footer from "@/components/Footer";
import RegionSelector from "@/components/RegionSelector";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ChevronRight, Heart, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />

        {/* Features Preview Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-primary/5 -skew-y-3 origin-top-left -z-10"></div>
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group p-8 rounded-[2rem] bg-card border border-border/50 shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <Heart className="text-primary w-8 h-8 fill-primary/20" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter text-foreground group-hover:text-primary transition-colors">Adopción</h3>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">Descubrí a tu próximo mejor amigo en nuestra galería de animales que buscan hogar.</p>
                <Button
                  variant="ghost"
                  className="p-0 text-primary text-lg font-bold hover:bg-transparent group/btn"
                  onClick={() => navigate("/adopcion")}
                >
                  Ver todos <ChevronRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </Button>
              </div>

              <div className="group p-8 rounded-[2rem] bg-card border border-border/50 shadow-2xl hover:shadow-destructive/10 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <Search className="text-destructive w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter text-foreground group-hover:text-destructive transition-colors">Perdidos</h3>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">Ayudanos a reunir familias reportando avistamientos o buscando mascotas perdidas.</p>
                <Button
                  variant="ghost"
                  className="p-0 text-destructive text-lg font-bold hover:bg-transparent group/btn"
                  onClick={() => navigate("/perdidos")}
                >
                  Ayudar ahora <ChevronRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </Button>
              </div>

              <div className="group p-8 rounded-[2rem] bg-card border border-border/50 shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <Star className="text-amber-500 w-8 h-8 fill-amber-500/20" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter text-foreground group-hover:text-amber-500 transition-colors">Historias</h3>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">Leé historias reales de segundas oportunidades que nos llenan de esperanza.</p>
                <Button
                  variant="ghost"
                  className="p-0 text-amber-500 text-lg font-bold hover:bg-transparent group/btn"
                  onClick={() => navigate("/historias")}
                >
                  Leer finales felices <ChevronRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Highlight Section */}
        <section className="py-32">
          <div className="container mx-auto px-4 md:px-6 flex flex-col items-center">
            <div className="w-full mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">Mascotas Disponibles</div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">NUEVOS <br /> <span className="text-primary italic">INGRESOS</span></h2>
                <p className="text-xl text-muted-foreground font-medium">Conocé a los últimos integrantes que se sumaron a nuestra comunidad buscando una familia.</p>
              </div>
              <Button
                onClick={() => navigate("/adopcion")}
                className="rounded-2xl h-16 px-8 text-lg font-bold bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xl"
              >
                Ver todos los animales
              </Button>
            </div>
            <div className="w-full">
              <AnimalesSection />
            </div>
          </div>
        </section>

        <section id="ayudar" className="py-20 bg-card relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
          <ComoAyudarSection />
        </section>

        <section id="contacto" className="py-32 bg-background">
          <PublicarSection />
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
