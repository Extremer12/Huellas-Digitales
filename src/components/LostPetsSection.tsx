import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AnimalCard from "./AnimalCard";
import { Button } from "./ui/button";
import { ChevronDown, Search, Filter, AlertTriangle } from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Animal } from "./AnimalesSection";

interface LostAnimal extends Animal {
  status: string;
}

export default function LostPetsSection() {
  const [animals, setAnimals] = useState<LostAnimal[]>([]);
  const [filter, setFilter] = useState<string>("todos");
  const [sizeFilter, setSizeFilter] = useState<string>("todos");
  const [locationFilter, setLocationFilter] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchLostPets = async () => {
    try {
      const { data, error } = await supabase
        .from("animals")
        .select("id, name, type, age, size, location, description, image_url, health_info, personality, status, user_id, created_at, lat, lng")
        .eq("status", "perdido")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedAnimals: LostAnimal[] = (data as any[]).map((animal) => ({
        id: animal.id,
        name: animal.name,
        type: animal.type as "perro" | "gato" | "otro",
        age: animal.age,
        size: animal.size,
        location: animal.location,
        description: animal.description,
        image: animal.image_url,
        healthInfo: animal.health_info || undefined,
        personality: animal.personality || undefined,
        status: animal.status,
        userId: animal.user_id,
        lat: animal.lat,
        lng: animal.lng
      }));

      setAnimals(formattedAnimals);
    } catch (error) {
      console.error("Error fetching lost pets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    loadUser();

    fetchLostPets();

    const channel = supabase
      .channel("lost-pets-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "animals",
          filter: "status=eq.perdido",
        },
        () => {
          fetchLostPets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredAnimals = animals.filter((animal) => {
    const matchesType = filter === "todos" || animal.type === filter;
    const matchesSize = sizeFilter === "todos" || animal.size === sizeFilter;
    const matchesLocation = locationFilter === "todos" || animal.location === locationFilter;
    const matchesSearch =
      searchQuery === "" ||
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSize && matchesLocation && matchesSearch;
  });

  const displayedAnimals = showAll ? filteredAnimals : filteredAnimals.slice(0, 6);

  return (
    <section id="perdidos" className="py-16 px-4 md:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in px-4">
          <h2 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter text-foreground">
            Mascotas <span className="text-destructive font-black">Perdidas</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            Ayudanos a reunir a estos amiguitos con sus familias. Si viste a alguno de ellos, tu ayuda es clave para su regreso.
          </p>
          <Button
            size="lg"
            className="h-14 px-10 text-lg font-bold btn-hero shadow-xl"
          >
            <AlertTriangle className="w-5 h-5 mr-3" />
            Reportar Mascota Perdida
          </Button>
        </div>

        {/* Filters for Lost Pets */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-background/50 border-white/5 rounded-2xl"
              />
            </div>
            <div className="flex gap-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="h-14 w-[160px] bg-background/50 border-white/5 rounded-2xl">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="perro">Perros</SelectItem>
                  <SelectItem value="gato">Gatos</SelectItem>
                  <SelectItem value="otro">Otros</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-14 w-14 p-0 bg-background/50 border-white/5 rounded-2xl"
              >
                <Filter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Tamaño</label>
                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger className="h-12 bg-background/50 border-white/5">
                    <SelectValue placeholder="Tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Cualquier tamaño</SelectItem>
                    <SelectItem value="pequeño">Pequeño</SelectItem>
                    <SelectItem value="mediano">Mediano</SelectItem>
                    <SelectItem value="grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Ubicación</label>
                <Input
                  placeholder="Ciudad o barrio..."
                  value={locationFilter !== "todos" ? locationFilter : ""}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="h-12 bg-background/50 border-white/5"
                />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando mascotas perdidas...</p>
          </div>
        ) : filteredAnimals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No se encontraron mascotas perdidas en tu región
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedAnimals.map((animal, index) => (
                <div
                  key={animal.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <AnimalCard animal={animal} />
                </div>
              ))}
            </div>

            {filteredAnimals.length > 6 && !showAll && (
              <div className="text-center">
                <Button onClick={() => setShowAll(true)} variant="outline" size="lg">
                  Ver más mascotas perdidas
                </Button>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
