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
    <div className="card-animal group cursor-pointer" onClick={handleCardClick}>
      {/* Image */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={animal.image}
          alt={animal.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
          {animal.type === "perro" ? "🐕 Perro" : animal.type === "gato" ? "🐈 Gato" : "🐾 Otro"}
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

        <Button className="w-full btn-hero group-hover:shadow-[var(--shadow-hover)]">
          <Eye className="w-4 h-4 mr-2" />
          Ver más
        </Button>
      </div>
    </div>
  );
};

export default AnimalCard;
