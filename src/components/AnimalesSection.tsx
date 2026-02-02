import { useState, useEffect } from "react";
import { Search, Dog, Cat, PawPrint, Filter } from "lucide-react";
import AnimalCard from "./AnimalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
};

interface AnimalesSectionProps {
  initialSelectedAnimalId?: string | null;
}

const AnimalesSection = ({ initialSelectedAnimalId }: AnimalesSectionProps) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<"todos" | "perro" | "gato" | "otro">("todos");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState<string>("todos");
  const [locationFilter, setLocationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [proximityFilter, setProximityFilter] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const INITIAL_DISPLAY_COUNT = 6;

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    loadUser();

    fetchAnimals();
    const channel = supabase.channel("animals-changes").on("postgres_changes", {
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

  useEffect(() => {
    if (initialSelectedAnimalId && animals.length > 0) {
      const animal = animals.find(a => a.id === initialSelectedAnimalId);
      if (animal) {
        // Since we decided to go full screen, we should navigate if there's an initial ID
        // but for now, the section usually just shows a list.
        // If it was meant to open the modal, we now just let the user click.
      }
    }
  }, [initialSelectedAnimalId, animals]);

  const fetchAnimals = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("animals").select("id, name, type, age, size, location, description, image_url, health_info, personality, user_id, status, created_at, lat, lng").eq("status", "disponible").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      const formattedAnimals: Animal[] = (data || []).map(animal => ({
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
        lat: animal.lat,
        lng: animal.lng
      }));
      setAnimals(formattedAnimals);
    } catch (error: any) {
      toast({
        title: "Error al cargar animales",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const toggleProximityFilter = () => {
    if (proximityFilter) {
      setProximityFilter(false);
      return;
    }

    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocalización no soportada", variant: "destructive" });
      return;
    }

    toast({ title: "Obteniendo ubicación...", description: "Calculando animales cercanos..." });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setProximityFilter(true);
      },
      (error) => {
        console.error("Error obtaining location", error);
        toast({ title: "Error", description: "No se pudo obtener tu ubicación", variant: "destructive" });
      }
    );
  };

  // Apply all filters
  const filteredAnimals = animals.filter(animal => {
    // Type filter
    if (filter !== "todos" && animal.type !== filter) return false;

    // Size filter
    if (sizeFilter !== "todos") {
      const animalSize = animal.size.toLowerCase();
      if (sizeFilter === "pequeño" && !animalSize.includes("pequeño") && !animalSize.includes("chico")) return false;
      if (sizeFilter === "mediano" && !animalSize.includes("mediano")) return false;
      if (sizeFilter === "grande" && !animalSize.includes("grande")) return false;
    }

    // Location filter
    if (locationFilter && !animal.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;

    // Search query (searches in name, description, personality)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = animal.name.toLowerCase().includes(query);
      const matchesDescription = animal.description.toLowerCase().includes(query);
      const matchesPersonality = animal.personality?.toLowerCase().includes(query);
      if (!matchesName && !matchesDescription && !matchesPersonality) return false;
    }

    // Proximity Filter
    if (proximityFilter && userLocation) {
      if (!animal.lat || !animal.lng) return false; // Exclude animals without coordinates
      const dist = calculateDistance(userLocation.lat, userLocation.lng, animal.lat, animal.lng);
      if (dist > 1.0) return false; // 1km radius
    }

    return true;
  });

  const displayedAnimals = showAll ? filteredAnimals : filteredAnimals.slice(0, INITIAL_DISPLAY_COUNT);

  return <>
    <section id="animales" className="section-padding bg-gradient-to-b from-background to-card scroll-reveal">
      <div className="container-custom">
        <div className="text-center mb-12">

          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Animalitos que buscan un hogar</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explorá fotos y encontrá a tu nuevo compañero. Cada uno tiene una historia única.
          </p>
        </div>

        {/* Type Filters */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          <Button onClick={() => setFilter("todos")} variant={filter === "todos" ? "default" : "outline"} className={filter === "todos" ? "btn-hero" : ""} size="lg">
            Todos
          </Button>
          <Button onClick={() => setFilter("perro")} variant={filter === "perro" ? "default" : "outline"} className={filter === "perro" ? "btn-hero" : ""} size="lg">
            <Dog className="w-5 h-5 mr-2" />
            Perros
          </Button>
          <Button onClick={() => setFilter("gato")} variant={filter === "gato" ? "default" : "outline"} className={filter === "gato" ? "btn-hero" : ""} size="lg">
            <Cat className="w-5 h-5 mr-2" />
            Gatos
          </Button>
          <Button onClick={() => setFilter("otro")} variant={filter === "otro" ? "default" : "outline"} className={filter === "otro" ? "btn-hero" : ""} size="lg">
            <PawPrint className="w-5 h-5 mr-2" />
            Otros
          </Button>
        </div>

        {/* Advanced Filters */}
        <div className="max-w-4xl mx-auto mb-12 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant={showFilters ? "secondary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Ocultar filtros" : "Filtros avanzados"}
          </Button>

          <Button
            variant={proximityFilter ? "default" : "outline"}
            onClick={toggleProximityFilter}
            className={`w-full sm:w-auto ${proximityFilter ? "btn-hero ring-2 ring-primary ring-offset-2" : "border-primary/50 text-primary hover:bg-primary/5"}`}
          >
            <span className="mr-2">📍</span>
            {proximityFilter ? "Mostrando cercanos (<1km)" : "Ver cercanos a mí"}
          </Button>
        </div>

        {showFilters && (
          <div className="max-w-4xl mx-auto mb-8 grid md:grid-cols-3 gap-4 p-6 bg-card/50 rounded-xl border border-primary/20 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <Input
                placeholder="Nombre, descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tamaño</label>
              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pequeño">Pequeño</SelectItem>
                  <SelectItem value="mediano">Mediano</SelectItem>
                  <SelectItem value="grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Ubicación</label>
              <Input
                placeholder="Ciudad, barrio..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Animals Grid */}
        {loading ? <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Cargando animales...</p>
        </div> : <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedAnimals.map((animal, index) => <div key={animal.id} className="animate-fade-in" style={{
              animationDelay: `${index * 0.1}s`
            }}>
              <AnimalCard animal={animal} />
            </div>)}
          </div>

          {filteredAnimals.length === 0 && <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {proximityFilter
                ? "No hay animalitos a menos de 1km de tu ubicación."
                : "No se encontraron animales en esta categoría."}
            </p>
            {proximityFilter && (
              <Button variant="link" onClick={() => setProximityFilter(false)}>
                Ver todos los animales
              </Button>
            )}
          </div>}

          {filteredAnimals.length > INITIAL_DISPLAY_COUNT && <div className="text-center mt-12">
            <Button onClick={() => setShowAll(!showAll)} size="lg" className="btn-hero">
              {showAll ? "Ver menos" : `Ver más (${filteredAnimals.length - INITIAL_DISPLAY_COUNT} más)`}
            </Button>
          </div>}
        </>}
      </div>
    </section>
  </>;
};
export default AnimalesSection;