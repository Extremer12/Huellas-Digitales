import { X, MapPin, Heart, Copy, AlertTriangle, Share2, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Animal } from "./AnimalesSection";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReportModal from "./ReportModal";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface AnimalModalProps {
  animal: Animal | null;
  onClose: () => void;
  currentUserId?: string;
}

const AnimalModal = ({ animal, onClose, currentUserId }: AnimalModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [publisherName, setPublisherName] = useState("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  // Combine main image with additional images
  const images = animal ? [animal.image, ...additionalImages] : [];

  useEffect(() => {
    if (animal && currentUserId) {
      loadPublisherName();
      loadAdditionalImages();
    }
  }, [animal, currentUserId]);

  const loadPublisherName = async () => {
    if (!animal) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', animal.userId)
        .single();
      
      setPublisherName(data?.full_name || data?.email || 'Usuario');
    } catch (error) {
      console.error('Error loading publisher name:', error);
    }
  };

  const loadAdditionalImages = async () => {
    if (!animal) return;
    try {
      const { data } = await supabase
        .from('animal_images')
        .select('image_url')
        .eq('animal_id', animal.id)
        .order('display_order', { ascending: true });
      
      if (data && data.length > 0) {
        // Skip first image as it's the main one
        setAdditionalImages(data.slice(1).map(img => img.image_url));
      }
    } catch (error) {
      console.error('Error loading additional images:', error);
    }
  };

  const startConversation = async () => {
    if (!animal) return;

    if (!currentUserId) {
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
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('animal_id', animal.id)
        .eq('adopter_id', currentUserId)
        .eq('publisher_id', animal.userId)
        .maybeSingle();

      if (existingConv) {
        onClose();
        navigate(`/messages?conversation=${existingConv.id}`);
        return;
      }

      // Create new conversation
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

      onClose();
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

  if (!animal) return null;

  const shareUrl = `${window.location.origin}/?animal=${animal.id}`;
  const shareText = `¡Conoce a ${animal.name}! ${animal.type === "perro" ? "🐕" : "🐈"} en adopción`;

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace se copió al portapapeles",
      });
      setShowShareMenu(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Dialog open={!!animal} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary" />
              {animal.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Información detallada sobre {animal.name}, {animal.type === "perro" ? "perro" : "gato"} en adopción
            </DialogDescription>
          </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Image Carousel */}
          <div className="relative rounded-2xl overflow-hidden bg-muted">
            <div className="aspect-square">
              <img
                src={images[currentImageIndex]}
                alt={`${animal.name} - Imagen ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background shadow-lg"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background shadow-lg"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <div className="bg-background/90 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </div>
                {/* Thumbnail indicators */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-primary w-6' 
                          : 'bg-background/60 hover:bg-background/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Información básica</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Tipo:</span>
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {animal.type === "perro" ? "🐕 Perro" : "🐈 Gato"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Edad:</span>
                  <span>{animal.age}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Tamaño:</span>
                  <span>{animal.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{animal.location}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Sobre {animal.name}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {animal.fullDescription}
              </p>
            </div>

            {currentUserId && currentUserId !== animal.userId && (
              <div className="bg-accent/50 rounded-xl p-4 border border-primary/20">
                <p className="text-sm text-muted-foreground text-center">
                  💬 Usa el botón de <strong>Mensaje</strong> para contactar con el publicador de forma segura
                </p>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Chat, Share and Report Section */}
        <div className="flex flex-col gap-3">
          {currentUserId && currentUserId !== animal.userId && (
            <Button
              onClick={startConversation}
              size="lg"
              className="w-full h-14 text-base font-semibold"
            >
              <MessageCircle className="w-6 h-6 mr-3" />
              Enviar mensaje
            </Button>
          )}
          
          {!currentUserId && (
            <Button
              onClick={() => {
                toast({
                  title: "Inicia sesión para contactar",
                  description: "Debes iniciar sesión para enviar mensajes",
                  variant: "destructive",
                });
              }}
              size="lg"
              className="w-full h-14 text-base font-semibold"
            >
              <MessageCircle className="w-6 h-6 mr-3" />
              Enviar mensaje
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="w-full h-12 text-base font-medium border-2"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Compartir
              </Button>
              
              {showShareMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-lg shadow-lg p-2 space-y-1 z-10">
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-accent"
                    onClick={() => handleShare('whatsapp')}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-accent"
                    onClick={() => handleShare('facebook')}
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-accent"
                    onClick={() => handleShare('twitter')}
                  >
                    X (Twitter)
                  </Button>
                  <Separator />
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-accent"
                    onClick={handleCopyLink}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar enlace
                  </Button>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setReportModalOpen(true)}
              className="w-full h-12 text-base font-medium border-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              Reportar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <ReportModal 
      animalId={reportModalOpen ? animal.id : null}
      onClose={() => setReportModalOpen(false)}
    />
    </>
  );
};

export default AnimalModal;
