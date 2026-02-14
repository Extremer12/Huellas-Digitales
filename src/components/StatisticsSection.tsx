
import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, useTransform, useInView } from "framer-motion";
import { Building2, PawPrint, Users, AlertTriangle } from "lucide-react";
import { useRef } from "react";

interface StatsProps {
    stats: {
        users: number;
        animals: number;
        orgs: number;
    };
}

const AnimatedNumber = ({ value }: { value: number }) => {
    const ref = useRef(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { damping: 50, stiffness: 100 });
    const isInView = useInView(ref, { once: true, margin: "-10px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, motionValue, value]);

    const rounded = useTransform(springValue, (latest) => Math.floor(latest));

    return (
        <motion.span ref={ref}>
            {rounded}
        </motion.span>
    );
};

const StatisticsSection = ({ stats }: StatsProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
            {/* Organizations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-card/30 backdrop-blur-md border border-white/5 hover:border-primary/20 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all hover:bg-card/50 hover:shadow-xl hover:shadow-primary/5"
            >
                <div className="mb-4 p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-8 h-8" />
                </div>
                <div className="text-4xl lg:text-5xl font-black text-foreground mb-1 flex items-center gap-1">
                    <span className="text-primary text-2xl">+</span>
                    <AnimatedNumber value={stats.orgs} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Instituciones</p>
            </motion.div>

            {/* Animals */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="group relative bg-card/30 backdrop-blur-md border border-white/5 hover:border-purple-500/20 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all hover:bg-card/50 hover:shadow-xl hover:shadow-purple-500/5"
            >
                <div className="mb-4 p-3 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform duration-300">
                    <PawPrint className="w-8 h-8" />
                </div>
                <div className="text-4xl lg:text-5xl font-black text-foreground mb-1 flex items-center gap-1">
                    <span className="text-purple-500 text-2xl">+</span>
                    <AnimatedNumber value={stats.animals} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Mascotas</p>
            </motion.div>

            {/* Users */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="col-span-1 sm:col-span-2 lg:col-span-1 group relative bg-card/30 backdrop-blur-md border border-white/5 hover:border-emerald-500/20 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all hover:bg-card/50 hover:shadow-xl hover:shadow-emerald-500/5 overflow-visible"
            >
                <div className="absolute -top-3 right-4 z-20">
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border-2 border-background animate-pulse">
                        100% GRATIS
                    </span>
                </div>
                <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8" />
                </div>
                <div className="text-4xl lg:text-5xl font-black text-foreground mb-1 flex items-center gap-1">
                    <span className="text-emerald-500 text-2xl">+</span>
                    <AnimatedNumber value={stats.users} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Usuarios Unidos</p>
            </motion.div>
        </div>
    );
};

export default StatisticsSection;
