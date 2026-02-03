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
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mr-auto"> {/* Left aligned */}
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase mb-6 animate-fade-in backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
            Huellas Digitales
          </div>

          {/* Main Content */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-4 leading-[1.1] tracking-tight animate-fade-in text-balance">
            Tu ayuda <br />
            <span className="text-primary">cambia vidas</span>
          </h1>

          <p className="text-base md:text-lg mb-8 max-w-lg text-foreground/80 leading-relaxed font-medium animate-fade-in-slow text-pretty bg-background/50 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            Conectamos corazones. Adoptá, reportá o encontrá a tu mascota hoy.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-start animate-fade-in-slow">
            <Button
              onClick={() => navigate("/adopcion")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 rounded-xl shadow-lg shadow-primary/20 group transition-all"
            >
              <Heart className="w-5 h-5 mr-2 fill-current" />
              Adoptar Ahora
            </Button>

            <Button
              onClick={() => navigate("/perdidos")}
              variant="outline"
              className="bg-card/40 backdrop-blur-xl border-white/10 hover:bg-white/10 h-14 px-8 rounded-xl transition-all"
            >
              <Search className="w-5 h-5 mr-2 text-primary" />
              Mascotas Perdidas
            </Button>
          </div>

          {/* Minimal Trust Indicator */}
          <div className="mt-12 flex items-center gap-4 animate-fade-in-slow opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-card overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="Adopter" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-xs font-semibold tracking-wide">+500 Familias Unidas</div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;