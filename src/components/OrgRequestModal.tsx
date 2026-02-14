import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationRequest } from "@/types/supabase-custom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MapPin, PlusCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { DefaultIcon } from "@/utils/mapIcons";

interface OrgRequestModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export default function OrgRequestModal({ open: externalOpen, onOpenChange: externalOnOpenChange, trigger }: OrgRequestModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen;

    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        type: "veterinaria",
        address: "",
        contactInfo: "",
        lat: -31.5375, // Default San Juan
        lng: -68.5364
    });

    // Map Picker
    function LocationMarker() {
        const map = useMapEvents({
            click(e) {
                setFormData(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
            },
        });
        return <Marker position={[formData.lat, formData.lng]} icon={DefaultIcon} />;
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.contactInfo) {
            toast({ title: "Error", description: "Completa los campos obligatorios.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {

            // We use a specific table casting or just avoid 'any' if possible.
            // Since the table is missing from generated types, we might still need a cast for the table name access
            // BUT we can validte the data structure against our interface.
            const requestData: OrganizationRequest = {
                name: formData.name,
                type: formData.type as "veterinaria" | "refugio" | "ong",
                address: formData.address,
                contact_info: formData.contactInfo,
                location_lat: formData.lat,
                location_lng: formData.lng,
            };

            const { error } = await supabase
                .from("organization_requests" as any) // Still need this entry point cast if it's missing from main types
                .insert(requestData);

            if (error) throw error;

            toast({
                title: "Solicitud Enviada",
                description: "Revisaremos tu solicitud y te contactaremos pronto.",
            });
            setOpen(false);
            setStep(1);
            setFormData({
                name: "",
                type: "veterinaria",
                address: "",
                contactInfo: "",
                lat: -31.5375,
                lng: -68.5364
            });
        } catch (error: any) {
            console.error("Error submitting request:", error);
            toast({ title: "Error", description: "No se pudo enviar la solicitud.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary">
                    <PlusCircle className="w-4 h-4" /> Sumar mi Vet/Refugio
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Sumar Organización al Mapa</DialogTitle>
                    <DialogDescription>
                        Ayuda a la comunidad apareciendo en el mapa de recursos.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {step === 1 ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre de la Organización</Label>
                                    <Input
                                        placeholder="Ej. Veterinaria San Juan"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="veterinaria">Veterinaria</SelectItem>
                                            <SelectItem value="refugio">Refugio / ONG</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Dirección / Referencia</Label>
                                <Input
                                    placeholder="Calle 123, Barrio..."
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Contacto (Teléfono / Email)</Label>
                                <Input
                                    placeholder="Para validar tu identidad"
                                    value={formData.contactInfo}
                                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                                />
                            </div>

                            <Button className="w-full" onClick={() => setStep(2)}>
                                Siguiente: Ubicación <MapPin className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center justify-between gap-2">
                                <Label>Marca la ubicación exacta en el mapa</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-[10px] font-bold uppercase tracking-wider gap-1.5"
                                    onClick={() => {
                                        if (navigator.geolocation) {
                                            navigator.geolocation.getCurrentPosition((pos) => {
                                                setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
                                                toast({ title: "Ubicación detectada", description: "El pin se ha movido a tu posición actual." });
                                            });
                                        }
                                    }}
                                >
                                    <MapPin className="w-3 h-3 text-primary" /> Usar mi ubicación actual
                                </Button>
                            </div>
                            <div className="rounded-xl overflow-hidden h-[300px] border relative">
                                <MapContainer center={[formData.lat, formData.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <LocationMarker />
                                </MapContainer>
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs pointer-events-none z-[1000]">
                                    Toca para mover el pin
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" className="w-full" onClick={() => setStep(1)}>
                                    Volver
                                </Button>
                                <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                                    {loading ? "Enviando..." : "Enviar Solicitud"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
