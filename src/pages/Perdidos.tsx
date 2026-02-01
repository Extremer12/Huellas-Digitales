import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LostPetsSection from "@/components/LostPetsSection";
import PublicarSection from "@/components/PublicarSection";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Perdidos = () => {
    useScrollAnimation();

    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-20">
                <div className="bg-gradient-to-b from-destructive/10 to-transparent py-12">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-black mb-4">Mascotas Perdidas</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Ayudanos a reunir a estas mascotas con sus familias. Si viste a alguno de ellos, por favor contactanos.
                        </p>
                    </div>
                </div>
                <LostPetsSection />
                <div id="publicar" className="bg-card py-20">
                    <PublicarSection />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Perdidos;
