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
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Heart className="w-10 h-10 text-primary" />
            Historias de Adopción
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">Conoce las historias felices de animalitos que encontraron su hogar para siempre</p>
          {isAuthenticated && <Button onClick={() => setShowForm(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Compartir Mi Historia
            </Button>}
        </div>

        {stories.length === 0 ? <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aún no hay historias de adopción. ¡Sé el primero en compartir!
            </p>
          </div> : <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {(showAll ? stories : stories.slice(0, INITIAL_DISPLAY_COUNT)).map((story, index) => <Card key={story.id} className="overflow-hidden animate-fade-in" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                  <CardHeader className="p-0 relative">
                    <img src={story.story_image_url} alt="Historia de adopción" className="w-full h-64 object-cover" />
                    {isAuthenticated && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReportStoryId(story.id)}
                        className="absolute top-2 right-2 bg-background/80 hover:bg-background/95 text-destructive hover:text-destructive"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    {story.animal_name && (
                      <CardTitle className="text-lg mb-2">{story.animal_name}</CardTitle>
                    )}
                    <CardDescription className="text-base leading-relaxed">
                      {story.story_text}
                    </CardDescription>
                  </CardContent>
                </Card>)}
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