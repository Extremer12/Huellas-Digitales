import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, PawPrint, Heart, ShieldAlert, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PublicProfileModalProps {
    userId: string | null;
    onClose: () => void;
}

const PublicProfileModal = ({ userId, onClose }: PublicProfileModalProps) => {
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ posts: 0, stories: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadPublicProfile();
        }
    }, [userId]);

    const loadPublicProfile = async () => {
        setLoading(true);
        try {
            // Load Profile
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            setProfile(profileData);

            // Load Stats
            const [postsRes, storiesRes] = await Promise.all([
                supabase.from("animals").select("id", { count: "exact", head: true }).eq("user_id", userId),
                supabase.from("adoption_stories").select("id", { count: "exact", head: true }).eq("adopter_user_id", userId),
            ]);

            setStats({
                posts: postsRes.count || 0,
                stories: storiesRes.count || 0,
            });
        } catch (error) {
            console.error("Error loading public profile:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!userId) return null;

    return (
        <Dialog open={!!userId} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-card rounded-[2.5rem] shadow-2xl">
                {loading ? (
                    <div className="h-80 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                        <p className="text-sm text-muted-foreground animate-pulse">Cargando perfil...</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Header / Background */}
                        <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative">
                            <div className="absolute top-0 right-0 p-6">
                                <Badge variant="outline" className="bg-background/50 backdrop-blur-md border-primary/20 text-primary font-bold">
                                    PERFIL PÚBLICO
                                </Badge>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="px-8 pb-8 -mt-12 relative z-10 flex flex-col items-center text-center">
                            <Avatar className="w-24 h-24 border-4 border-background shadow-xl mb-4">
                                <AvatarImage src={profile?.avatar_url} className="object-cover" />
                                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                                    {profile?.full_name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>

                            <h3 className="text-2xl font-black tracking-tight text-foreground">
                                {profile?.full_name || "Usuario de Huellas"}
                            </h3>

                            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                {profile?.province ? `${profile.province}, ${profile.country}` : "Ubicación no especificada"}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60 mt-3 uppercase tracking-widest font-bold">
                                <Calendar className="w-3 h-3 text-primary/40" />
                                Miembro desde {profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy", { locale: es }) : "---"}
                            </div>

                            {/* Stats Bar */}
                            <div className="grid grid-cols-2 gap-4 w-full mt-8">
                                <div className="bg-muted/30 p-4 rounded-3xl border border-border/40 group hover:bg-primary/5 transition-colors">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <PawPrint className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-black text-muted-foreground uppercase tracking-tighter">Posts</span>
                                    </div>
                                    <p className="text-3xl font-black text-foreground tabular-nums">{stats.posts}</p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-3xl border border-border/40 group hover:bg-primary/5 transition-colors">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Heart className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-black text-muted-foreground uppercase tracking-tighter">Historias</span>
                                    </div>
                                    <p className="text-3xl font-black text-foreground tabular-nums">{stats.stories}</p>
                                </div>
                            </div>

                            {/* Bio (Optional or derived) */}
                            <p className="mt-6 text-sm text-muted-foreground leading-relaxed italic">
                                "{stats.posts > 0 ? "Usuario activo en la comunidad de rescate." : "Explorando la comunidad de Huellas Digitales."}"
                            </p>

                            <div className="w-full h-px bg-border/40 my-8" />

                            {/* Safety Action */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 text-[10px] uppercase font-bold tracking-widest h-auto py-2 rounded-xl"
                            >
                                <ShieldAlert className="w-3 h-3 mr-2" />
                                Reportar comportamiento sospechoso
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PublicProfileModal;
