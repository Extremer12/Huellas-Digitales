import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Search, MapPin, AlertTriangle, Share2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Perdidos = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 pt-20">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden bg-destructive/5">
                    <div className="container px-4 md:px-6 relative z-10">
                        <div className="max-w-3xl mx-auto text-center space-y-6">
                            <div className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive mb-4">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Reporte de Perdidos
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
                                Ayudemos a que <span className="text-destructive">todos vuelvan a casa</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                El tiempo es crítico. Nuestra comunidad activa y el mapa interactivo son tus mejores aliados para encontrar a tu mascota perdida.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Instructions Section */}
                <section className="py-20">
                    <div className="container px-4 md:px-6">
                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Step 1 */}
                            <div className="bg-card p-8 rounded-[2rem] border border-border/50 shadow-sm hover:shadow-lg transition-all text-center group">
                                <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">1. Reporta</h3>
                                <p className="text-muted-foreground">
                                    Publica inmediatamente con fotos y la ubicación exacta. Tu reporte aparecerá en el mapa y notificaremos a usuarios cercanos.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-card p-8 rounded-[2rem] border border-border/50 shadow-sm hover:shadow-lg transition-all text-center group">
                                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Share2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">2. Difunde</h3>
                                <p className="text-muted-foreground">
                                    Comparte la ficha generada en redes sociales y grupos de WhatsApp. Cuanta más gente lo vea, mayor probabilidad de éxito.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-card p-8 rounded-[2rem] border border-border/50 shadow-sm hover:shadow-lg transition-all text-center group">
                                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Search className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">3. Busca</h3>
                                <p className="text-muted-foreground">
                                    Revisa constantemente los avistamientos reportados por la comunidad. Mantén la esperanza y revisa el mapa frecuentemente.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-muted/30">
                    <div className="container px-4 text-center">
                        <h2 className="text-3xl font-black mb-8">Actúa ahora</h2>

                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Button
                                size="lg"
                                variant="destructive"
                                className="h-16 px-8 text-lg rounded-full font-bold shadow-xl shadow-destructive/20 hover:scale-105 transition-transform"
                                onClick={() => navigate("/?action=publish&type=lost")}
                            >
                                <AlertTriangle className="mr-2 w-5 h-5" /> Reportar mascota perdida
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="h-16 px-8 text-lg rounded-full font-bold border-2 hover:bg-background hover:scale-105 transition-transform"
                                onClick={() => navigate("/")}
                            >
                                <Search className="mr-2 w-5 h-5" /> Ver mascotas perdidas
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Perdidos;
