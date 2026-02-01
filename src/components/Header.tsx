import { Menu, LogIn, LogOut, User, Heart, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuthAndRole();

    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAuthAndRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    if (session) {
      await checkAdminRole(session.user.id);
    }
  };

  const checkAdminRole = async (userId: string) => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const hasAdminAccess = roles?.some(r => r.role === "admin" || r.role === "moderator");
    setIsAdmin(!!hasAdminAccess);
  };
  const scrollToSection = (id: string) => {
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth"
          });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth"
        });
      }
    }
    setIsOpen(false);
  };
  const handleAuth = async () => {
    if (isAuthenticated) {
      await supabase.auth.signOut();
      navigate("/");
    } else {
      navigate("/auth");
    }
    setIsOpen(false);
  };
  const handleProfile = () => {
    navigate("/profile");
    setIsOpen(false);
  };
  return <header className="fixed top-0 w-full bg-card/98 backdrop-blur-md shadow-[var(--shadow-soft)] z-50 border-b border-border/50">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="Huellas Digitales" className="h-20 w-auto" />
            <span className="text-2xl font-bold text-foreground hidden sm:block">
              Huellas Digitales
            </span>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button onClick={handleAuth} variant="outline" size="sm">
              {isAuthenticated ? <><LogOut className="w-4 h-4 mr-2" />Cerrar Sesión</> : <><LogIn className="w-4 h-4 mr-2" />Iniciar Sesión</>}
            </Button>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menú</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Button onClick={() => scrollToSection("hero")} variant="ghost" className="justify-start text-base">
                    Inicio
                  </Button>
                  <Button onClick={() => scrollToSection("publicar")} variant="ghost" className="justify-start text-base">
                    Compartir
                  </Button>
                  <Button onClick={() => scrollToSection("animales")} variant="ghost" className="justify-start text-base">
                    Ver Animales
                  </Button>
                  <Button onClick={() => scrollToSection("adoptados")} variant="ghost" className="justify-start text-base">
                    <Heart className="w-4 h-4 mr-2" />
                    Adoptados
                  </Button>
                  <Button onClick={() => scrollToSection("ayudar")} variant="ghost" className="justify-start text-base">
                    Cómo Ayudar
                  </Button>
                  <Button onClick={() => scrollToSection("contacto")} variant="ghost" className="justify-start text-base">
                    Contacto
                  </Button>
                {isAuthenticated && <Button onClick={handleProfile} variant="ghost" className="justify-start text-base">
                    <User className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </Button>}
                {isAdmin && <Button onClick={() => { navigate("/admin"); setIsOpen(false); }} variant="ghost" className="justify-start text-base">
                    <Shield className="w-4 h-4 mr-2" />
                    Administración
                  </Button>}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <Button onClick={() => scrollToSection("hero")} variant="ghost" className="justify-start text-base">
                  Inicio
                </Button>
                <Button onClick={() => scrollToSection("publicar")} variant="ghost" className="justify-start text-base">
                  Compartir
                </Button>
                <Button onClick={() => scrollToSection("animales")} variant="ghost" className="justify-start text-base">
                  Ver Animales
                </Button>
                <Button onClick={() => scrollToSection("adoptados")} variant="ghost" className="justify-start text-base">
                  <Heart className="w-4 h-4 mr-2" />
                  Adoptados
                </Button>
                <Button onClick={() => scrollToSection("ayudar")} variant="ghost" className="justify-start text-base">
                  Cómo Ayudar
                </Button>
                <Button onClick={() => scrollToSection("contacto")} variant="ghost" className="justify-start text-base">
                  Contacto
                </Button>
                {isAuthenticated && <Button onClick={handleProfile} variant="ghost" className="justify-start text-base">
                    <User className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </Button>}
                <Button onClick={handleAuth} className="mt-4">
                  {isAuthenticated ? <><LogOut className="w-4 h-4 mr-2" />Cerrar Sesión</> : <><LogIn className="w-4 h-4 mr-2" />Iniciar Sesión</>}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>;
};
export default Header;