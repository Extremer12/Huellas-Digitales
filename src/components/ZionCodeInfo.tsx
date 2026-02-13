import { Globe, Instagram, Mail, Music2 } from "lucide-react";
import { Button } from "./ui/button";

const ZionCodeInfo = () => {
    return (
        <div className="p-4 rounded-2xl bg-card border border-primary/20 space-y-4 shadow-xl">
            <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 relative mb-2">
                    <img
                        src="/logo-sinfondo .png"
                        alt="Zion Code Logo"
                        className="w-full h-full object-contain filter drop-shadow-md"
                    />
                </div>
                <div className="flex items-center gap-2 text-primary">
                    <span className="font-black text-lg uppercase tracking-[0.2em]">Zion Code</span>
                </div>
            </div>

            <p className="text-sm text-balance text-muted-foreground leading-relaxed text-center">
                Huellas Digitales es un proyecto de innovación social desarrollado por <span className="font-bold text-foreground">Zion Code</span>.
                Nuestro objetivo es democratizar la tecnología para causas que importan.
            </p>

            <div className="grid grid-cols-4 gap-3 pt-2">
                <a
                    href="https://zion-code.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 group"
                    title="Sitio Web"
                >
                    <div className="p-3 rounded-xl bg-primary text-primary-foreground group-hover:scale-110 group-hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        <Globe className="w-5 h-5" />
                    </div>
                </a>

                <a
                    href="https://instagram.com/zioncode"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 group"
                    title="Instagram"
                >
                    <div className="p-3 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white group-hover:scale-110 group-hover:opacity-90 transition-all shadow-lg">
                        <Instagram className="w-5 h-5" />
                    </div>
                </a>

                <a
                    href="https://tiktok.com/@zioncode"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 group"
                    title="TikTok"
                >
                    <div className="p-3 rounded-xl bg-[#000000] text-white group-hover:scale-110 group-hover:opacity-90 transition-all shadow-lg">
                        <Music2 className="w-5 h-5" />
                    </div>
                </a>

                <a
                    href="mailto:info@zioncode.com"
                    className="flex flex-col items-center gap-1 group"
                    title="Email"
                >
                    <div className="p-3 rounded-xl bg-foreground text-background group-hover:scale-110 transition-all shadow-lg">
                        <Mail className="w-5 h-5" />
                    </div>
                </a>
            </div>
        </div>
    );
};

export default ZionCodeInfo;
