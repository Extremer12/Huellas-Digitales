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
                    <div className="p-3 rounded-xl bg-[#000000] text-white group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,0,80,0.5)] transition-all shadow-lg flex items-center justify-center">
                        <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5c0 1.91-1.1 3.83-2.94 4.6-1.84.77-4.14.33-5.51-1.03-1.37-1.36-1.81-3.66-1.04-5.5.77-1.84 2.69-2.94 4.6-2.94.39 0 .78.04 1.16.12-.03-1.49-.03-2.98-.03-4.47-2.52-.31-5.06.84-6.3 3.03-1.24 2.19-.88 5.03.88 6.79 1.76 1.76 4.6 2.12 6.79.88 1.19-.68 2.06-1.78 2.44-3.08V0l.85.02Z" />
                        </svg>
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
