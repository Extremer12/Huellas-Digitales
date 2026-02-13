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
import { Dog, Cat, PawPrint, Filter, Search, AlertTriangle, Heart, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

// DB Row Type
type AnimalRow = Database['public']['Tables']['animals']['Row'];

// UI Type (matching what AnimalCard likely expects based on previous code)
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
    healthInfo?: string; // Mapped from health_info
    personality?: string;
    userId: string; // Mapped from user_id
    lat?: number;
    lng?: number;
    status: string;
};

interface UnifiedFeedProps {
    onOpenWizard?: (type: "adopcion" | "perdido" | null) => void;
}

const PAGE_SIZE = 8;

const UnifiedFeed = ({ onOpenWizard }: UnifiedFeedProps) => {
    const { toast } = useToast();
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Filters
    const [activeTab, setActiveTab] = useState<"todos" | "adopcion" | "perdidos">("todos");
    const [typeFilter, setTypeFilter] = useState<"todos" | "perro" | "gato" | "otro">("todos");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset and fetch when filters change
    useEffect(() => {
        setPage(0);
        setHasMore(true);
        setAnimals([]); // Clear current list to avoid mixing old/filtered results visually
        fetchAnimals(0, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, typeFilter, debouncedSearch]);

    // Setup Realtime subscription
    useEffect(() => {
        const channel = supabase.channel("unified-feed-changes").on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "animals"
        }, () => {
            // When something changes, simplest approach for consistency is to reload the first page 
            // or we could try to append strictly new items, but that's complex with sorting.
            // For now, let's just refresh the current view if it's the first page, or notify user.
            // To be safe and simple: Reload page 0.
            fetchAnimals(0, true);
        }).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchAnimals = async (pageToFetch: number, isNewFilter: boolean = false) => {
        try {
            setLoading(true);

            let query = supabase
                .from("animals")
                .select("*", { count: 'exact' });

            // 1. Status Filter
            if (activeTab === "adopcion") {
                query = query.eq("status", "disponible");
            } else if (activeTab === "perdidos") {
                query = query.eq("status", "perdido");
            } else {
                query = query.in("status", ["disponible", "perdido"]);
            }

            // 2. Type Filter
            if (typeFilter !== "todos") {
                query = query.eq("type", typeFilter);
            }

            // 3. Search Filter
            if (debouncedSearch) {
                // ILIKE for case-insensitive partial match
                // Note: basic ilike on single columns. multiple columns requires 'or' syntax
                query = query.or(`name.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%,location.ilike.%${debouncedSearch}%`);
            }

            // 4. Pagination
            const from = pageToFetch * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            query = query
                .order("created_at", { ascending: false })
                .range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            const formattedAnimals: Animal[] = (data || []).map((animal: AnimalRow) => ({
                id: animal.id,
                name: animal.name,
                type: animal.type as "perro" | "gato" | "otro",
                age: animal.age,
                size: animal.size,
                location: animal.location,
                description: animal.description,
                fullDescription: `${animal.description}${animal.personality ? `\n\nPersonalidad: ${animal.personality}` : ""}${animal.health_info ? `\n\nSalud: ${animal.health_info}` : ""}`,
                image: animal.image_url,
                healthInfo: animal.health_info || undefined,
                personality: animal.personality || undefined,
                userId: animal.user_id,
                // These fields exist in the inferred type for UI but might not be in DB row if not selected or if they are calculated
                // Assuming they are not in DB row based on types.ts (lat/lng were not in the types.ts provided in context)
                // If they are needed, they should be added to the DB or ignored if they were ad-hoc.
                // Checking types.ts previously: NO lat/lng in 'animals' table. 
                // So we omit them or mock them. Previous code had them as optional.
                lat: undefined,
                lng: undefined,
                status: animal.status
            }));

            if (isNewFilter) {
                setAnimals(formattedAnimals);
            } else {
                setAnimals(prev => [...prev, ...formattedAnimals]);
            }

            // Check if we have more
            // If we got fewer items than requested, we reached the end
            if ((data || []).length < PAGE_SIZE) {
                setHasMore(false);
            } else if (count !== null && (from + PAGE_SIZE) >= count) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

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

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchAnimals(nextPage, false);
    };

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

                {/* Unified Publish Action */}
                <div className="flex justify-center mb-8">
                    <Button
                        onClick={() => onOpenWizard?.(null)}
                        className="rounded-full h-14 px-10 shadow-xl shadow-primary/20 hover:scale-105 transition-all font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Plus className="w-6 h-6 mr-3" />
                        Comenzar a Publicar
                    </Button>
                </div>

                {/* Loading State (Initial) */}
                {loading && animals.length === 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : animals.length === 0 ? (
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
                            {animals.map((animal) => (
                                <div key={animal.id} className="animate-fade-in">
                                    <AnimalCard animal={animal} />
                                </div>
                            ))}
                        </div>

                        {/* Load More Trigger */}
                        {hasMore && (
                            <div className="mt-12 text-center">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="rounded-full px-8 h-12"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {loading ? "Cargando..." : "Ver más animalitos"}
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
