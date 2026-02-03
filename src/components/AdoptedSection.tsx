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
  return (
    <section id="adoptados" className="py-24 bg-muted/20 scroll-reveal">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Finales Felices</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Historias reales de amor y segunda oportunidad.
          </p>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-20 bg-card/50 rounded-[3rem] border border-dashed">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-xl text-muted-foreground font-medium">
              Aún no hay historias. ¡La tuya podría ser la primera!
            </p>
            <Button onClick={() => setShowForm(true)} className="mt-6 rounded-full" variant="outline">
              Publicar Historia
            </Button>
          </div>
        ) : (
          <>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {(showAll ? stories : stories.slice(0, INITIAL_DISPLAY_COUNT)).map((story, index) => (
                <div
                  key={story.id}
                  className="break-inside-avoid animate-in fade-in zoom-in duration-700 fill-mode-backwards"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <Card className="group overflow-hidden border-0 bg-background shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2rem]">
                    <div className="relative overflow-hidden">
                      <img
                        src={story.story_image_url}
                        alt="Historia de adopción"
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                      <div className="absolute bottom-0 left-0 p-6 w-full">
                        <h3 className="text-2xl font-black text-white mb-1 drop-shadow-md">
                          {story.animal_name}
                        </h3>
                        <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                          <Heart className="w-4 h-4 fill-white text-white" /> Adoptado
                        </div>
                      </div>

                      {isAuthenticated && (
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => setReportStoryId(story.id)}
                          className="absolute top-4 right-4 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 text-white hover:bg-destructive hover:text-white backdrop-blur-md border-0"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <CardContent className="p-6 relative">
                      {/* Quote Icon Background */}
                      <div className="absolute top-4 right-4 text-primary/10 select-none pointer-events-none">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
                      </div>
                      <p className="text-muted-foreground leading-relaxed italic relative z-10">
                        "{story.story_text}"
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {stories.length > INITIAL_DISPLAY_COUNT && (
              <div className="text-center mt-12 pb-12">
                <Button
                  onClick={() => setShowAll(!showAll)}
                  variant="ghost"
                  size="lg"
                  className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted font-bold group"
                >
                  {showAll ? "Ver menos" : (
                    <>
                      Ver más historias <Plus className="ml-2 w-4 h-4 group-hover:rotate-90 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center">Tu Historia Inspira</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="animalName">Nombre del Héroe</Label>
                <Input
                  id="animalName"
                  placeholder="Ej: Rocky"
                  value={formData.animalName}
                  onChange={e => setFormData({ ...formData, animalName: e.target.value })}
                  required
                  className="rounded-xl"
                  minLength={2}
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image" className="block w-full h-full">
                  <div className="w-full h-10 mt-6 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors text-muted-foreground text-sm">
                    {formData.imageFile ? <span className="text-primary font-bold">¡Foto lista!</span> : <span>+ Subir Foto</span>}
                  </div>
                  <Input id="image" type="file" accept="image/*" className="hidden" onChange={e => setFormData({ ...formData, imageFile: e.target.files?.[0] || null })} required />
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storyText">Cuenta tu experiencia</Label>
              <Textarea
                id="storyText"
                placeholder="¿Cómo fue el proceso? ¿Qué cambió en tu vida?..."
                value={formData.storyText}
                onChange={e => setFormData({ ...formData, storyText: e.target.value })}
                rows={6}
                required
                className="rounded-xl resize-none"
                minLength={20}
                maxLength={1000}
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20">
                {loading ? "Publicando..." : "Compartir Historia"}
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
    </section>
  );
};
export default AdoptedSection;