import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { MapPin, Eye } from 'lucide-react';
import { Button } from './ui/button';

// Custom Dog Icon
const dogIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2808/2808401.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

interface LostPet {
    id: string;
    name: string;
    lat: number;
    lng: number;
    image_url: string;
    location: string;
}

const LostPetsMap = () => {
    const [pets, setPets] = useState<LostPet[]>([]);
    const [center, setCenter] = useState<[number, number]>([-34.6037, -58.3816]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLostPets();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setCenter([position.coords.latitude, position.coords.longitude]);
            });
        }
    }, []);

    const fetchLostPets = async () => {
        try {
            const { data, error } = await supabase
                .from('animals')
                .select('id, name, lat, lng, image_url, location')
                .eq('status', 'perdido')
                .not('lat', 'is', null)
                .not('lng', 'is', null);

            if (error) throw error;
            setPets(data || []);
        } catch (error) {
            console.error('Error fetching lost pets for map:', error);
        }
    };

    return (
        <div className="container-custom py-10 animate-fade-in relative z-10">
            <div className="mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <MapPin className="text-primary" />
                    Vista de Mapa (Leaflet)
                </h3>
                <p className="text-muted-foreground">Localizá mascotas perdidas cerca de tu zona (Versión libre sin tarjetas).</p>
            </div>

            <div className="h-[500px] w-full rounded-[24px] overflow-hidden shadow-2xl border border-white/5 bg-muted/20">
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        className="map-tiles"
                    />
                    {pets.map((pet) => (
                        <Marker
                            key={pet.id}
                            position={[pet.lat, pet.lng]}
                            icon={dogIcon}
                        >
                            <Popup className="custom-popup">
                                <div className="p-1 max-w-[180px]">
                                    <img
                                        src={pet.image_url}
                                        alt={pet.name}
                                        className="w-full h-24 object-cover rounded-md mb-2"
                                    />
                                    <h4 className="font-bold text-base mb-0.5 text-foreground">{pet.name}</h4>
                                    <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
                                        <MapPin className="w-2.5 h-2.5" />
                                        {pet.location}
                                    </p>
                                    <Button
                                        className="w-full btn-hero h-7 text-[10px]"
                                        onClick={() => navigate(`/pet/${pet.id}`)}
                                    >
                                        <Eye className="w-2.5 h-2.5 mr-1" />
                                        Ver Detalles
                                    </Button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            <style>{`
        .leaflet-container {
          background: #1a1a1a;
          z-index: 1;
        }
        .map-tiles {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: #1e1e1e;
          color: white;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .custom-popup .leaflet-popup-tip {
          background: #1e1e1e;
        }
        .leaflet-control-attribution {
          background: rgba(0,0,0,0.5) !important;
          color: #ccc !important;
        }
        .leaflet-control-attribution a {
          color: #primary !important;
        }
      `}</style>
        </div>
    );
};

export default LostPetsMap;
