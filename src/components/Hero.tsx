import { motion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-adoption.jpg";

interface HeroProps {
  onStart?: () => void;
}

const Hero = ({ onStart }: HeroProps) => {
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
          className="space-y-6 max-w-4xl"
        >
          <motion.div
            className="flex flex-col items-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                }
              }
            }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-white leading-none mix-blend-overlay opacity-90 uppercase">
              {"HUELLAS".split("").map((char, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 50, rotateX: -90 },
                    visible: { opacity: 1, y: 0, rotateX: 0 }
                  }}
                  transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </h1>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-primary leading-none mt-[-1rem] md:mt-[-2rem] opacity-90 uppercase">
              {"DIGITALES".split("").map((char, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, scale: 0.5, filter: "blur(10px)" },
                    visible: { opacity: 1, scale: 1, filter: "blur(0px)" }
                  }}
                  transition={{ duration: 1, delay: 0.8 + (i * 0.05) }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="text-xl md:text-2xl font-light text-gray-200/90 tracking-wide max-w-xl mx-auto"
          >
            La plataforma definitiva de bienestar animal.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row gap-6"
        >
          <Button
            onClick={onStart ? onStart : () => navigate("/auth")}
            className="bg-white text-black hover:bg-white/90 text-lg h-14 px-10 rounded-full font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            Comenzar
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