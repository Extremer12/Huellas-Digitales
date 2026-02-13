import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdoptedSection from "@/components/AdoptedSection";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion } from "framer-motion";

const Historias = () => {
    useScrollAnimation();

    return (
        <div className="min-h-screen bg-[#fafaf8]">
            <Header />
            <main className="pt-20">
                <section className="relative py-24 overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-top-left" />
                    <div className="container mx-auto px-4 relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center space-y-6"
                        >
                            <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm">Crónicas de Amor</span>
                            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground leading-none">
                                Historias con <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 italic">Final Feliz</span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                                Cada adopción es el comienzo de una nueva vida. Celebramos las segundas oportunidades que transformaron hogares.
                            </p>
                            <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full" />
                        </motion.div>
                    </div>
                </section>

                <AdoptedSection />
            </main>
            <Footer />
        </div>
    );
};

export default Historias;
