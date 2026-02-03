import Header from "@/components/Header";
import ComoAyudarSection from "@/components/ComoAyudarSection";
import { useEffect } from "react";

const Colaborar = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-24 pb-12">
                <div className="container-custom text-center mb-12">
                    <h1 className="text-4xl font-black mb-4">¿Cómo Colaborar?</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Tu ayuda es fundamental para que podamos seguir rescatando y cuidando animales.
                    </p>
                </div>
                <ComoAyudarSection />
            </main>
        </div>
    );
};

export default Colaborar;
