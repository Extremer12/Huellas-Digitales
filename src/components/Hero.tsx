import { Heart, PawPrint, ChevronRight, PlayCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-adoption.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Immersive Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Mascota esperando ser adoptada"
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold tracking-widest uppercase mb-6 animate-fade-in shadow-lg backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Conectando Corazones
          </div>

          {/* Main Content */}
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black mb-6 leading-[0.9] tracking-tighter animate-fade-in drop-shadow-2xl">
            CADA HUELLA <br />
            <span className="text-primary italic">CUENTA</span> UNA <br />
            HISTORIA
          </h1>

          <p className="text-xl md:text-2xl mb-12 max-w-2xl text-foreground/80 leading-relaxed font-medium animate-fade-in-slow">
            No solo estás adoptando una mascota, estás salvando una vida y ganando un amigo para siempre. Descubrí el impacto de una adopción responsable.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-start animate-fade-in-slow">
            <Button
              onClick={() => navigate("/adopcion")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-8 px-10 rounded-2xl shadow-2xl shadow-primary/30 group transition-all duration-500 hover:scale-105 active:scale-95"
            >
              <Heart className="w-6 h-6 mr-3 fill-current group-hover:scale-125 transition-transform" />
              Adoptar Ahora
              <ChevronRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Button>

            <Button
              onClick={() => navigate("/perdidos")}
              variant="outline"
              className="bg-card/40 backdrop-blur-xl border-white/10 hover:bg-white/10 text-lg py-8 px-10 rounded-2xl shadow-xl group transition-all duration-500"
            >
              <Search className="w-6 h-6 mr-3 text-primary group-hover:rotate-12 transition-transform" />
              Mascotas Perdidas
            </Button>
          </div>

          {/* Trust Elements */}
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-8 items-center animate-fade-in-slow">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-card flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Adopter" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div>
              <div className="text-lg font-bold">+500 Vidas Unidas</div>
              <div className="text-sm text-foreground/60 italic">Historias reales de amor incondicional</div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Accents */}
      <div className="absolute bottom-10 right-10 hidden xl:block">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 group-hover:bg-primary/40 transition-colors"></div>
          <PlayCircle className="w-20 h-20 text-white/50 relative z-10 cursor-pointer hover:text-primary transition-colors hover:scale-110" />
        </div>
      </div>
    </section>
  );
};

export default Hero;