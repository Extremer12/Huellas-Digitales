import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import heroImage from "@/assets/hero-adoption.jpg";

const emailSchema = z.string().email("Email inválido").max(255);
const passwordSchema = z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(100);
const nameSchema = z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100);

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Error de validación",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      nameSchema.parse(fullName);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Error de validación",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Email ya registrado",
          description: "Este email ya está registrado. Por favor inicia sesión.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error al registrarse",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada. Bienvenido a Huellas Digitales.",
      });
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Error con Google",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left side: Content & Form */}
      <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-20 relative z-10 bg-background/80 backdrop-blur-sm lg:backdrop-blur-none">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 lg:top-8 lg:left-8 hover:bg-primary/10 z-50 rounded-full pr-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Volver al Inicio</span>
        </Button>

        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight lg:text-5xl mb-2">
              Huellas Digitales
            </h1>
            <p className="text-muted-foreground text-lg">
              Tu portal para encontrar o dar un hogar.
            </p>
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Iniciar Sesión
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Registrarse
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="animate-in fade-in zoom-in-95 duration-300">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Correo Electrónico</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        className="h-12 bg-muted/30 border-primary/10 focus:border-primary/50 transition-all rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="login-password">Contraseña</Label>
                        <button type="button" className="text-xs text-primary hover:underline font-medium">
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="h-12 bg-muted/30 border-primary/10 focus:border-primary/50 transition-all rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg font-semibold rounded-xl btn-hero" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar Sesión"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="animate-in fade-in zoom-in-95 duration-300">
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nombre Completo</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Juan Pérez"
                        className="h-12 bg-muted/30 border-primary/10 focus:border-primary/50 transition-all rounded-xl"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Correo Electrónico</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        className="h-12 bg-muted/30 border-primary/10 focus:border-primary/50 transition-all rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Contraseña</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="h-12 bg-muted/30 border-primary/10 focus:border-primary/50 transition-all rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg font-semibold rounded-xl btn-hero" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear Cuenta"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardHeader>

            <CardContent className="px-0 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-4 text-muted-foreground font-medium">O continúa con</span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full h-12 font-medium rounded-xl border-primary/10 hover:bg-primary/5 transition-all"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Al continuar, aceptas nuestros{" "}
                <button
                  onClick={() => navigate("/terms")}
                  className="text-primary hover:underline font-medium"
                >
                  Términos de Servicio
                </button>{" "}
                y{" "}
                <button
                  onClick={() => navigate("/privacy")}
                  className="text-primary hover:underline font-medium"
                >
                  Política de Privacidad
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side: Image & Overlay */}
      <div className="hidden lg:block relative">
        <img
          src={heroImage}
          alt="Adopción de mascotas"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-background"></div>

        {/* Floating Quote */}
        <div className="absolute bottom-12 left-12 right-12 p-8 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 text-white animate-fade-in-slow">
          <p className="text-2xl font-light italic mb-4">
            "Adoptar es un acto de amor que cambia dos vidas para siempre: la tuya y la de un nuevo mejor amigo."
          </p>
          <div className="flex items-center gap-4">
            <div className="h-1 w-12 bg-primary rounded-full"></div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Huellas Digitales</span>
          </div>
        </div>
      </div>

      {/* Background decoration for mobile */}
      <div className="lg:hidden absolute inset-0 -z-10">
        <img src={heroImage} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background/50"></div>
      </div>
    </div>
  );
};

export default Auth;

