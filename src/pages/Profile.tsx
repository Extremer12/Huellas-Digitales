import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, User, Heart, PawPrint, LogOut, Home, MapPin, AlertTriangle, MessageCircle, Bell, BellOff, Plus, Settings, Calendar, Mail, Camera, Loader2 } from "lucide-react";
import RegionSelector from "@/components/RegionSelector";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PublicationForm from "@/components/PublicationForm";
import ChatList from "@/components/ChatList";
import { useNotifications } from "@/hooks/useNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface Animal {
  id: string;
  name: string;
  type: "perro" | "gato" | "otro";
  age: string;
  size: string;
  location: string;
  description: string;
  image_url: string;
  status: string;
  created_at?: string;
}

interface AdoptionStory {
  id: string;
  animal_name: string;
  story_text: string;
  story_image_url: string;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [adoptionStories, setAdoptionStories] = useState<AdoptionStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [editingStory, setEditingStory] = useState<AdoptionStory | null>(null);
  const [editForm, setEditForm] = useState<Partial<Animal>>({});
  const [editStoryForm, setEditStoryForm] = useState<Partial<AdoptionStory>>({});
  const [stats, setStats] = useState({ disponible: 0, adoptado: 0, perdido: 0, total: 0 });
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'animal' | 'story', id: string } | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { permission, requestPermission } = useNotifications(user?.id);
  const { isSupported: pushSupported, isSubscribed: pushSubscribed, subscribe: subscribePush, unsubscribe: unsubscribePush, isLoading: pushLoading } = usePushNotifications(user?.id);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'animals');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(profileData);

    if (!profileData?.country || !profileData?.province) {
      setShowRegionSelector(true);
    }

    fetchUserAnimals(session.user.id);
    fetchUserStories(session.user.id);
  };

  const fetchUserStories = async (userId: string) => {
    const { data, error } = await supabase
      .from("adoption_stories")
      .select("*")
      .eq("adopter_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar tus historias de adopción",
        variant: "destructive",
      });
    } else {
      setAdoptionStories(data || []);
    }
  };

  const fetchUserAnimals = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("animals")
      .select("id, name, type, age, size, location, description, image_url, health_info, personality, status, user_id, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar tus publicaciones",
        variant: "destructive",
      });
    } else {
      setAnimals(data || []);

      const disponible = data?.filter(a => a.status === 'disponible').length || 0;
      const adoptado = data?.filter(a => a.status === 'adoptado').length || 0;
      const perdido = data?.filter(a => a.status === 'perdido').length || 0;
      setStats({ disponible, adoptado, perdido, total: data?.length || 0 });
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("animals").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar la publicación", variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Publicación eliminada correctamente" });
      setAnimals(animals.filter(a => a.id !== id));
      const updatedAnimals = animals.filter(a => a.id !== id);
      const disponible = updatedAnimals.filter(a => a.status === 'disponible').length;
      const adoptado = updatedAnimals.filter(a => a.status === 'adoptado').length;
      const perdido = updatedAnimals.filter(a => a.status === 'perdido').length;
      setStats({ disponible, adoptado, perdido, total: updatedAnimals.length });
    }
    setDeleteConfirm(null);
  };

  const handleEdit = (animal: Animal) => {
    setEditingAnimal(animal);
    setEditForm(animal);
  };

  const handleUpdate = async () => {
    if (!editingAnimal) return;
    const { error } = await supabase.from("animals").update(editForm).eq("id", editingAnimal.id);
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar la publicación", variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Publicación actualizada correctamente" });
      const updatedAnimals = animals.map(a => a.id === editingAnimal.id ? { ...a, ...editForm } as Animal : a);
      setAnimals(updatedAnimals);
      setEditingAnimal(null);
      const disponible = updatedAnimals.filter(a => a.status === 'disponible').length;
      const adoptado = updatedAnimals.filter(a => a.status === 'adoptado').length;
      const perdido = updatedAnimals.filter(a => a.status === 'perdido').length;
      setStats({ disponible, adoptado, perdido, total: updatedAnimals.length });
    }
  };

  const handleDeleteStory = async (id: string) => {
    const { error } = await supabase.from("adoption_stories").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar la historia", variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Historia eliminada correctamente" });
      setAdoptionStories(adoptionStories.filter(s => s.id !== id));
    }
    setDeleteConfirm(null);
  };

  const handleEditStory = (story: AdoptionStory) => {
    setEditingStory(story);
    setEditStoryForm(story);
  };

  const handleUpdateStory = async () => {
    if (!editingStory) return;
    const { error } = await supabase
      .from("adoption_stories")
      .update({ animal_name: editStoryForm.animal_name, story_text: editStoryForm.story_text })
      .eq("id", editingStory.id);
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar la historia", variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Historia actualizada correctamente" });
      setAdoptionStories(adoptionStories.map(s => s.id === editingStory.id ? { ...s, ...editStoryForm } : s));
      setEditingStory(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      disponible: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
      adoptado: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
      perdido: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
    };
    const labels = { disponible: "Disponible", adoptado: "Adoptado", perdido: "Perdido" };
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{labels[status as keyof typeof labels]}</Badge>;
  };

  const getInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || "U";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Error", description: "Solo se permiten imágenes", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "La imagen no puede superar 5MB", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: avatarUrl });
      toast({ title: "Éxito", description: "Foto de perfil actualizada" });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({ title: "Error", description: "No se pudo subir la foto", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-16 h-16 bg-muted rounded-full" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-12 lg:py-16 space-y-12 mt-4 flex flex-col items-center sm:items-stretch">

        {/* Modern Profile Header */}
        <section className="flex flex-col md:flex-row gap-6 md:items-center justify-between p-6 rounded-3xl bg-card border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="relative group shrink-0">
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
              <Avatar className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-background shadow-md cursor-pointer transition-transform group-hover:scale-105" onClick={() => avatarInputRef.current?.click()}>
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Avatar" className="object-cover" />}
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {getInitials(user?.email)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {uploadingAvatar ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
              </button>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Mi Perfil
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </span>
                {profile?.province && (
                  <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.province}, {profile.country}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 relative z-10">
            {pushSupported && (
              <Button
                variant={pushSubscribed ? "secondary" : "outline"}
                size="sm"
                onClick={pushSubscribed ? unsubscribePush : subscribePush}
                disabled={pushLoading}
                className="gap-2 rounded-full"
              >
                {pushSubscribed ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4" />}
                {pushLoading ? "..." : pushSubscribed ? "Notificaciones Activas" : "Activar Notificaciones"}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </section>

        {/* Floating Action Button for Mobile / Toolbar for Desktop */}
        {/* Mobile-Friendly Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto w-full">
          <Button
            onClick={() => setShowPublicationForm(true)}
            size="lg"
            className="flex-1 shadow-lg bg-primary hover:bg-primary/90 rounded-2xl h-14 text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Publicación
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex-1 rounded-2xl h-14 border-2 border-primary/20 hover:border-primary/60 hover:bg-primary/5 font-semibold"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir al Inicio
          </Button>
        </div>


        {/* Content Tabs - Responsive Overhaul */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          <TabsList className="w-full flex justify-between sm:justify-start h-auto p-1 bg-muted/30 rounded-2xl mb-8 gap-1 sm:gap-6 border-none">
            <TabsTrigger
              value="animals"
              className="flex-1 sm:flex-none rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm py-3 px-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <PawPrint className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider">Posts</span>
                <Badge variant="secondary" className="hidden sm:flex ml-1 text-[10px] h-5 px-1.5 min-w-[1.25rem]">{animals.length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="stories"
              className="flex-1 sm:flex-none rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm py-3 px-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Heart className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider">Historias</span>
                <Badge variant="secondary" className="hidden sm:flex ml-1 text-[10px] h-5 px-1.5 min-w-[1.25rem]">{adoptionStories.length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="chats"
              className="flex-1 sm:flex-none rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm py-3 px-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider">Mensajes</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="animals" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
            {animals.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <PawPrint className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Aún no tienes publicaciones</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
                  Publica un animal en adopción o reporta una mascota perdida para ayudar a la comunidad.
                </p>
                <Button variant="outline" onClick={() => setShowPublicationForm(true)}>
                  Crear mi primera publicación
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {animals.map((animal) => (
                  <Card key={animal.id} className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img src={animal.image_url} alt={animal.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(animal.status)}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{animal.name}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {animal.location}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{animal.type}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(animal)} className="w-full text-xs h-8">
                          <Edit className="w-3 h-3 mr-1.5" /> Editar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm({ type: 'animal', id: animal.id })} className="w-full text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-3 h-3 mr-1.5" /> Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stories" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
            {adoptionStories.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Sin historias compartidas</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
                  ¿Adoptaste? ¡Inspira a otros compartiendo tu final feliz!
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {adoptionStories.map((story) => (
                  <Card key={story.id} className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img src={story.story_image_url} alt={story.animal_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-white text-xs font-medium truncate">{story.animal_name}</p>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 italic">"{story.story_text}"</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditStory(story)} className="w-full text-xs h-8">
                          <Edit className="w-3 h-3 mr-1.5" /> Editar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm({ type: 'story', id: story.id })} className="w-full text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-3 h-3 mr-1.5" /> Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chats" className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border/50 bg-muted/10">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Mensajería Privada
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Conecta con otros usuarios para coordinar adopciones o reencuentros.</p>
              </div>
              <div className="p-0">
                {user && <ChatList userId={user.id} />}
              </div>
            </div>
          </TabsContent>
        </Tabs>

      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4 justify-end">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirm?.type === 'animal') handleDelete(deleteConfirm.id);
                else if (deleteConfirm?.type === 'story') handleDeleteStory(deleteConfirm.id);
              }}
            >
              Sí, Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Animal Dialog */}
      <Dialog open={!!editingAnimal} onOpenChange={() => setEditingAnimal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Publicación</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={editForm.type} onValueChange={(value) => setEditForm({ ...editForm, type: value as "perro" | "gato" | "otro" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perro">🐕 Perro</SelectItem>
                    <SelectItem value="gato">🐈 Gato</SelectItem>
                    <SelectItem value="otro">🐾 Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Edad</Label>
                <Input id="age" value={editForm.age || ""} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Tamaño</Label>
                <Input id="size" value={editForm.size || ""} onChange={(e) => setEditForm({ ...editForm, size: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" value={editForm.location || ""} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">✅ Disponible</SelectItem>
                  <SelectItem value="adoptado">🏠 Adoptado</SelectItem>
                  <SelectItem value="perdido">🔍 Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setEditingAnimal(null)}>Cancelar</Button>
              <Button onClick={handleUpdate}>Guardar Cambios</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Story Dialog */}
      <Dialog open={!!editingStory} onOpenChange={() => setEditingStory(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Historia</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="animal_name">Nombre del Animal</Label>
              <Input id="animal_name" value={editStoryForm.animal_name || ""} onChange={(e) => setEditStoryForm({ ...editStoryForm, animal_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="story_text">Historia</Label>
              <Textarea id="story_text" value={editStoryForm.story_text || ""} onChange={(e) => setEditStoryForm({ ...editStoryForm, story_text: e.target.value })} rows={6} />
            </div>
            <Separator />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setEditingStory(null)}>Cancelar</Button>
              <Button onClick={handleUpdateStory}>Guardar Cambios</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Publication Form Dialog */}
      <Dialog open={showPublicationForm} onOpenChange={setShowPublicationForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" />
              Nueva Publicación
            </DialogTitle>
          </DialogHeader>
          <PublicationForm onSuccess={() => {
            setShowPublicationForm(false);
            if (user) fetchUserAnimals(user.id);
          }} />
        </DialogContent>
      </Dialog>

      {/* Region Selector Modal */}
      {showRegionSelector && user && (
        <RegionSelector
          open={showRegionSelector}
          userId={user.id}
          onRegionSet={() => {
            setShowRegionSelector(false);
            checkUser();
          }}
        />
      )}
    </div>
  );
};

export default Profile;