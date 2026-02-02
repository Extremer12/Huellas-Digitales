import { MapPin, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Animal } from "./AnimalesSection";

interface AnimalCardProps {
  animal: Animal;
  onClick?: () => void;
}

const AnimalCard = ({ animal, onClick }: AnimalCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/pet/${animal.id}`);
    }
  };

  return (
    <div className="card-animal group cursor-pointer overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-300 shadow-lg hover:shadow-2xl" onClick={handleCardClick}>
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-muted">
        <img
          src={animal.image}
          alt={animal.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        {/* Subtle overlay for better text contrast if needed, or just aesthetics */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold tracking-tight shadow-lg border border-white/10">
          {animal.type === "perro" ? "🐶 PERRO" : animal.type === "gato" ? "🐱 GATO" : "🐾 OTRO"}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">{animal.name}</h3>

        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{animal.location}</span>
        </div>

        <p className="text-muted-foreground mb-4 line-clamp-2">
          {animal.description}
        </p>

        <div className="flex gap-2 text-sm mb-4">
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
            {animal.age}
          </span>
          <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full font-medium">
            {animal.size}
          </span>
        </div>

        <Button className="w-full btn-hero h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all">
          <Eye className="w-4 h-4 mr-2" />
          Ver más detalles
        </Button>
      </div>
    </div>
  );
};

export default AnimalCard;
