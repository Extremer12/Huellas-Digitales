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
    <section id="adoptados" className="py-24 bg-[#fafaf8] scroll-reveal overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary fill-primary animate-pulse" />
              Impacto Real
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl font-medium">
              Explora testimonios de familias que abrieron sus puertas y corazones.
            </p>
          </div>

          {isAuthenticated && (
            <Button
              onClick={() => setShowForm(true)}
              className="rounded-full px-8 h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" /> Compartir mi Historia
            </Button>
          )}
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-primary/10 shadow-sm">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-primary/30" />
            </div>
            <p className="text-xl text-muted-foreground font-semibold">
              Estamos esperando la primera historia...
            </p>
            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground mt-2">Inicia sesión para compartir la tuya.</p>
            )}
          </div>
        ) : (
          <>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {(showAll ? stories : stories.slice(0, INITIAL_DISPLAY_COUNT)).map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="break-inside-avoid"
                >
                  <Card className="group overflow-hidden border-none bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-[2.5rem]">
                    <div className="relative overflow-hidden aspect-[4/5] sm:aspect-auto">
                      <img
                        src={story.story_image_url}
                        alt="Historia de adopción"
                        className="w-full h-auto min-h-[300px] object-cover transition-transform duration-1000 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                      <div className="absolute bottom-0 left-0 p-8 w-full">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-primary/90 backdrop-blur-md border-none text-[10px] font-black uppercase tracking-widest px-3">Testimonio</Badge>
                        </div>
                        <h3 className="text-3xl font-black text-white drop-shadow-md">
                          {story.animal_name}
                        </h3>
                      </div>

                      {isAuthenticated && (
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => setReportStoryId(story.id)}
                          className="absolute top-6 right-6 rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-all bg-white/20 text-white hover:bg-destructive hover:text-white backdrop-blur-md border-transparent hover:scale-110"
                        >
                          <AlertTriangle className="w-5 h-5" />
                        </Button>
                      )}
                    </div>

                    <CardContent className="p-8 relative bg-white">
                      <div className="absolute -top-6 right-8 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                        <Heart className="w-6 h-6 text-white fill-white" />
                      </div>
                      <p className="text-foreground/80 leading-relaxed font-serif italic text-lg relative z-10">
                        "{story.story_text}"
                      </p>
                      <div className="mt-6 flex items-center gap-3">
                        <div className="w-10 h-0.5 bg-primary/20" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Historia Verificada</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {stories.length > INITIAL_DISPLAY_COUNT && (
              <div className="text-center mt-20">
                <Button
                  onClick={() => setShowAll(!showAll)}
                  variant="outline"
                  size="lg"
                  className="rounded-full px-12 h-14 border-primary/20 text-primary hover:bg-primary hover:text-white font-black uppercase tracking-widest transition-all hover:scale-105 group"
                >
                  {showAll ? "Colapsar Historias" : (
                    <>
                      Explorar más Crónicas <Plus className="ml-2 w-5 h-5 group-hover:rotate-90 transition-transform" />
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