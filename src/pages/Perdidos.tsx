import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LostPetsSection from "@/components/LostPetsSection";
import LostPetsMap from "@/components/LostPetsMap";
import PublicarSection from "@/components/PublicarSection";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Perdidos = () => {
    useScrollAnimation();

    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-20">
                <div className="bg-gradient-to-b from-destructive/10 to-transparent pt-12">
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
