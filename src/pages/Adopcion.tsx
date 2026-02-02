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
                <div className="bg-gradient-to-b from-primary/10 to-transparent pt-12">
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
