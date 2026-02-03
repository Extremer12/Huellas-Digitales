import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Heart, Search, PawPrint, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Adopcion = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 pt-20">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden bg-primary/5">
                    <div className="container px-4 md:px-6 relative z-10">
                        <div className="max-w-3xl mx-auto text-center space-y-6">
                            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                                <Heart className="w-4 h-4 mr-2 fill-current" />
                                Adopción Responsable
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
                                Encuentra a tu <span className="text-primary">compañero ideal</span> de cuatro patas
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Adoptar es un acto de amor que cambia vidas. Aquí te explicamos cómo funciona nuestro proceso para garantizar finales felices.
                            </p>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
                </section>

                {/* Steps Section */}
                <section className="py-20">
                    <div className="container px-4 md:px-6">
                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Step 1 */}
                            <div className="bg-card p-8 rounded-[2rem] border border-border/50 shadow-sm hover:shadow-lg transition-all text-center group">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Search className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">1. Explora</h3>
                                <p className="text-muted-foreground">
                                    Navega por nuestro feed de adopciones. Puedes filtrar por especie, edad, tamaño y ubicación para encontrar a tu compañero ideal.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-card p-8 rounded-[2rem] border border-border/50 shadow-sm hover:shadow-lg transition-all text-center group">
                                <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <PawPrint className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">2. Conecta</h3>
                                <p className="text-muted-foreground">
                                    Contacta directamente con el protector o refugio a través de nuestro chat seguro. Haz preguntas y conoce su historia.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-card p-8 rounded-[2rem] border border-border/50 shadow-sm hover:shadow-lg transition-all text-center group">
                                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">3. Adopta</h3>
                                <p className="text-muted-foreground">
                                    Coordina la adopción responsable. ¡Felicidades! Has salvado una vida y ganado un amigo incondicional para siempre.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-muted/30">
                    <div className="container px-4 text-center">
                        <h2 className="text-3xl font-black mb-8">¿Listo para dar el siguiente paso?</h2>

                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Button
                                size="lg"
                                className="h-16 px-8 text-lg rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
                                onClick={() => navigate("/")}
                            >
                                <Search className="mr-2 w-5 h-5" /> Ver mascotas en adopción
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="h-16 px-8 text-lg rounded-full font-bold border-2 hover:bg-background hover:scale-105 transition-transform"
                                onClick={() => navigate("/?action=publish&type=adoption")}
                            >
                                <PawPrint className="mr-2 w-5 h-5" /> Publicar una mascota
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Adopcion;
