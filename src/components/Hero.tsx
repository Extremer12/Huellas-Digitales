import { Heart, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-adoption.jpg";
const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  return <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Mascota esperando ser adoptada" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-background/95"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Animated Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-8xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-2xl animate-fade-in-out text-orange-300 md:text-7xl">
            Huellas Digitales
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl mb-12 max-w-2xl mx-auto text-white/95 drop-shadow-lg animate-fade-in-slow md:text-lg font-light">
            Conectando corazones con mascotas que necesitan un hogar. Cada adopción es una segunda oportunidad.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-slow">
            <Button onClick={() => scrollToSection("animales")} size="lg" className="btn-hero text-base sm:text-lg w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-6 shadow-2xl">
              <Heart className="w-5 h-5 mr-2" />
              Ver Mascotas
            </Button>
            
            <Button onClick={() => scrollToSection("publicar")} size="lg" className="btn-secondary text-base sm:text-lg w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-6 shadow-2xl">
              <PawPrint className="w-5 h-5 mr-2" />
              Compartir
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            
            
            
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;