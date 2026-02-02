import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    MapPin, Heart, Copy, AlertTriangle, Share2,
    ChevronLeft, ChevronRight, MessageCircle, ArrowLeft,
    Calendar, Info, HeartPulse, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "./Header";
import Footer from "./Footer";
import ReportModal from "./ReportModal";
import { Animal } from "./AnimalesSection";

const PetDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [animal, setAnimal] = useState<Animal | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showShareMenu, setShowShareMenu] = useState(false);
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
        }
    }, [id]);

    const loadAnimal = async (animalId: string) => {
        try {
            const { data, error } = await supabase
                .from('animals')
                .select('*')
                .eq('id', animalId)
                .single();

            if (error) throw error;

            const formattedAnimal: Animal = {
                id: data.id,
                name: data.name,
                type: data.type as "perro" | "gato" | "otro",
                age: data.age,
                size: data.size,
                location: data.location,
                description: data.description,
                fullDescription: data.description,
                image: data.image_url,
                healthInfo: data.health_info || undefined,
                personality: data.personality || undefined,
                userId: data.user_id,
                lat: data.lat,
                lng: data.lng
            };

            setAnimal(formattedAnimal);
            loadPublisherName(data.user_id);
            loadAdditionalImages(animalId);
        } catch (error) {
            console.error('Error loading animal:', error);
            toast({
                title: "Error",
                description: "No se pudo cargar la información del animalito",
                variant: "destructive",
            });
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
                title: "Inicia sesión para contactar",
                description: "Debes iniciar sesión para enviar mensajes",
                variant: "destructive",
            });
            return;
        }

        if (currentUserId === animal.userId) {
            toast({
                title: "No puedes chatear contigo mismo",
                description: "Este es tu propio anuncio",
                variant: "destructive",
            });
            return;
        }

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
            toast({
                title: "Error",
                description: "No se pudo iniciar la conversación",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <Heart className="w-12 h-12 text-primary animate-bounce" />
                    <p className="text-muted-foreground font-medium">Cargando detalles...</p>
                </div>
            </div>
        );
    }

    if (!animal) return null;

    const images = [animal.image, ...additionalImages.filter(img => img !== animal.image)];
    const shareUrl = window.location.href;
    const shareText = `¡Conoce a ${animal.name}! ${animal.type === "perro" ? "🐕" : "🐈"} busca un hogar en Huellas Digitales`;

    const handleShare = (platform: string) => {
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedText = encodeURIComponent(shareText);
        const urls: Record<string, string> = {
            whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        };
        if (urls[platform]) {
            window.open(urls[platform], '_blank', 'noopener,noreferrer');
            setShowShareMenu(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header />

            <main className="pt-24 container-custom">
                <Button
                    variant="ghost"
                    className="mb-6 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                </Button>

                <div className="grid lg:grid-cols-2 gap-10">
                    {/* Left Column: Images */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-card">
                            <img
                                src={images[currentImageIndex]}
                                alt={animal.name}
                                className="w-full h-full object-cover transition-all duration-500"
                            />
                            {images.length > 1 && (
                                <>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 border-none text-white rounded-full h-12 w-12"
                                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 border-none text-white rounded-full h-12 w-12"
                                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Navigation */}
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`relative shrink-0 w-24 aspect-square rounded-xl overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Info */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
                                {animal.type === "perro" ? "🐶 Perro" : animal.type === "gato" ? "🐱 Gato" : "🐾 Otro"}
                            </span>
                            <span className="bg-secondary/20 text-secondary px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
                                En {animal.location}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black mb-6 text-foreground tracking-tighter">
                            {animal.name}
                        </h1>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-card/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Edad</p>
                                    <p className="font-bold text-lg">{animal.age}</p>
                                </div>
                            </div>
                            <div className="bg-card/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                                    <Info className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Tamaño</p>
                                    <p className="font-bold text-lg">{animal.size}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card/40 rounded-3xl p-8 border border-white/5 mb-8">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <HeartPulse className="w-5 h-5 text-primary" />
                                Sobre {animal.name}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed text-lg italic whitespace-pre-wrap">
                                "{animal.fullDescription || animal.description}"
                            </p>

                            {animal.personality && (
                                <div className="mt-6">
                                    <h4 className="font-bold text-foreground mb-2">Personalidad:</h4>
                                    <p className="text-muted-foreground">{animal.personality}</p>
                                </div>
                            )}

                            {animal.healthInfo && (
                                <div className="mt-4">
                                    <h4 className="font-bold text-foreground mb-2">Salud:</h4>
                                    <p className="text-muted-foreground">{animal.healthInfo}</p>
                                </div>
                            )}
                        </div>

                        {/* Publisher Info */}
                        <div className="flex items-center gap-4 mb-10 p-4 bg-muted/20 rounded-2xl">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Publicado por</p>
                                <p className="font-bold">{publisherName}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={startConversation}
                                size="lg"
                                className="h-16 text-lg font-black btn-hero shadow-xl"
                            >
                                <MessageCircle className="w-6 h-6 mr-3" />
                                Contactar ahora
                            </Button>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative group">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => setShowShareMenu(!showShareMenu)}
                                        className="w-full h-14 font-bold border-2 border-primary/20 hover:border-primary/50"
                                    >
                                        <Share2 className="w-5 h-5 mr-2" />
                                        Compartir
                                    </Button>
                                    {showShareMenu && (
                                        <div className="absolute bottom-full left-0 right-0 mb-3 bg-popover border border-white/10 rounded-2xl shadow-2xl p-3 grid grid-cols-1 gap-1 z-50 animate-in fade-in slide-in-from-bottom-2">
                                            <Button variant="ghost" onClick={() => handleShare('whatsapp')} className="justify-start hover:bg-primary/10">WhatsApp</Button>
                                            <Button variant="ghost" onClick={() => handleShare('facebook')} className="justify-start hover:bg-primary/10">Facebook</Button>
                                            <Button variant="ghost" onClick={() => handleShare('twitter')} className="justify-start hover:bg-primary/10">X / Twitter</Button>
                                            <Separator className="my-1 opacity-50" />
                                            <Button variant="ghost" onClick={() => {
                                                navigator.clipboard.writeText(shareUrl);
                                                toast({ title: "¡Enlace copiado!", description: "Compártelo con quien quieras" });
                                                setShowShareMenu(false);
                                            }} className="justify-start hover:bg-primary/10">
                                                <Copy className="w-4 h-4 mr-2" /> Copiar Link
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setReportModalOpen(true)}
                                    className="w-full h-14 font-bold border-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                                >
                                    <AlertTriangle className="w-5 h-5 mr-2" />
                                    Reportar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <ReportModal
                animalId={reportModalOpen ? animal.id : null}
                onClose={() => setReportModalOpen(false)}
            />
        </div>
    );
};

export default PetDetail;
