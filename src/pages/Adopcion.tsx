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
                <div className="bg-gradient-to-b from-primary/10 to-transparent py-12">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-black mb-4">Adopción</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Encontrá a tu compañero perfecto entre cientos de animalitos que buscan un hogar lleno de amor.
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
