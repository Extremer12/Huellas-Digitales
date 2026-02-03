import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AnimalCard from "./AnimalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Dog, Cat, PawPrint, Filter, Search, AlertTriangle, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Reusing the Animal type relative to what we have in other files
export type Animal = {
    id: string;
    name: string;
    type: "perro" | "gato" | "otro";
    age: string;
    size: string;
    location: string;
    description: string;
    fullDescription?: string;
    image: string;
    healthInfo?: string;
    personality?: string;
    userId: string;
    lat?: number;
    lng?: number;
    status: string;
};

const UnifiedFeed = () => {
    const { toast } = useToast();
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [activeTab, setActiveTab] = useState<"todos" | "adopcion" | "perdidos">("todos");
    const [typeFilter, setTypeFilter] = useState<"todos" | "perro" | "gato" | "otro">("todos");
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [displayCount, setDisplayCount] = useState(8); // Start with more items for "Feed" feel

    useEffect(() => {
        fetchAnimals();

        const channel = supabase.channel("unified-feed-changes").on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "animals"
        }, () => {
            fetchAnimals();
        }).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchAnimals = async () => {
        try {
            setLoading(true);
            // Fetch both 'disponible' (adopcion) and 'perdido'
            const { data, error } = await supabase
                .from("animals")
                .select("*")
                .in("status", ["disponible", "perdido"])
                .order("created_at", { ascending: false });

            if (error) throw error;

            const formattedAnimals: Animal[] = (data as any[] || []).map((animal) => ({
                id: animal.id,
                name: animal.name,
                type: animal.type as "perro" | "gato" | "otro",
                age: animal.age,
                size: animal.size,
                location: animal.location,
                description: animal.description,
                fullDescription: `${animal.description}${animal.personality ? `\n\nPersonalidad: ${animal.personality}` : ""}${animal.health_info ? `\n\nSalud: ${animal.health_info}` : ""}`,
                image: animal.image_url,
                healthInfo: animal.health_info,
                personality: animal.personality,
                userId: animal.user_id,
                lat: animal.lat,
                lng: animal.lng,
                status: animal.status
            }));

            setAnimals(formattedAnimals);
        } catch (error: any) {
            console.error("Error fetching feed:", error);
            toast({
                title: "Error al cargar el feed",
                description: "Intenta recargar la página.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredAnimals = animals.filter(animal => {
        // Status Filter (Tab)
        if (activeTab === "adopcion" && animal.status !== "disponible") return false;
        if (activeTab === "perdidos" && animal.status !== "perdido") return false;

        // Type Filter
        if (typeFilter !== "todos" && animal.type !== typeFilter) return false;

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                animal.name.toLowerCase().includes(query) ||
                animal.description.toLowerCase().includes(query) ||
                animal.location.toLowerCase().includes(query)
            );
        }

        return true;
    });

    const displayedAnimals = filteredAnimals.slice(0, displayCount);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Sticky Header for Feed Controls */}
            <div className="sticky top-[72px] z-30 bg-background/80 backdrop-blur-md border-b border-border/40 py-4 px-4 shadow-sm transition-all">
                <div className="container mx-auto">

                    {/* Main Tabs */}
                    <div className="flex justify-center mb-4">
                        <div className="bg-muted p-1 rounded-full grid grid-cols-3 w-full max-w-md">
                            <button
                                onClick={() => setActiveTab("todos")}
                                className={`rounded-full py-2 text-sm font-bold transition-all ${activeTab === "todos" ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Todo
                            </button>
                            <button
                                onClick={() => setActiveTab("adopcion")}
                                className={`rounded-full py-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "adopcion" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Heart className="w-3 h-3" /> Adopción
                            </button>
                            <button
                                onClick={() => setActiveTab("perdidos")}
                                className={`rounded-full py-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "perdidos" ? "bg-background shadow-md text-destructive" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <AlertTriangle className="w-3 h-3" /> Perdidos
                            </button>
                        </div>
                    </div>

                    {/* Search & Filters Toggle */}
                    <div className="flex gap-2 max-w-2xl mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, raza, ubicación..."
                                className="pl-9 bg-secondary/50 border-transparent focus:bg-background transition-all rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            variant={showFilters || typeFilter !== "todos" ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => setShowFilters(!showFilters)}
                            className="rounded-xl shrink-0"
                        >
                            <Filter className={`w-4 h-4 ${typeFilter !== "todos" ? "text-primary" : ""}`} />
                        </Button>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="max-w-2xl mx-auto mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                <Button
                                    variant={typeFilter === "todos" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTypeFilter("todos")}
                                    className="rounded-full px-4"
                                >
                                    Todos
                                </Button>
                                <Button
                                    variant={typeFilter === "perro" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTypeFilter("perro")}
                                    className="rounded-full px-4"
                                >
                                    <Dog className="w-3 h-3 mr-2" /> Perros
                                </Button>
                                <Button
                                    variant={typeFilter === "gato" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTypeFilter("gato")}
                                    className="rounded-full px-4"
                                >
                                    <Cat className="w-3 h-3 mr-2" /> Gatos
                                </Button>
                                <Button
                                    variant={typeFilter === "otro" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTypeFilter("otro")}
                                    className="rounded-full px-4"
                                >
                                    <PawPrint className="w-3 h-3 mr-2" /> Otros
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions & Feed Grid */}
            <div className="container mx-auto px-4 py-6">

                {/* Quick Publish Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
                    <Button
                        onClick={() => window.location.href = "/?action=publish&type=adoption"}
                        className="rounded-full h-12 px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-transform font-bold"
                    >
                        <Heart className="w-5 h-5 mr-2" />
                        Publicar Adopción
                    </Button>
                    <Button
                        onClick={() => window.location.href = "/?action=publish&type=lost"}
                        variant="secondary"
                        className="rounded-full h-12 px-6 shadow-lg hover:scale-105 transition-transform font-bold bg-white text-black border border-border/50"
                    >
                        <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
                        Reportar Perdido
                    </Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : displayedAnimals.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No se encontraron resultados</h3>
                        <p className="text-muted-foreground mb-6">Intenta con otros filtros o términos de búsqueda.</p>
                        <Button onClick={() => {
                            setSearchQuery("");
                            setTypeFilter("todos");
                            setActiveTab("todos");
                        }}>
                            Limpiar filtros
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            {displayedAnimals.map((animal) => (
                                <div key={animal.id} className="animate-fade-in">
                                    <AnimalCard animal={animal} />
                                </div>
                            ))}
                        </div>

                        {/* Load More Trigger */}
                        {filteredAnimals.length > displayedAnimals.length && (
                            <div className="mt-12 text-center">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setDisplayCount(prev => prev + 8)}
                                    className="rounded-full px-8 h-12"
                                >
                                    Ver más animalitos
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UnifiedFeed;
