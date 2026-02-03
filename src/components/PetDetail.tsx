import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    MapPin, Heart, Copy, Link as LinkIcon, Share2,
    ChevronLeft, ChevronRight, MessageCircle, ArrowLeft,
    Calendar, Info, HeartPulse, User, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "./Header";
import ReportModal from "./ReportModal";
import MedicalRecords from "./MedicalRecords";
import { Animal } from "./AnimalesSection";
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

    if (loading) return <div className="h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    if (!animal) return null;

    const images = [animal.image, ...additionalImages.filter(img => img !== animal.image)];

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <Header />

            {/* Main Content - Fixed Height on Desktop */}
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden pt-14">

                {/* LEFT: Immersive Gallery (55% width) */}
                <div className="w-full md:w-[55%] h-[40vh] md:h-full relative bg-muted group">
                    <img
                        src={images[currentImageIndex]}
                        alt={animal.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full h-12 w-12"
                                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full h-12 w-12"
                                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                            >
                                <ChevronRight className="w-8 h-8" />
                            </Button>
                        </>
                    )}

                    {/* Thumbnails Overlay at Bottom */}
                    {images.length > 1 && (
                        <div className="absolute bottom-6 left-6 right-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar justify-center">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-white/50 opacity-70'
                                        }`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 text-white bg-black/20 hover:bg-black/40 backdrop-blur-md"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                    </Button>
                </div>

                {/* RIGHT: Dashboard Info (45% width) */}
                <div className="w-full md:w-[45%] h-full flex flex-col bg-background border-l border-border/50">

                    {/* Header Info */}
                    <div className="p-6 border-b border-border/50">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                                    {animal.name}
                                    <Badge variant="outline" className="text-lg py-1 px-3 rounded-full border-primary/20 bg-primary/5 text-primary">
                                        {animal.type}
                                    </Badge>
                                </h1>
                                <div className="flex items-center text-muted-foreground mt-2">
                                    <MapPin className="w-4 h-4 mr-1 text-primary" />
                                    {animal.location}
                                </div>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Publicado por</p>
                                <p className="font-medium flex items-center justify-end gap-2">
                                    <User className="w-4 h-4" /> {publisherName}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <ScrollArea className="flex-1 p-6">
                        <Tabs defaultValue="about" className="w-full space-y-6">
                            <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 bg-muted/50 p-1">
                                <TabsTrigger value="about" className="rounded-lg text-sm font-bold">Sobre Mí</TabsTrigger>
                                <TabsTrigger value="history" className="rounded-lg text-sm font-bold">Historia Clínica</TabsTrigger>
                            </TabsList>

                            {/* TAB: About */}
                            <TabsContent value="about" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase font-bold text-muted-foreground">Edad</p>
                                            <p className="font-black text-lg">{animal.age}</p>
                                        </div>
                                    </div>
                                    <div className="bg-secondary/5 p-4 rounded-2xl border border-secondary/10 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                                            <Info className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase font-bold text-muted-foreground">Tamaño</p>
                                            <p className="font-black text-lg">{animal.size}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                        <HeartPulse className="w-5 h-5 text-primary" /> Personalidad & Historia
                                    </h3>
                                    <p className="text-muted-foreground text-base leading-relaxed">
                                        {animal.fullDescription || animal.description}
                                    </p>
                                </div>

                                {animal.healthInfo && (
                                    <div className="bg-card border border-border/50 p-4 rounded-xl">
                                        <h4 className="font-bold text-sm mb-2 text-primary">Estado de Salud</h4>
                                        <p className="text-sm text-muted-foreground">{animal.healthInfo}</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* TAB: Medical History */}
                            <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-2">
                                <MedicalRecords
                                    animalId={animal.id}
                                    isOwner={animal.userId === currentUserId || isAdmin}
                                />
                            </TabsContent>
                        </Tabs>
                    </ScrollArea>

                    {/* Fixed Action Footer */}
                    <div className="p-6 border-t border-border/50 bg-background/95 backdrop-blur-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                onClick={startConversation}
                                size="lg"
                                className="w-full h-14 text-lg font-bold rounded-xl shadow-xl hover:scale-[1.02] transition-transform"
                                disabled={currentUserId === animal.userId}
                            >
                                <MessageCircle className="w-5 h-5 mr-3" />
                                {currentUserId === animal.userId ? "Tu publicación" : "Contactar"}
                            </Button>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-14 w-14 rounded-xl border-2 hover:bg-muted"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast({ title: "Link copiado" });
                                    }}
                                >
                                    <LinkIcon className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-14 w-14 rounded-xl border-2 hover:bg-destructive/10 hover:border-destructive/30 text-destructive"
                                    onClick={() => setReportModalOpen(true)}
                                >
                                    <Shield className="w-5 h-5" />
                                </Button>
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
