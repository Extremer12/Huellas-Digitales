import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-lg text-muted-foreground">Cargando tu perfil...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-20 lg:py-24">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Profile Header Card */}
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/50">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20" />
            <CardContent className="relative pt-0 pb-8 px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 -mt-16">

                {/* Avatar & Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
                  <div className="relative group">
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Avatar className="w-28 h-28 rounded-2xl shadow-2xl border-4 border-background cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                      <AvatarImage src={profile?.avatar_url} alt="Avatar" className="object-cover" />
                      <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-4xl font-bold text-primary-foreground">
                        {getInitials(user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      ) : (
                        <Camera className="w-8 h-8 text-white" />
                      )}
                    </button>
                  </div>
                  <div className="space-y-2 pb-2">
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Mi Perfil</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        {user?.email}
                      </span>
                      {profile?.province && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {profile.province}, {profile.country}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {pushSupported && (
                    <Button
                      variant={pushSubscribed ? "default" : "outline"}
                      size="sm"
                      onClick={pushSubscribed ? unsubscribePush : subscribePush}
                      disabled={pushLoading}
                      className="gap-2"
                    >
                      {pushSubscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      {pushLoading ? "..." : pushSubscribed ? "Push ON" : "Activar Push"}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
                    <Home className="w-4 h-4" />
                    Inicio
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 text-destructive hover:text-destructive">
                    <LogOut className="w-4 h-4" />
                    Salir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total", value: stats.total, icon: PawPrint, color: "primary" },
              { label: "Disponibles", value: stats.disponible, icon: Heart, color: "emerald" },
              { label: "Adoptados", value: stats.adoptado, icon: Home, color: "amber" },
              { label: "Perdidos", value: stats.perdido, icon: AlertTriangle, color: "rose" },
            ].map((stat) => (
              <Card key={stat.label} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl lg:text-4xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${stat.color}-500/10 group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => setShowPublicationForm(true)} size="lg" className="h-14 gap-3 text-base">
              <Plus className="w-5 h-5" />
              Nueva Publicación
            </Button>
            <Button variant="outline" size="lg" className="h-14 gap-3 text-base" onClick={() => {
              navigate("/");
              setTimeout(() => document.getElementById("adoptados")?.scrollIntoView({ behavior: "smooth" }), 100);
            }}>
              <Heart className="w-5 h-5" />
              Historias de Adopción
            </Button>
            <Button variant="outline" size="lg" className="h-14 gap-3 text-base" onClick={() => {
              navigate("/");
              setTimeout(() => document.getElementById("perdidos")?.scrollIntoView({ behavior: "smooth" }), 100);
            }}>
              <AlertTriangle className="w-5 h-5" />
              Mascotas Perdidas
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="animals" className="w-full">
            <TabsList className="w-full h-auto p-1 grid grid-cols-3 gap-1 bg-muted/50">
              <TabsTrigger value="animals" className="gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <PawPrint className="w-4 h-4" />
                <span className="hidden sm:inline">Publicaciones</span>
                <Badge variant="secondary" className="ml-1">{animals.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="stories" className="gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Historias</span>
                <Badge variant="secondary" className="ml-1">{adoptionStories.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="chats" className="gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Chats</span>
              </TabsTrigger>
            </TabsList>

            {/* Animals Tab */}
            <TabsContent value="animals" className="mt-6">
              {animals.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                      <PawPrint className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Sin publicaciones</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Aún no has publicado ningún animal. ¡Comienza ahora y ayuda a encontrar hogares!
                    </p>
                    <Button onClick={() => setShowPublicationForm(true)} size="lg" className="gap-2">
                      <Plus className="w-5 h-5" />
                      Crear publicación
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {animals.map((animal) => (
                    <Card key={animal.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={animal.image_url}
                          alt={animal.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(animal.status)}
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-xl font-bold text-white mb-1">{animal.name}</h3>
                          <p className="text-white/80 text-sm">
                            {animal.type === "perro" ? "🐕" : animal.type === "gato" ? "🐈" : "🐾"} {animal.age} • {animal.size}
                          </p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4" />
                          {animal.location}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {animal.description}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(animal)} className="flex-1 gap-1.5">
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm({ type: 'animal', id: animal.id })}
                            className="flex-1 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Stories Tab */}
            <TabsContent value="stories" className="mt-6">
              {adoptionStories.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                      <Heart className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Sin historias</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      ¿Adoptaste una mascota? ¡Comparte tu historia y motiva a otros!
                    </p>
                    <Button onClick={() => {
                      navigate("/");
                      setTimeout(() => document.getElementById("adoptados")?.scrollIntoView({ behavior: "smooth" }), 100);
                    }} size="lg" className="gap-2">
                      <Heart className="w-5 h-5" />
                      Compartir historia
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {adoptionStories.map((story) => (
                    <Card key={story.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={story.story_image_url}
                          alt={story.animal_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-xl font-bold text-white mb-1">{story.animal_name}</h3>
                          <p className="text-white/80 text-sm flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(story.created_at)}
                          </p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {story.story_text}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditStory(story)} className="flex-1 gap-1.5">
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm({ type: 'story', id: story.id })}
                            className="flex-1 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Chats Tab */}
            <TabsContent value="chats" className="mt-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Mis Conversaciones
                  </CardTitle>
                  <CardDescription>
                    Gestiona tus conversaciones con adoptantes y publicadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user && <ChatList userId={user.id} />}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar {deleteConfirm?.type === 'animal' ? 'esta publicación' : 'esta historia'}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirm?.type === 'animal') handleDelete(deleteConfirm.id);
                else if (deleteConfirm?.type === 'story') handleDeleteStory(deleteConfirm.id);
              }}
              className="flex-1"
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Animal Dialog */}
      <Dialog open={!!editingAnimal} onOpenChange={() => setEditingAnimal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="flex gap-3">
              <Button onClick={handleUpdate} className="flex-1">Guardar Cambios</Button>
              <Button variant="outline" onClick={() => setEditingAnimal(null)} className="flex-1">Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Story Dialog */}
      <Dialog open={!!editingStory} onOpenChange={() => setEditingStory(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Historia de Adopción</DialogTitle>
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
            <div className="flex gap-3">
              <Button onClick={handleUpdateStory} className="flex-1">Guardar Cambios</Button>
              <Button variant="outline" onClick={() => setEditingStory(null)} className="flex-1">Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Publication Form Dialog */}
      <Dialog open={showPublicationForm} onOpenChange={setShowPublicationForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <PawPrint className="w-6 h-6" />
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