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
        <div className="min-h-screen bg-background selection:bg-primary/30">
            <Header />

            <main className="pt-20 pb-10">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                    {/* Navigation and Title Mobile First */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div className="space-y-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="group -ml-2 text-muted-foreground hover:text-primary transition-all rounded-full"
                                onClick={() => navigate(-1)}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                                Volver al listado
                            </Button>

                            <h1 className="text-6xl md:text-9xl font-black text-foreground tracking-[-0.06em] leading-[0.85] uppercase">
                                {animal.name}
                            </h1>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className="bg-primary px-5 py-2 rounded-full text-xs font-black tracking-[0.2em] text-primary-foreground shadow-lg shadow-primary/20">
                                {animal.type === "perro" ? "🐕 PERRO" : animal.type === "gato" ? "🐈 GATO" : "🐾 OTRO"}
                            </span>
                            <span className="bg-card/50 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full text-xs font-bold text-muted-foreground">
                                <MapPin className="w-3 h-3 inline mr-1" /> {animal.location}
                            </span>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-10 items-start">
                        {/* Immersive Gallery Section */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="relative aspect-[4/5] md:aspect-video rounded-[3rem] overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,0.3)] bg-muted ring-1 ring-white/10 group">
                                <img
                                    src={images[currentImageIndex]}
                                    alt={animal.name}
                                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />

                                {images.length > 1 && (
                                    <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="pointer-events-auto h-14 w-14 rounded-full bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 -translate-x-10 group-hover:translate-x-0"
                                            onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                                        >
                                            <ChevronLeft className="w-8 h-8" />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="pointer-events-auto h-14 w-14 rounded-full bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0"
                                            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                                        >
                                            <ChevronRight className="w-8 h-8" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Bar */}
                            {images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar justify-center md:justify-start">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`relative shrink-0 w-24 h-24 rounded-3xl overflow-hidden border-4 transition-all duration-500 scale-90 hover:scale-100 ${idx === currentImageIndex
                                                ? 'border-primary ring-4 ring-primary/20 scale-100 shadow-xl shadow-primary/10'
                                                : 'border-transparent opacity-40 grayscale hover:grayscale-0 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bento Info & Action Column */}
                        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
                            {/* Bento Grid Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-card/30 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/5 flex flex-col items-center text-center gap-3 group hover:bg-primary/5 transition-colors duration-500">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Calendar className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Edad</p>
                                        <p className="font-black text-xl text-foreground">{animal.age}</p>
                                    </div>
                                </div>
                                <div className="bg-card/30 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/5 flex flex-col items-center text-center gap-3 group hover:bg-secondary/5 transition-colors duration-500">
                                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                                        <Info className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Tamaño</p>
                                        <p className="font-black text-xl text-foreground">{animal.size}</p>
                                    </div>
                                </div>
                            </div>

                            {/* About Section */}
                            <div className="bg-card/20 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 text-primary/5 -mt-4 -mr-4 group-hover:text-primary/10 transition-colors">
                                    <HeartPulse className="w-24 h-24" />
                                </div>

                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                                    Un poco de mi
                                </h3>
                                <p className="text-muted-foreground leading-relaxed text-lg italic relative z-10 first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                                    {animal.fullDescription || animal.description}
                                </p>

                                {animal.healthInfo && (
                                    <div className="mt-8 pt-8 border-t border-white/5">
                                        <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-2">Estado de Salud</h4>
                                        <p className="text-muted-foreground">{animal.healthInfo}</p>
                                    </div>
                                )}
                            </div>

                            {/* User & Actions */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-5 bg-muted/20 rounded-[2rem] border border-white/5">
                                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary ring-4 ring-primary/5">
                                        <User className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Protector / Publicado por</p>
                                        <p className="font-black text-lg">{publisherName}</p>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <Button
                                        onClick={startConversation}
                                        size="lg"
                                        className="h-20 text-xl font-black rounded-[2rem] btn-hero shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group"
                                    >
                                        <MessageCircle className="w-7 h-7 mr-3 transition-transform group-hover:rotate-12" />
                                        Contactar ahora
                                    </Button>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                onClick={() => setShowShareMenu(!showShareMenu)}
                                                className="w-full h-16 rounded-[1.5rem] font-bold border-2 border-primary/10 hover:border-primary/40 bg-card/10 backdrop-blur-md"
                                            >
                                                <Share2 className="w-5 h-5 mr-2" />
                                                Compartir
                                            </Button>

                                            {showShareMenu && (
                                                <div className="absolute bottom-full left-0 right-0 mb-4 bg-card/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 space-y-1 z-50 animate-in fade-in slide-in-from-bottom-5">
                                                    <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-primary/10" onClick={() => handleShare('whatsapp')}>WhatsApp</Button>
                                                    <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-primary/10" onClick={() => handleShare('facebook')}>Facebook</Button>
                                                    <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-primary/10" onClick={() => handleShare('twitter')}>X / Twitter</Button>
                                                    <Separator className="my-2 opacity-5" />
                                                    <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-primary/10" onClick={() => {
                                                        navigator.clipboard.writeText(shareUrl);
                                                        toast({ title: "¡Enlace copiado!", description: "Listo para compartir" });
                                                        setShowShareMenu(false);
                                                    }}>
                                                        <Copy className="w-4 h-4 mr-2" /> Copiar Link
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={() => setReportModalOpen(true)}
                                            className="w-full h-16 rounded-[1.5rem] font-bold border-2 border-destructive/10 text-destructive hover:bg-destructive/5 hover:border-destructive/30 bg-card/10 backdrop-blur-md"
                                        >
                                            <AlertTriangle className="w-5 h-5 mr-2" />
                                            Reportar
                                        </Button>
                                    </div>
                                </div>
                            </div>
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
