import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    MapPin, Heart, Copy, Link as LinkIcon, Share2,
    ChevronLeft, ChevronRight, MessageCircle, ArrowLeft,
    Calendar, Info, HeartPulse, User, Shield, X, ZoomIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "./Header";
import ReportModal from "./ReportModal";
import MedicalRecords from "./MedicalRecords";
import { Animal } from "./AnimalesSection";
import SeoHead from "@/components/SeoHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const PetDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [animal, setAnimal] = useState<Animal | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [publisherName, setPublisherName] = useState("");
    const [additionalImages, setAdditionalImages] = useState<string[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);
        };
        fetchUser();

        if (id) {
            loadAnimal(id);
            checkAdminStatus();
        }
    }, [id]);

    const checkAdminStatus = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: roles } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", session.user.id);
            setIsAdmin(roles?.some(r => r.role === "admin" || r.role === "moderator") || false);
        }
    };

    const loadAnimal = async (animalId: string) => {
        try {
            const { data, error } = await supabase
                .from('animals')
                .select('*')
                .eq('id', animalId)
                .single();

            if (error) throw error;

            const typedData = data as any;
            const formattedAnimal: Animal = {
                id: typedData.id,
                name: typedData.name,
                type: typedData.type as "perro" | "gato" | "otro",
                age: typedData.age,
                size: typedData.size,
                location: typedData.location,
                description: typedData.description,
                fullDescription: typedData.description,
                image: typedData.image_url,
                healthInfo: typedData.health_info || undefined,
                personality: typedData.personality || undefined,
                userId: typedData.user_id,
                lat: typedData.lat,
                lng: typedData.lng
            };

            setAnimal(formattedAnimal);
            loadPublisherName(data.user_id);
            loadAdditionalImages(animalId);
        } catch (error) {
            console.error('Error loading animal:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const loadPublisherName = async (userId: string) => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', userId)
                .single();

            setPublisherName(data?.full_name || data?.email || 'Usuario');
        } catch (error) {
            console.error('Error loading publisher name:', error);
        }
    };

    const loadAdditionalImages = async (animalId: string) => {
        try {
            const { data } = await supabase
                .from('animal_images')
                .select('image_url')
                .eq('animal_id', animalId)
                .order('display_order', { ascending: true });

            if (data && data.length > 0) {
                setAdditionalImages(data.map(img => img.image_url));
            }
        } catch (error) {
            console.error('Error loading additional images:', error);
        }
    };

    const startConversation = async () => {
        if (!animal || !currentUserId) {
            toast({
                title: "Inicia sesión",
                description: "Debes ingresar para contactar.",
                variant: "destructive",
            });
            return;
        }

        if (currentUserId === animal.userId) return;

        try {
            const { data: existingConv } = await supabase
                .from('conversations')
                .select('id')
                .eq('animal_id', animal.id)
                .eq('adopter_id', currentUserId)
                .eq('publisher_id', animal.userId)
                .maybeSingle();

            if (existingConv) {
                navigate(`/messages?conversation=${existingConv.id}`);
                return;
            }

            const { data: newConv, error } = await supabase
                .from('conversations')
                .insert({
                    animal_id: animal.id,
                    adopter_id: currentUserId,
                    publisher_id: animal.userId,
                })
                .select('id')
                .single();

            if (error) throw error;
            navigate(`/messages?conversation=${newConv.id}`);
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    // --- NEW FEATURE: Lightbox State ---
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // --- NEW FEATURE: Native Share ---
    const handleShare = async () => {
        if (navigator.share) {
            try {
                const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
                const shareUrl = `https://${projectId}.supabase.co/functions/v1/share-preview?id=${animal?.id}`;

                await navigator.share({
                    title: `Adopta a ${animal?.name}`,
                    text: `Mira a ${animal?.name} en Huellas Digitales. ${animal?.status === 'perdido' ? '¡Ayúdalo a volver a casa!' : '¡Busca un hogar!'}`,
                    url: shareUrl,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback
            const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
            const shareUrl = `https://${projectId}.supabase.co/functions/v1/share-preview?id=${animal?.id}`;
            navigator.clipboard.writeText(shareUrl);
            toast({ title: "Link copiado al portapapeles" });
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    if (!animal) return null;

    const images = [animal.image, ...additionalImages.filter(img => img !== animal.image)];

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-0">
            <SeoHead
                title={`${animal.name} - ${animal.status === 'perdido' ? '¡Ayúdame a volver a casa!' : 'En Adopción'}`}
                description={`Conoce a ${animal.name}, un ${animal.type} de ${animal.age} años que busca ${animal.status === 'perdido' ? 'su hogar' : 'una familia'}.`}
                image={animal.image}
                type="article"
            />
            <div className="hidden md:block">
                <Header />
            </div>

            {/* LIGHTBOX OVERLAY */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white hover:bg-white/10 z-50"
                        onClick={() => setLightboxOpen(false)}
                    >
                        <X className="w-8 h-8" />
                    </Button>
                    <img
                        src={images[currentImageIndex]}
                        className="max-w-full max-h-full object-contain p-2"
                        alt={animal.name}
                    />
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length); }}
                            >
                                <ChevronLeft className="w-10 h-10" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % images.length); }}
                            >
                                <ChevronRight className="w-10 h-10" />
                            </Button>
                        </>
                    )}
                </div>
            )}

            <main className="md:pt-20 md:flex md:h-[calc(100vh-80px)] md:overflow-hidden max-w-7xl mx-auto">

                {/* MOBILE HEADER (Absolute) */}
                <div className="md:hidden absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="bg-black/20 backdrop-blur-md text-white rounded-full pointer-events-auto hover:bg-black/40"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <Badge variant="secondary" className="pointer-events-auto backdrop-blur-md bg-white/90 text-black font-bold shadow-lg">
                        {animal.status === 'perdido' ? '🚨 Perdido' : '🏡 En Adopción'}
                    </Badge>
                </div>

                {/* LEFT: IMAGE GALLERY (Mobile: Top Hero, Desktop: Left Col) */}
                <div className="relative w-full md:w-[50%] h-[50vh] md:h-full bg-muted group overflow-hidden">
                    <img
                        src={images[currentImageIndex]}
                        alt={animal.name}
                        className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700 hover:scale-105"
                        onClick={() => setLightboxOpen(true)}
                    />

                    {/* Desktop Hover Overlay */}
                    <div className="hidden md:flex absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center pointer-events-none">
                        <span className="text-white font-medium flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                            <ZoomIn className="w-4 h-4" /> Ver Pantalla Completa
                        </span>
                    </div>

                    {/* Image Navigation Dots */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                            {images.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all shadow-sm ${idx === currentImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: CONTENT (Mobile: Scrollable below, Desktop: Right Col) */}
                <div className="w-full md:w-[50%] md:h-full flex flex-col bg-background relative -mt-6 md:mt-0 rounded-t-[2rem] md:rounded-none z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none border-t border-white/50 md:border-none">

                    {/* Scrollable Area */}
                    <ScrollArea className="flex-1">
                        <div className="p-6 pb-32 md:pb-6 space-y-6">

                            {/* Title & Basics */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-black text-foreground flex items-center gap-2">
                                            {animal.name}
                                            <span className="text-2xl">
                                                {animal.type === 'perro' ? '🐕' : animal.type === 'gato' ? '🐈' : '🐾'}
                                            </span>
                                        </h1>
                                        <p className="text-muted-foreground flex items-center gap-1 mt-1 text-sm md:text-base font-medium">
                                            <MapPin className="w-4 h-4 text-primary" /> {animal.location}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-lg text-sm inline-block">
                                            {animal.age}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-secondary/10 p-3 rounded-2xl text-center border border-secondary/20">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Tamaño</p>
                                        <p className="font-bold text-secondary-foreground text-sm">{animal.size}</p>
                                    </div>
                                    <div className="bg-blue-500/10 p-3 rounded-2xl text-center border border-blue-500/20">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Sexo</p>
                                        <p className="font-bold text-blue-700 text-sm">--</p> {/* Add sex if available later */}
                                    </div>
                                    <div className="bg-purple-500/10 p-3 rounded-2xl text-center border border-purple-500/20">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Publicado</p>
                                        <p className="font-bold text-purple-700 text-sm line-clamp-1">{publisherName.split(' ')[0]}</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-border/60" />

                            {/* Story / About */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <HeartPulse className="w-5 h-5 text-primary" /> Historia
                                </h3>
                                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                                    {animal.fullDescription || animal.description}
                                </p>
                            </div>

                            {/* Health Info */}
                            {animal.healthInfo && (
                                <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-xl space-y-2">
                                    <h4 className="font-bold text-green-700 text-sm flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Estado de Salud
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{animal.healthInfo}</p>
                                </div>
                            )}

                            {/* Tabs for extra details on Desktop primarily */}
                            <Tabs defaultValue="history" className="w-full pt-2">
                                <TabsList className="w-full bg-muted/50 rounded-xl p-1">
                                    <TabsTrigger value="history" className="flex-1 rounded-lg text-xs font-bold">Libreta Sanitaria</TabsTrigger>
                                </TabsList>
                                <TabsContent value="history" className="pt-4">
                                    <MedicalRecords
                                        animalId={animal.id}
                                        isOwner={animal.userId === currentUserId || isAdmin}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </ScrollArea>

                    {/* FIXED BOTTOM ACTION BAR (Mobile & Desktop) */}
                    <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 z-40 md:bg-transparent md:border-t">
                        <div className="container md:px-0 flex gap-3 items-center max-w-7xl mx-auto">

                            <Button
                                onClick={startConversation}
                                size="lg"
                                className="flex-1 h-14 text-base font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform animate-in slide-in-from-bottom-5 duration-500"
                                disabled={currentUserId === animal.userId}
                            >
                                <MessageCircle className="w-5 h-5 mr-3" />
                                {currentUserId === animal.userId ? "Tu publicación" : "Contactar Ahora"}
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-14 w-14 rounded-2xl border-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                                onClick={handleShare}
                                aria-label="Compartir"
                            >
                                <Share2 className="w-5 h-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-14 w-14 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors hidden sm:flex"
                                onClick={() => setReportModalOpen(true)}
                                aria-label="Reportar"
                            >
                                <Shield className="w-5 h-5" />
                            </Button>
                        </div>
                        {/* Mobile Report Link (since button is hidden on tiny screens to save space) */}
                        <div className="sm:hidden text-center mt-3">
                            <button
                                onClick={() => setReportModalOpen(true)}
                                className="text-[10px] text-muted-foreground underline decoration-dotted"
                            >
                                Reportar publicación
                            </button>
                        </div>
                    </div>

                </div>
            </main>

            <ReportModal
                animalId={reportModalOpen ? animal.id : null}
                onClose={() => setReportModalOpen(false)}
            />
        </div>
    );
};

export default PetDetail;
