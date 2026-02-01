import { PawPrint, Heart, Instagram, Mail, Globe, Video } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacto" className="bg-gradient-to-b from-foreground to-foreground/95 text-background border-t border-primary/20">
      <div className="section-padding">
        <div className="container-custom">
          {/* Main Content */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/20 p-2 rounded-full">
                  <PawPrint className="w-8 h-8 text-primary" />
                </div>
                <span className="text-2xl font-bold">Huellas Digitales</span>
              </div>
              <p className="text-background/70 leading-relaxed max-w-md">
                Conectando corazones y hogares a través de la tecnología. 
                Cada adopción es una segunda oportunidad para dar y recibir amor incondicional.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Contacto
              </h3>
              <div className="space-y-3">
                <a 
                  href="mailto:zioncode25@gmail.com" 
                  className="flex items-center gap-2 text-background/70 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">zioncode25@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-lg font-bold mb-4">Redes Sociales</h3>
              <div className="space-y-3">
                <a
                  href="https://www.instagram.com/zioncode.ar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-background/70 hover:text-primary transition-colors group"
                >
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">Instagram</span>
                </a>
                <a
                  href="https://www.tiktok.com/@zioncode.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-background/70 hover:text-primary transition-colors group"
                >
                  <Video className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">TikTok</span>
                </a>
                <a
                  href="https://zion-code.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-background/70 hover:text-primary transition-colors group"
                >
                  <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">Sitio Web</span>
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-background/10 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Copyright and Legal */}
              <div className="flex flex-col sm:flex-row items-center gap-2 text-background/50 text-sm">
                <p>
                  © {currentYear} Huellas Digitales. Todos los derechos reservados.
                </p>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline">|</span>
                  <a href="/terms" className="hover:text-primary transition-colors">
                    Términos y Condiciones
                  </a>
                  <span>•</span>
                  <a href="/privacy" className="hover:text-primary transition-colors">
                    Privacidad
                  </a>
                </div>
              </div>

              {/* Made with love */}
              <div className="flex items-center gap-2 text-background/50 text-sm">
                <span>Desarrollado con</span>
                <Heart className="w-4 h-4 text-primary fill-primary animate-float" />
                <span>por</span>
                <a 
                  href="https://zion-code.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  Zion Code
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
