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
import { ChevronRight, Heart, Search, Star, MapPin } from "lucide-react";
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
        <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Adopción */}
              <div className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Heart className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">Adopción</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">Encontrá a tu compañero ideal en nuestra galería.</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary text-sm font-semibold hover:no-underline group/btn"
                  onClick={() => navigate("/adopcion")}
                >
                  Ver galería <ChevronRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Card 2: Perdidos */}
              <div className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-destructive/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-6">
                  <Search className="text-destructive w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">Perdidos</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">Reportá avistamientos o ayudá a buscar.</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-destructive text-sm font-semibold hover:no-underline group/btn"
                  onClick={() => navigate("/perdidos")}
                >
                  Ayudar ahora <ChevronRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Card 3: Historias */}
              <div className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-amber-500/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                  <Star className="text-amber-500 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">Historias</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">Conocé los finales felices y compartí el tuyo.</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-amber-500 text-sm font-semibold hover:no-underline group/btn"
                  onClick={() => navigate("/historias")}
                >
                  Leer más <ChevronRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Card 4: Mapa Interactivo (NEW) */}
              <div className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-blue-500/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <MapPin className="text-blue-500 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">Mapa</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">Explorá mascotas y reportes cerca de vos.</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-500 text-sm font-semibold hover:no-underline group/btn"
                  onClick={() => navigate("/mapa")}
                >
                  Ver mapa <ChevronRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>


        <section id="ayudar" className="py-16 bg-card/20 min-h-0">
          <ComoAyudarSection />
        </section>

        <section id="contacto" className="py-20 bg-background">
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
