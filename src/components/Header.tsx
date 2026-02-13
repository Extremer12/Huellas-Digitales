import { Menu, LogIn, LogOut, User, Heart, Shield, PlusCircle, Search, HelpCircle, Mail, MessageSquare, LayoutTemplate, Info, Globe, Facebook, Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ZionCodeInfo from "./ZionCodeInfo";
import logo from "@/assets/logo.png";

interface HeaderProps {
  minimal?: boolean;
}

const Header = ({ minimal = false }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    if (location.pathname !== "/") {
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
      window.location.href = "/"; // Force full reload to Ensure Landing View
    } else {
      navigate("/auth");
    }
    setIsOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  const navLinks = [
    { name: "Inicio", path: "/", type: "path" },
    { name: "Adopción", path: "/adopcion", type: "link" },
    { name: "Perdidos", path: "/perdidos", type: "link" },
    { name: "Mapa", path: "/mapa", type: "link" },
    { name: "Historias", path: "/historias", type: "link" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
        ? "bg-card/95 backdrop-blur-md shadow-lg py-1.5 border-border/50"
        : "bg-transparent py-3 border-transparent"
        }`}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="relative overflow-hidden rounded-full p-0.5 bg-white/5 group-hover:bg-white/10 transition-colors">
              <img src={logo} alt="Huellas Digitales" className="h-10 w-10 object-contain" />
            </div>
            <span className="text-lg lg:text-xl font-black tracking-tighter text-foreground hidden sm:block">
              HUELLAS <span className="text-primary">DIGITALES</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          {!minimal && (
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                link.type === "section" ? (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.path)}
                    className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors py-2 relative group"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </button>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm font-medium py-2 relative group ${location.pathname === link.path ? "text-primary px-1" : "text-foreground/70 hover:text-primary"
                      }`}
                  >
                    {link.name}
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === link.path ? "w-full" : "w-0 group-hover:w-full"
                      }`}></span>
                  </Link>
                )
              ))}
            </nav>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button
                    onClick={() => navigate("/admin")}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                )}
                <Button
                  onClick={handleProfile}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Perfil
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 group hover:bg-white/5 transition-all">
                      <div className="w-6 h-6 rounded-lg bg-white/10 p-1 group-hover:bg-primary transition-colors overflow-hidden">
                        <img src="/logo-sinfondo .png" className="w-full h-full object-contain" alt="ZC" />
                      </div>
                      <span className="font-bold text-xs uppercase tracking-widest text-muted-foreground group-hover:text-primary">Zion Code</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 border-none bg-transparent shadow-none" align="end" sideOffset={10}>
                    <ZionCodeInfo />
                  </PopoverContent>
                </Popover>

                <Button
                  onClick={handleAuth}
                  variant="outline"
                  size="sm"
                  className="border-primary/20 hover:border-primary/50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleAuth}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-6"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Ingresar
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10" aria-label="Abrir menú">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l border-primary/10 bg-card">
                <SheetHeader className="text-left mb-8">
                  <SheetTitle className="text-2xl font-black">MENÚ</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2">
                  {!minimal && navLinks.map((link) => (
                    link.type === "section" ? (
                      <Button
                        key={link.name}
                        variant="ghost"
                        onClick={() => scrollToSection(link.path)}
                        className="justify-start text-lg h-12 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        {link.name}
                      </Button>
                    ) : (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-md text-lg font-medium transition-all ${location.pathname === link.path
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-primary/5"
                          }`}
                      >
                        {link.name}
                      </Link>
                    )
                  ))}

                  <div className="h-px bg-border my-4"></div>

                  {isAuthenticated ? (
                    <>
                      <Button
                        onClick={handleProfile}
                        variant="ghost"
                        className="justify-start text-lg h-12 hover:bg-primary/10"
                      >
                        <User className="w-5 h-5 mr-3" />
                        Mi Perfil
                      </Button>

                      {isAdmin && (
                        <Button
                          onClick={() => { navigate("/admin"); setIsOpen(false); }}
                          variant="ghost"
                          className="justify-start text-lg h-12 hover:bg-primary/10"
                        >
                          <Shield className="w-5 h-5 mr-3" />
                          Administración
                        </Button>
                      )}

                      <div className="h-px bg-border my-2"></div>

                      {/* Zion Code / Dev Info Section */}
                      <ZionCodeInfo />

                      <Button
                        onClick={handleAuth}
                        variant="destructive"
                        className="mt-4 h-12"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Cerrar Sesión
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleAuth}
                      className="mt-4 h-12 bg-primary hover:bg-primary/90"
                    >
                      <LogIn className="w-5 h-5 mr-3" />
                      Iniciar Sesión
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;