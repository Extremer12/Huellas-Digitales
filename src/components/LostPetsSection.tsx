import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AnimalCard from "./AnimalCard";
import AnimalModal from "./AnimalModal";
import { Button } from "./ui/button";
import { ChevronDown, Search } from "lucide-react";
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
  const [selectedAnimal, setSelectedAnimal] = useState<LostAnimal | null>(null);
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
        .select("id, name, type, age, size, location, description, image_url, health_info, personality, status, user_id, created_at")
        .eq("status", "perdido")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedAnimals: LostAnimal[] = data.map((animal) => ({
        id: animal.id,
        name: animal.name,
        type: animal.type,
        age: animal.age,
        size: animal.size,
        location: animal.location,
        description: animal.description,
        image: animal.image_url,
        healthInfo: animal.health_info || undefined,
        personality: animal.personality || undefined,
        status: animal.status,
        userId: animal.user_id,
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
  const uniqueLocations = Array.from(new Set(animals.map((a) => a.location)));

  return (
    <section id="perdidos" className="py-16 px-4 md:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">Mascotas Perdidas</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Ayuda a reunir mascotas perdidas con sus familias
          </p>
          <Button 
            onClick={() => {
              const element = document.getElementById("publicar");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }}
            size="lg"
            className="btn-hero"
          >
            Reportar Mascota Perdida
          </Button>
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
                  <AnimalCard animal={animal} onClick={() => setSelectedAnimal(animal)} />
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

        {selectedAnimal && (
          <AnimalModal
            animal={selectedAnimal}
            onClose={() => setSelectedAnimal(null)}
            currentUserId={currentUserId || undefined}
          />
        )}
      </div>
    </section>
  );
}
