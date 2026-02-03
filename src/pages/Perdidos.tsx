import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LostPetsSection from "@/components/LostPetsSection";
import LostPetsMap from "@/components/LostPetsMap";
import PublicarSection from "@/components/PublicarSection";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const Perdidos = () => {
    useScrollAnimation();

    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-20">
                <div className="bg-gradient-to-b from-destructive/10 to-transparent py-16 px-4">
                    <div className="container mx-auto text-center">
                        <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter">
                            Mascotas <span className="text-destructive">Perdidas</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium mb-10">
                            Ayudanos a reunir a estos amiguitos con sus familias. Tu ayuda es clave para su regreso.
                        </p>
                        <Button
                            size="lg"
                            className="h-14 px-10 text-lg font-bold btn-hero shadow-xl mx-auto"
                            onClick={() => {
                                const element = document.getElementById('publicar');
                                if (element) element.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <AlertTriangle className="w-5 h-5 mr-3" />
                            Reportar Mascota Perdida
                        </Button>
                    </div>
                </div>
                <LostPetsSection />
                <div id="publicar" className="bg-card py-20">
                    <PublicarSection />
                </div>
            </main>

        </div>
    );
};

export default Perdidos;
