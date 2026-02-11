import { motion } from "framer-motion";
import { UserPlus, Search, MessageCircle, Heart } from "lucide-react";

const HowItWorks = () => {
    const steps = [
        {
            icon: <UserPlus className="w-8 h-8 text-primary" />,
            title: "1. Crea tu Cuenta",
            desc: "Regístrate gratis para acceder a todas las funciones: publicar, adoptar y contactar.",
            color: "bg-primary/10"
        },
        {
            icon: <Search className="w-8 h-8 text-purple-500" />,
            title: "2. Explora o Publica",
            desc: "Busca animales por cercanía o publica una mascota perdida/en adopción en segundos.",
            color: "bg-purple-500/10"
        },
        {
            icon: <MessageCircle className="w-8 h-8 text-emerald-500" />,
            title: "3. Conecta",
            desc: "Chatea directamente con dueños o refugios a través de nuestra mensajería segura.",
            color: "bg-emerald-500/10"
        },
        {
            icon: <Heart className="w-8 h-8 text-rose-500" />,
            title: "4. Final Feliz",
            desc: "Concreta la adopción o el reencuentro. ¡Tu acción cambia una vida!",
            color: "bg-rose-500/10"
        }
    ];

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <div className="container px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">¿Cómo funciona?</h2>
                    <p className="text-xl text-muted-foreground">La tecnología más avanzada, simplificada para vos.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="relative group"
                        >
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-border/50 -z-10" />
                            )}

                            <div className="bg-card hover:bg-secondary/50 border border-border/50 hover:border-primary/20 p-8 rounded-[2rem] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl text-center h-full">
                                <div className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    {step.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
