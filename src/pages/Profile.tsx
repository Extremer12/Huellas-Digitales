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
import Footer from "@/components/Footer";

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

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12 lg:py-20 space-y-16 mt-4">

        {/* PREMIUM PROFILE HERO */}
        <section className="relative overflow-hidden rounded-[3rem] bg-card/40 backdrop-blur-md border border-primary/10 shadow-2xl p-8 md:p-12">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-end justify-between">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-left">
              {/* Avatar Section */}
              <div className="relative group">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="relative">
                  <Avatar className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-8 border-card shadow-2xl cursor-pointer transition-all duration-500 group-hover:scale-[1.02] group-hover:rotate-2" onClick={() => avatarInputRef.current?.click()}>
                    {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Avatar" className="object-cover" />}
                    <AvatarFallback className="text-4xl font-black bg-gradient-to-br from-primary to-primary/60 text-white">
                      {getInitials(user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-primary-foreground rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 border-4 border-card"
                  >
                    {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* User Identity */}
              <div className="space-y-4">
                <div className="inline-flex px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                  Huella Digital Verificada
                </div>
                <div className="space-y-1">
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground leading-none">
                    {profile?.full_name || "Mi Espacio"}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm font-medium text-muted-foreground/80">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" /> {user?.email}
                    </span>
                    {profile?.province && (
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> {profile.province}, {profile.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
              {pushSupported && (
                <Button
                  variant={pushSubscribed ? "secondary" : "outline"}
                  onClick={pushSubscribed ? unsubscribePush : subscribePush}
                  disabled={pushLoading}
                  className="h-12 rounded-2xl px-8 font-bold border-2 transition-all hover:scale-105 active:scale-95"
                >
                  {pushSubscribed ? <Bell className="w-4 h-4 mr-2 text-primary" /> : <BellOff className="w-4 h-4 mr-2" />}
                  {pushLoading ? "..." : pushSubscribed ? "Notificaciones ON" : "Activar Notificaciones"}
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="h-12 rounded-2xl font-bold text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
              </Button>
            </div>
          </div>
        </section>

        {/* INTERACTIVE STATS GRID */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Publicaciones", value: stats.total, icon: PawPrint, color: "bg-primary", text: "text-primary" },
            { label: "En Adopción", value: stats.disponible, icon: Home, color: "bg-emerald-500", text: "text-emerald-500" },
            { label: "Adoptados", value: stats.adoptado, icon: Heart, color: "bg-rose-500", text: "text-rose-500" },
            { label: "Historias", value: adoptionStories.length, icon: Calendar, color: "bg-amber-500", text: "text-amber-500" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-card/60 backdrop-blur-sm p-6 rounded-[2rem] border border-primary/5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
              <div className={`${stat.color}/10 ${stat.text} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className="text-4xl font-black text-foreground">{stat.value}</h4>
            </div>
          ))}
        </section>

        <Separator className="bg-primary/5 h-px" />

        {/* MAIN CONTENT AREA */}
        <div className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <TabsList className="bg-card/50 p-1 rounded-2xl h-14 border border-border/50">
                <TabsTrigger value="animals" className="rounded-xl px-8 h-full font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-none transition-all">
                  Mascotas
                </TabsTrigger>
                <TabsTrigger value="stories" className="rounded-xl px-8 h-full font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-none transition-all">
                  Historias
                </TabsTrigger>
                <TabsTrigger value="chats" className="rounded-xl px-8 h-full font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-none transition-all">
                  Mensajes
                </TabsTrigger>
              </TabsList>

              <Button
                onClick={() => setShowPublicationForm(true)}
                size="lg"
                className="w-full md:w-auto h-14 rounded-2xl px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5 mr-3" /> Crear Nueva Publicación
              </Button>
            </div>

            <TabsContent value="animals" className="pt-4 outline-none">
              {animals.length === 0 ? (
                <div className="bg-card/40 border-2 border-dashed border-primary/10 rounded-[3rem] p-20 text-center space-y-6">
                  <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                    <PawPrint className="w-12 h-12 text-primary/30" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">Tu lista está vacía</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">Publica un animal en adopción o reporta una mascota perdida para empezar a ayudar.</p>
                  <Button variant="outline" className="h-12 rounded-xl px-8 border-2" onClick={() => setShowPublicationForm(true)}>Comenzar ahora</Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {animals.map((animal) => (
                  <Card key={animal.id} className="group overflow-hidden rounded-[2.5rem] border-none bg-card/80 shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img src={animal.image_url} alt={animal.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        <div className="absolute top-4 right-4 z-20">
                          {getStatusBadge(animal.status)}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div className="space-y-1">
                            <h3 className="text-2xl font-black tracking-tight">{animal.name}</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-primary" /> {animal.location}
                            </p>
                          </div>
                          <Badge variant="secondary" className="rounded-lg bg-primary/5 text-primary border-none font-bold uppercase text-[10px] tracking-widest">{animal.type}</Badge>
                        </div>

                        <div className="flex gap-3 mt-8">
                          <Button variant="outline" onClick={() => handleEdit(animal)} className="flex-1 h-12 rounded-xl border-2 font-bold hover:bg-primary/5 hover:text-primary transition-all">
                            <Edit className="w-4 h-4 mr-2" /> Editar
                          </Button>
                          <Button variant="ghost" onClick={() => setDeleteConfirm({ type: 'animal', id: animal.id })} className="w-12 h-12 rounded-xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stories" className="pt-4 outline-none">
              {adoptionStories.length === 0 ? (
                <div className="bg-card/40 border-2 border-dashed border-primary/10 rounded-[3rem] p-20 text-center space-y-6">
                  <div className="w-24 h-24 bg-rose-500/5 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-12 h-12 text-rose-500/30" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">Comparte la felicidad</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">¿Adoptaste? Tu historia puede inspirar a otros a abrir su hogar.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {adoptionStories.map((story) => (
                    <Card key={story.id} className="group overflow-hidden rounded-[2.5rem] border-none bg-card/80 shadow-2xl transition-all duration-500">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img src={story.story_image_url} alt={story.animal_name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                          <h4 className="text-xl font-black text-white">{story.animal_name}</h4>
                        </div>
                      </div>
                      <CardContent className="p-8">
                        <p className="text-muted-foreground line-clamp-2 italic font-serif text-base mb-6">"{story.story_text}"</p>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => handleEditStory(story)} className="flex-1 h-12 rounded-xl border-2 font-bold hover:bg-primary/5 transition-all">
                            Editar Historia
                          </Button>
                          <Button variant="ghost" onClick={() => setDeleteConfirm({ type: 'story', id: story.id })} className="w-12 h-12 rounded-xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>


            <TabsContent value="chats" className="pt-4 outline-none">
              <div className="bg-card/40 rounded-[3rem] border border-primary/5 shadow-xl overflow-hidden">
                <div className="p-10 border-b border-primary/5 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-foreground">Bandeja de Entrada</h3>
                      <p className="text-muted-foreground font-medium">Gestiona tus conversaciones y procesos de adopción.</p>
                    </div>
                  </div>
                </div>
                <div className="p-0">
                  {user && <ChatList userId={user.id} />}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* MODALS PERSIST (Same Logic, Just Stylized) */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-10 border-none shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-destructive animate-bounce" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-black text-center">¿Estás seguro?</DialogTitle>
              <DialogDescription className="text-center text-base">
                Esta acción eliminará permanentemente este contenido de Huellas Digitales.
              </DialogDescription>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="flex-1 h-14 rounded-2xl font-bold">Cancelar</Button>
              <Button
                variant="destructive"
                className="flex-1 h-14 rounded-2xl font-bold shadow-xl shadow-destructive/20"
                onClick={() => {
                  if (deleteConfirm?.type === 'animal') handleDelete(deleteConfirm.id);
                  else if (deleteConfirm?.type === 'story') handleDeleteStory(deleteConfirm.id);
                }}
              >
                Sí, Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Animal Modal - Polished */}
      <Dialog open={!!editingAnimal} onOpenChange={() => setEditingAnimal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-8 md:p-12 border-none shadow-2xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-4xl font-black tracking-tighter">Editar Mascota</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground ml-1">Nombre</Label>
                <Input className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/40" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground ml-1">Categoría</Label>
                <Select value={editForm.type} onValueChange={(value) => setEditForm({ ...editForm, type: value as "perro" | "gato" | "otro" })}>
                  <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none shadow-none"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    <SelectItem value="perro">🐕 Perro</SelectItem>
                    <SelectItem value="gato">🐈 Gato</SelectItem>
                    <SelectItem value="otro">🐾 Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground ml-1">Edad</Label>
                <Input className="h-14 rounded-2xl bg-muted/30 border-none" value={editForm.age || ""} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground ml-1">Tamaño</Label>
                <Input className="h-14 rounded-2xl bg-muted/30 border-none" value={editForm.size || ""} onChange={(e) => setEditForm({ ...editForm, size: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground ml-1">Ubicación</Label>
              <Input className="h-14 rounded-2xl bg-muted/30 border-none" value={editForm.location || ""} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground ml-1">Descripción</Label>
              <Textarea className="rounded-2xl bg-muted/30 border-none resize-none p-4" rows={4} value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground ml-1">Estado de Publicación</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger className="h-14 rounded-2xl bg-primary/10 border-none shadow-none font-bold text-primary"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-xl">
                  <SelectItem value="disponible">✅ Disponible para Adopción</SelectItem>
                  <SelectItem value="adoptado">🏠 Final Feliz (Adoptado)</SelectItem>
                  <SelectItem value="perdido">🔍 Extraviado / Buscado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4 pt-6">
              <Button variant="ghost" onClick={() => setEditingAnimal(null)} className="flex-1 h-14 rounded-2xl font-bold">Cancelar</Button>
              <Button onClick={handleUpdate} className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">Guardar Cambios</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Publication Form Dialog - Polished */}
      <Dialog open={showPublicationForm} onOpenChange={setShowPublicationForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl overflow-hidden">
          <div className="bg-primary/5 p-12 border-b border-primary/5">
            <h2 className="text-4xl font-black tracking-tighter">Crear Publicación</h2>
            <p className="text-muted-foreground font-medium mt-2">Sigue los pasos para publicar una nueva mascota.</p>
          </div>
          <div className="p-8 md:p-12">
            <PublicationForm onSuccess={() => {
              setShowPublicationForm(false);
              if (user) fetchUserAnimals(user.id);
            }} />
          </div>
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