import { MapPin, ArrowRight, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Animal } from "./AnimalesSection";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
    <Card
      className="group relative cursor-pointer overflow-hidden rounded-[2rem] border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[4/5] sm:aspect-square overflow-hidden">
        <img
          src={animal.image}
          alt={animal.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
          {animal.status === "perdido" ? (
            <Badge variant="destructive" className="flex items-center gap-1 shadow-lg bg-red-600 animate-pulse text-xs">
              <AlertTriangle className="w-3 h-3" /> PERDIDO
            </Badge>
          ) : (
            <Badge className="bg-primary text-primary-foreground shadow-lg font-bold text-xs">
              EN ADOPCIÓN
            </Badge>
          )}
          {animal.sex && animal.sex !== "desconocido" && (
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-foreground shadow-sm text-xs font-bold px-2 py-0.5">
              {animal.sex === "macho" ? "♂ Macho" : "♀ Hembra"}
            </Badge>
          )}
        </div>

        {/* Overlay gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3 sm:p-4">
          <h3 className="text-white font-bold text-lg sm:text-xl truncate drop-shadow-md">
            {animal.name}
          </h3>
          <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm mt-1">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="truncate">{animal.location}</span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground font-medium uppercase tracking-wider">
            {animal.type}
          </span>
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground font-medium uppercase tracking-wider">
            {animal.size}
          </span>
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground font-medium uppercase tracking-wider">
            {animal.age}
          </span>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-between h-9 sm:h-10 text-xs sm:text-sm font-semibold hover:bg-primary/10 hover:text-primary group/btn"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/pet/${animal.id}`);
          }}
        >
          Ver detalles
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
};

export default AnimalCard;
