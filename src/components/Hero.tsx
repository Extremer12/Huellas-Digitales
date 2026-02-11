import { motion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-adoption.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="w-full h-full"
        >
          <img
            src={heroImage}
            alt="Conexión emocional"
            className="w-full h-full object-cover object-center brightness-50"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />
      </div>

      <div className="relative z-10 container px-4 md:px-6 flex flex-col items-center text-center">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="space-y-6 max-w-4xl"
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-none mix-blend-overlay opacity-90">
            HUELLAS
          </h1>
          <p className="text-xl md:text-2xl font-light text-gray-200/90 tracking-wide max-w-xl mx-auto">
            La plataforma definitiva de bienestar animal.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row gap-6"
        >
          <Button
            onClick={() => navigate("/adopcion")}
            className="bg-white text-black hover:bg-white/90 text-lg h-14 px-10 rounded-full font-medium transition-transform hover:scale-105"
          >
            Comenzar
          </Button>
          <Button
            onClick={() => navigate("/mapa")}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 text-lg h-14 px-10 rounded-full backdrop-blur-md transition-transform hover:scale-105"
          >
            Ver Mapa <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>

      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 animate-bounce"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>

    </section>
  );
};

export default Hero;