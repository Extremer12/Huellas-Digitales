import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MapPin, Filter, Home, AlertTriangle, Search, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Standardize icons
const petIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2808/2808401.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const orgIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/619/619175.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const reportIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/595/595067.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

interface MapItem {
    id: string;
    type: "pet" | "org" | "report";
    lat: number;
    lng: number;
    title: string;
    subtitle?: string;
    image_url?: string;
    status?: string;
    category?: string;
}

const InteractiveMap = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [items, setItems] = useState<MapItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MapItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [center, setCenter] = useState<[number, number]>([-31.5375, -68.5364]); // San Juan, Argentina
    const [filters, setFilters] = useState({
        pets: true,
        orgs: true,
        reports: true,
    });

    useEffect(() => {
        // Try precise geolocation first
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCenter([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.log("Geolocation blocked or failed, using default center", error);
                }
            );
        }

        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [items, filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [petsRes, orgsRes, reportsRes] = await Promise.all([
                supabase
                    .from("animals")
                    .select("id, name, lat, lng, image_url, status, type")
                    .not("lat", "is", null)
                    .order("created_at", { ascending: false })
                    .range(0, 999),
                supabase
                    .from("organizations")
                    .select("id, name, location_lat, location_lng, logo_url, type")
                    .not("location_lat", "is", null)
                    .order("created_at", { ascending: false })
                    .range(0, 999),
                supabase
                    .from("citizen_reports")
                    .select("id, type, location_lat, location_lng, description, status")
                    .not("location_lat", "is", null)
                    .order("created_at", { ascending: false })
                    .range(0, 999),
            ]);

            const petItems: MapItem[] = (petsRes.data || []).map((p) => ({
                id: p.id,
                type: "pet",
                lat: p.lat!,
                lng: p.lng!,
                title: p.name,
                subtitle: p.type,
                image_url: p.image_url,
                status: p.status,
            }));

            const orgItems: MapItem[] = (orgsRes.data || []).map((o) => ({
                id: o.id,
                type: "org",
                lat: o.location_lat!,
                lng: o.location_lng!,
                title: o.name,
                subtitle: o.type,
                image_url: o.logo_url,
            }));

            const reportItems: MapItem[] = (reportsRes.data || []).map((r) => ({
                id: r.id,
                type: "report",
                lat: r.location_lat!,
                lng: r.location_lng!,
                title: `Reporte: ${r.type}`,
                subtitle: r.description.substring(0, 50) + "...",
                category: r.type,
                status: r.status,
            }));

            setItems([...petItems, ...orgItems, ...reportItems]);

            toast({
                title: "Mapa optimizado",
                description: "Mostrando los 100 resultados más recientes por categoría.",
            });
        } catch (error) {
            console.error("Error fetching map items:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = items;
        if (!filters.pets) result = result.filter((i) => i.type !== "pet");
        if (!filters.orgs) result = result.filter((i) => i.type !== "org");
        if (!filters.reports) result = result.filter((i) => i.type !== "report");
        setFilteredItems(result);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "pet":
                return petIcon;
            case "org":
                return orgIcon;
            case "report":
                return reportIcon;
            default:
                return petIcon;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-20 lg:pt-24 pb-0 lg:pb-10 h-[calc(100vh)] lg:h-auto flex flex-col">
                <div className="container mx-auto px-0 lg:px-4 h-full flex flex-col lg:block">
                    {/* Mobile Filters Trigger */}
                    <div className="lg:hidden px-4 py-2 border-b flex justify-between items-center bg-background z-10 shrink-0">
                        <h1 className="font-bold text-lg">Mapa de Huellas</h1>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="w-4 h-4" />
                                    Filtros
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px]">
                                <SheetHeader>
                                    <SheetTitle>Filtros del Mapa</SheetTitle>
                                </SheetHeader>
                                <div className="py-6 space-y-6">
                                    {/* Reuse Filter Logic */}
                                    {/* ... (Checkbox Groups) ... */}
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="pets-m" checked={filters.pets} onCheckedChange={(c) => setFilters({ ...filters, pets: !!c })} />
                                            <Label htmlFor="pets-m" className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div> Mascotas
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="orgs-m" checked={filters.orgs} onCheckedChange={(c) => setFilters({ ...filters, orgs: !!c })} />
                                            <Label htmlFor="orgs-m" className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div> Organizaciones
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="reports-m" checked={filters.reports} onCheckedChange={(c) => setFilters({ ...filters, reports: !!c })} />
                                            <Label htmlFor="reports-m" className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div> Reportes
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 lg:mb-8 h-full lg:h-auto">
                        {/* Desktop Sidebar */}
                        <div className="hidden lg:block lg:w-1/4 space-y-6">
                            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Filter className="w-5 h-5 text-primary" />
                                        Filtros
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="pets"
                                            checked={filters.pets}
                                            onCheckedChange={(checked) =>
                                                setFilters({ ...filters, pets: !!checked })
                                            }
                                        />
                                        <Label
                                            htmlFor="pets"
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            Mascotas (Adopción/Perdidos)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="orgs"
                                            checked={filters.orgs}
                                            onCheckedChange={(checked) =>
                                                setFilters({ ...filters, orgs: !!checked })
                                            }
                                        />
                                        <Label
                                            htmlFor="orgs"
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            Organizaciones y Refugios
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="reports"
                                            checked={filters.reports}
                                            onCheckedChange={(checked) =>
                                                setFilters({ ...filters, reports: !!checked })
                                            }
                                        />
                                        <Label
                                            htmlFor="reports"
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            Reportes Ciudadanos
                                        </Label>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            variant="outline"
                                            className="w-full text-xs"
                                            onClick={() => setFilters({ pets: true, orgs: true, reports: true })}
                                        >
                                            Restablecer filtros
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="pt-6">
                                    <div className="flex gap-3 items-start">
                                        <div className="bg-primary/20 p-2 rounded-full mt-1">
                                            <Search className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">Mapa Geo-Social</h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Visualiza en tiempo real la situación del bienestar animal en San Juan.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:w-3/4 flex-1 h-full relative">
                            {/* Map Wrapper with Mobile Height Fix */}
                            <div className="h-full lg:h-[600px] w-full rounded-none lg:rounded-2xl overflow-hidden shadow-2xl border-0 lg:border border-primary/10 relative z-0">
                                {loading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-muted-foreground font-medium">Cargando mapa...</p>
                                        </div>
                                    </div>
                                ) : null}

                                <MapContainer
                                    center={center}
                                    zoom={12}
                                    style={{ height: "100%", width: "100%" }}
                                    className="interactive-map-container"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        className="map-tiles"
                                    />
                                    {filteredItems.map((item) => (
                                        <Marker
                                            key={`${item.type}-${item.id}`}
                                            position={[item.lat, item.lng]}
                                            icon={getIcon(item.type)}
                                        >
                                            <Popup className="custom-popup">
                                                <div className="p-1 max-w-[200px]">
                                                    {item.image_url && (
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.title}
                                                            className="w-full h-24 object-cover rounded-md mb-2"
                                                        />
                                                    )}
                                                    <h4 className="font-bold text-base mb-1 text-foreground">
                                                        {item.title}
                                                    </h4>
                                                    {item.subtitle && (
                                                        <p className="text-xs text-muted-foreground mb-3 leading-tight">
                                                            {item.subtitle}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-between gap-2">
                                                        <Badge variant="outline" className="text-[10px] h-5">
                                                            {item.type === 'pet' ? 'Mascota' : item.type === 'org' ? 'Org' : 'Reporte'}
                                                        </Badge>
                                                        <Button
                                                            size="sm"
                                                            className="h-7 text-[10px] px-2"
                                                            onClick={() => {
                                                                if (item.type === 'pet') navigate(`/pet/${item.id}`);
                                                                // Add logic for reports/orgs details if needed
                                                            }}
                                                        >
                                                            Ver más
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {/* Footer removed for full-screen map experience */}

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
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 12px;
          line-height: 1.4;
        }
        .custom-popup .leaflet-popup-tip {
          background: #1e1e1e;
        }
        .leaflet-control-attribution {
          background: rgba(0,0,0,0.5) !important;
          color: #ccc !important;
        }
      `}</style>
        </div>
    );
};

export default InteractiveMap;
