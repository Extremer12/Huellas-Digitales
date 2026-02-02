import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Heart, Plus, AlertTriangle } from "lucide-react";
import StoryReportModal from "./StoryReportModal";
interface AdoptionStory {
  id: string;
  story_text: string;
  story_image_url: string;
  created_at: string;
  animal_id: string;
  animal_name?: string;
}
const AdoptedSection = () => {
  const {
    toast
  } = useToast();
  const [stories, setStories] = useState<AdoptionStory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [reportStoryId, setReportStoryId] = useState<string | null>(null);
  const INITIAL_DISPLAY_COUNT = 3;
  const [formData, setFormData] = useState({
    animalName: "",
    storyText: "",
    imageFile: null as File | null
  });
  useEffect(() => {
    checkAuth();
    fetchStories();
  }, []);
  const checkAuth = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };
  const fetchStories = async () => {
    const {
      data,
      error
    } = await supabase.from("adoption_stories").select("*").order("created_at", {
      ascending: false
    });
    if (!error && data) {
      setStories(data);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.animalName || !formData.storyText || !formData.imageFile) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    // Anti-spam validation
    if (formData.storyText.length < 20) {
      toast({
        title: "Error",
        description: "La historia debe tener al menos 20 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (formData.animalName.length < 2) {
      toast({
        title: "Error",
        description: "El nombre del animal debe tener al menos 2 caracteres",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Upload image
      const fileExt = formData.imageFile.name.split(".").pop();
      const fileName = `story-${user.id}-${Date.now()}.${fileExt}`;
      const {
        error: uploadError,
        data: uploadData
      } = await supabase.storage.from("animal-photos").upload(fileName, formData.imageFile);
      if (uploadError) throw uploadError;
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from("animal-photos").getPublicUrl(fileName);

      // Create story - using a temporary UUID for animal_id since stories are now independent
      const {
        error: insertError
      } = await supabase.from("adoption_stories").insert({
        animal_id: crypto.randomUUID(), // Temporary ID since stories are now independent
        animal_name: formData.animalName,
        adopter_user_id: user.id,
        story_text: formData.storyText,
        story_image_url: publicUrl
      });
      if (insertError) throw insertError;
      toast({
        title: "¡Historia publicada!",
        description: "Gracias por compartir tu historia de adopción"
      });
      setShowForm(false);
      setFormData({
        animalName: "",
        storyText: "",
        imageFile: null
      });
      fetchStories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo publicar la historia",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <section id="adoptados" className="py-20 bg-muted/30 scroll-reveal">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-primary/10 text-primary">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tighter">
          Finales Felices
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          Conocé las hermosas historias de amiguitos que ya están disfrutando de su hogar para siempre.
        </p>
        {isAuthenticated && (
          <Button onClick={() => setShowForm(true)} size="lg" className="h-14 px-10 text-lg font-bold btn-hero shadow-xl">
            <Plus className="w-5 h-5 mr-3" />
            Tu historia también cuenta
          </Button>
        )}
      </div>

      {stories.length === 0 ? <div className="text-center py-12">
        <p className="text-muted-foreground">
          Aún no hay historias de adopción. ¡Sé el primero en compartir!
        </p>
      </div> : <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {(showAll ? stories : stories.slice(0, INITIAL_DISPLAY_COUNT)).map((story, index) => (
            <Card
              key={story.id}
              className="group overflow-hidden border-white/5 bg-card/30 backdrop-blur-sm hover:border-primary/20 transition-all duration-500 hover:shadow-2xl animate-fade-in rounded-3xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="p-0 relative h-72 overflow-hidden">
                <img
                  src={story.story_image_url}
                  alt="Historia de adopción"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReportStoryId(story.id)}
                    className="absolute top-4 right-4 bg-background/50 backdrop-blur-md border-white/10 hover:bg-destructive hover:text-white transition-all hover:scale-110"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </Button>
                )}

                {story.animal_name && (
                  <div className="absolute bottom-6 left-6">
                    <span className="text-2xl font-black text-white tracking-tight">
                      {story.animal_name}
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-8">
                <CardDescription className="text-lg leading-relaxed text-foreground/80 first-letter:text-3xl first-letter:font-black first-letter:text-primary">
                  {story.story_text}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {stories.length > INITIAL_DISPLAY_COUNT && <div className="text-center mt-12">
          <Button onClick={() => setShowAll(!showAll)} size="lg" className="btn-hero">
            {showAll ? "Ver menos" : `Ver más (${stories.length - INITIAL_DISPLAY_COUNT} más)`}
          </Button>
        </div>}
      </>}
    </div>

    {/* Form Dialog */}
    <Dialog open={showForm} onOpenChange={setShowForm}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compartir Historia de Adopción</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="animalName">Nombre del Animal Adoptado</Label>
            <Input
              id="animalName"
              placeholder="Ej: Max, Luna, Firulais..."
              value={formData.animalName}
              onChange={e => setFormData({
                ...formData,
                animalName: e.target.value
              })}
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          <div>
            <Label htmlFor="storyText">Cuéntanos tu historia</Label>
            <Textarea
              id="storyText"
              placeholder="Comparte cómo fue el proceso de adopción y cómo ha cambiado tu vida..."
              value={formData.storyText}
              onChange={e => setFormData({
                ...formData,
                storyText: e.target.value
              })}
              rows={6}
              required
              minLength={20}
              maxLength={1000}
            />
          </div>
          <div>
            <Label htmlFor="image">Foto de tu nuevo amigo</Label>
            <Input id="image" type="file" accept="image/*" onChange={e => setFormData({
              ...formData,
              imageFile: e.target.files?.[0] || null
            })} required />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Publicando..." : "Publicar Historia"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Report Modal */}
    <StoryReportModal
      storyId={reportStoryId}
      onClose={() => setReportStoryId(null)}
    />
  </section>;
};
export default AdoptedSection;