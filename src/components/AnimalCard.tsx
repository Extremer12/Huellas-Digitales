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
    <div
      className="group relative cursor-pointer rounded-[2rem] overflow-hidden bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2"
      onClick={handleCardClick}
    >
      {/* Image Container with Gradient Overlay */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={animal.image}
          alt={animal.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-lg">
            {animal.type === "perro" ? "🐶 Perro" : animal.type === "gato" ? "🐱 Gato" : "🐾 Otro"}
          </span>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-gray-200">{animal.location}</span>
          </div>

          <h3 className="text-3xl font-black tracking-tight mb-2 text-white group-hover:text-primary transition-colors duration-300">
            {animal.name}
          </h3>

          <p className="text-sm text-gray-300 line-clamp-2 mb-4 opacity-90 font-light leading-relaxed">
            {animal.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex gap-2">
              <span className="text-xs font-medium bg-white/10 px-2 py-1 rounded-md">{animal.age}</span>
              <span className="text-xs font-medium bg-white/10 px-2 py-1 rounded-md">{animal.size}</span>
            </div>

            <button className="bg-white text-black p-2.5 rounded-full hover:bg-primary hover:text-white transition-colors duration-300 ml-2 shadow-lg">
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;
