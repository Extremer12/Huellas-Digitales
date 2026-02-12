
import { DivIcon } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";

interface CustomMarkerProps {
    position: [number, number];
    image?: string | null;
    type: string; // 'perdido' | 'adopcion' | 'veterinaria' | 'refugio'
    title: string;
    id: string;
    onClick?: () => void;
}

const CustomMarker = ({ position, image, type, title, id, onClick }: CustomMarkerProps) => {
    const navigate = useNavigate();

    const getBorderColor = () => {
        switch (type) {
            case 'perdido': return 'border-red-500';
            case 'adopcion': return 'border-green-500';
            case 'veterinaria': return 'border-blue-500';
            case 'refugio': return 'border-purple-500';
            default: return 'border-primary';
        }
    };

    const getIcon = () => {
        // Generate a secure image URL or placeholder
        const imgUrl = image && image.length > 5 ? image : '/placeholder.svg';

        // Create HTML logic for the custom marker
        const iconHtml = renderToStaticMarkup(
            <div className={`relative w-12 h-12 rounded-full border-4 ${getBorderColor()} bg-white shadow-lg overflow-hidden transition-transform hover:scale-110`}>
                <img
                    src={imgUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    style={{ width: '100%', height: '100%' }} // Inline styles for string rendering
                />
            </div>
        );

        return new DivIcon({
            html: iconHtml,
            className: 'custom-leaflet-icon', // Need to add css to remove default box
            iconSize: [48, 48],
            iconAnchor: [24, 48],
            popupAnchor: [0, -48]
        });
    };

    return (
        <Marker
            position={position}
            icon={getIcon()}
            eventHandlers={{
                click: () => onClick && onClick()
            }}
        >
            <Popup>
                <div className="text-center p-2 min-w-[150px]">
                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden mb-2 border-2 border-muted">
                        <img src={image || '/placeholder.svg'} alt={title} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{title}</h3>
                    <Badge variant="outline" className="mb-3 capitalize">{type}</Badge>
                    <br />
                    {type !== 'veterinaria' && type !== 'refugio' && (
                        <button
                            onClick={() => navigate(`/mascota/${id}`)}
                            className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors mt-2"
                        >
                            Ver Detalles
                        </button>
                    )}
                </div>
            </Popup>
        </Marker>
    );
};

export default CustomMarker;
