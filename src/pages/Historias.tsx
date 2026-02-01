import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdoptedSection from "@/components/AdoptedSection";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Historias = () => {
    useScrollAnimation();

    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-20">
                <div className="bg-gradient-to-b from-primary/10 to-transparent py-12">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-black mb-4">Historias con Final Feliz</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Celebrando el amor y las segundas oportunidades. Estas son algunas de las historias que nos llenan el corazón.
                        </p>
                    </div>
                </div>
                <AdoptedSection />
            </main>
            <Footer />
        </div>
    );
};

export default Historias;
