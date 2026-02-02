import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimalesSection from "@/components/AnimalesSection";
import PublicarSection from "@/components/PublicarSection";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Adopcion = () => {
    useScrollAnimation();

    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-20">
                <div className="bg-gradient-to-b from-primary/10 to-transparent py-16 px-4">
                    <div className="container mx-auto text-center">
                        <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter">
                            Encontrá tu <span className="text-primary">Huella</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                            Cientos de animalitos buscan un hogar lleno de amor. Explorá y encontrá a tu próximo mejor amigo.
                        </p>
                    </div>
                </div>
                <AnimalesSection />
                <div className="bg-card py-20">
                    <PublicarSection />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Adopcion;
