import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, MapPin, Heart, AlertTriangle, BookOpen, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { z } from "zod";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Schemas (simplified for Wizard)
const formSchema = z.object({
    name: z.string().min(2, "El nombre es requerido"),
    description: z.string().min(10, "La descripción es muy corta"),
});

interface SmartPublicationWizardProps {
    onSuccess: () => void;
}

type PublicationType = "adopcion" | "perdido" | "historia" | null;

export default function SmartPublicationWizard({ onSuccess }: SmartPublicationWizardProps) {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [type, setType] = useState<PublicationType>(null);
    const [loading, setLoading] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        animalType: "perro",
        age: "",
        size: "",
        location: "", // Default empty to encourage accuracy
        description: "",
        healthInfo: "",
        personality: "",
        isShelter: false,
        lat: -34.6037 as number,
        lng: -58.3816 as number,
        contactInfo: "",
        source: "rescatado" as "callejero" | "propio" | "rescatado",
        salesAgreement: false,
        nameUnknown: false,
        ageApproximate: false,
    });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setFormData(prev => ({
                    ...prev,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    // Ideally we would reverse geocode here to set 'location'
                    // For now we leave location empty to force user to type it correct
                    location: ""
                }));
            });
        }
    }, []);

    // Map Picker Component
    function LocationMarker() {
        const map = useMapEvents({
            click(e) {
                setFormData(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
                map.flyTo(e.latlng, map.getZoom());
            },
        });

        return formData.lat ? (
            <Marker position={[formData.lat, formData.lng]} />
        ) : null;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (imageFiles.length + files.length > 5) return;

        // Simple validation and preview logic
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImageFiles([...imageFiles, ...files]);
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        setImageFiles(imageFiles.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!type) return;
        if (imageFiles.length === 0) {
            toast({ title: "Falta imagen", description: "Sube al menos una foto.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No autenticado");

            // 1. Upload Images
            const uploadedUrls: string[] = [];
            for (const [index, file] of imageFiles.entries()) {
                const fileExt = file.name.split(".").pop();
                const fileName = `${user.id}/${Date.now()}_${index}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from("animal-photos").upload(fileName, file);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from("animal-photos").getPublicUrl(fileName);
                uploadedUrls.push(publicUrl);
            }

            // 2. Prepare Data based on Type
            const dbStatus = type === "adopcion" ? "disponible" : (type === "perdido" ? "perdido" : "historia");

            const nameToSave = formData.nameUnknown ? "Nombre Desconocido" : formData.name;
            const ageToSave = formData.ageApproximate ? `${formData.age} (Aprox.)` : formData.age;
            const sourceLabel = formData.source === "callejero" ? "Callejero/Rescatado" :
                (formData.source === "propio" ? "Mascota propia" : "Rescatado");

            const descriptionToSave = type === "adopcion" ? `[PROCEDENCIA: ${sourceLabel}]\n\n${formData.description}` : formData.description;

            const { data: animalData, error: insertError } = await supabase
                .from("animals")
                .insert({
                    user_id: user.id,
                    name: nameToSave,
                    type: formData.animalType as "perro" | "gato" | "otro",
                    age: ageToSave,
                    size: formData.size,
                    location: formData.location, // Could be derived from coords if needed
                    description: descriptionToSave,
                    health_info: formData.healthInfo,
                    personality: formData.personality,
                    image_url: uploadedUrls[0],
                    status: dbStatus,
                    lat: type === "perdido" ? formData.lat : null,
                    lng: type === "perdido" ? formData.lng : null,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // 3. Insert specific images
            const imageRecords = uploadedUrls.map((url, index) => ({
                animal_id: animalData.id,
                image_url: url,
                display_order: index,
            }));
            await supabase.from("animal_images").insert(imageRecords);

            toast({ title: "¡Publicado!", description: "Tu publicación está activa." });
            onSuccess();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER STEPS ---

    // STEP 1: SELECT TYPE
    if (step === 1) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl font-bold text-center">¿Qué deseas publicar?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                        onClick={() => { setType("adopcion"); setStep(2); }}
                        className="cursor-pointer hover:scale-105 transition-all p-6 rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary bg-card text-center space-y-4"
                    >
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                            <Heart className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-lg">Dar en Adopción</h3>
                        <p className="text-sm text-muted-foreground">Busco un hogar responsable para un animalito.</p>
                    </div>

                    <div
                        onClick={() => { setType("perdido"); setStep(2); }}
                        className="cursor-pointer hover:scale-105 transition-all p-6 rounded-2xl border-2 border-dashed border-destructive/20 hover:border-destructive bg-card text-center space-y-4"
                    >
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-lg">Reportar Perdido</h3>
                        <p className="text-sm text-muted-foreground">Perdí mi mascota o encontré una perdida.</p>
                    </div>

                    <div
                        onClick={() => { setType("historia"); setStep(2); }}
                        className="cursor-pointer hover:scale-105 transition-all p-6 rounded-2xl border-2 border-dashed border-blue-500/20 hover:border-blue-500 bg-card text-center space-y-4"
                    >
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-500">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-lg">Contar Historia</h3>
                        <p className="text-sm text-muted-foreground">Comparte un final feliz o una recuperación.</p>
                    </div>
                </div>
            </div>
        );
    }

    // STEP 2: CONTEXTUAL INFO
    if (step === 2) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" size="icon" onClick={() => setStep(1)}><ArrowLeft /></Button>
                    <h2 className="text-xl font-bold ml-2">
                        {type === "adopcion" && "Detalles de Adopción"}
                        {type === "perdido" && "Ubicación del Encuentro"}
                        {type === "historia" && "Detalles de la Historia"}
                    </h2>
                </div>

                {/* ADOPTION LOGIC */}
                {type === "adopcion" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => setFormData({ ...formData, isShelter: false })}
                                className={`cursor-pointer p-4 rounded-xl border-2 text-center ${!formData.isShelter ? "border-primary bg-primary/5" : "border-border"}`}
                            >
                                Soy Particular
                            </div>
                            <div
                                onClick={() => setFormData({ ...formData, isShelter: true })}
                                className={`cursor-pointer p-4 rounded-xl border-2 text-center ${formData.isShelter ? "border-primary bg-primary/5" : "border-border"}`}
                            >
                                Soy Refugio
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Ubicación General</Label>
                            <Input
                                placeholder="Ciudad, Barrio..."
                                value={formData.location}
                                maxLength={60}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* LOST LOGIC (MAP) */}
                {type === "perdido" && (
                    <div className="space-y-4">
                        <div className="rounded-xl overflow-hidden h-[300px] border relative group">
                            <MapContainer center={[formData.lat, formData.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationMarker />
                            </MapContainer>

                            {/* Overlay Instructions - Disappears on hover/click interaction concept if needed, or stays as a helper */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 pointer-events-none">
                                <MapPin className="w-3 h-3 text-red-500 animate-bounce" />
                                Toca en el mapa el lugar exacto
                            </div>
                        </div>
                        <div>
                            <Label>Referencia (Calle, Plaza, etc)</Label>
                            <Input
                                placeholder="Ej. Cerca de la estación..."
                                value={formData.location}
                                maxLength={60}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* STORY LOGIC */}
                {type === "historia" && (
                    <div className="text-center py-8 space-y-4">
                        <p className="text-muted-foreground">Las historias inspiran a otros a adoptar. Enfócate en el cambio de vida del animalito.</p>
                        <Input
                            placeholder="Título de la historia (Ej. El rescate de Toby)"
                            value={formData.name}
                            maxLength={60}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                )}

                <Button className="w-full mt-6" onClick={() => setStep(3)}>
                    Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        );
    }

    // STEP 3: COMMON DETAILS (Images, Desc)
    if (step === 3) {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
                <div className="flex items-center mb-4">
                    <Button variant="ghost" size="icon" onClick={() => setStep(2)}><ArrowLeft /></Button>
                    <h2 className="text-xl font-bold ml-2">Datos del Animal</h2>
                </div>

                {/* IMAGES */}
                <div className="space-y-2">
                    <Label>Fotos (La primera será la portada)</Label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {imagePreviews.map((src, i) => (
                            <div key={i} className="relative w-20 h-20 flex-shrink-0">
                                <img src={src} className="w-full h-full object-cover rounded-md" />
                                <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                            </div>
                        ))}
                        {imageFiles.length < 5 && (
                            <label className="w-20 h-20 border-2 border-dashed flex items-center justify-center rounded-md cursor-pointer hover:bg-muted/50">
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <input type="file" hidden accept="image/*" multiple onChange={handleImageChange} />
                            </label>
                        )}
                    </div>
                </div>

                {/* BASICS */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <Label>Nombre</Label>
                            <label className="text-[10px] text-muted-foreground flex items-center gap-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.nameUnknown}
                                    onChange={(e) => setFormData({ ...formData, nameUnknown: e.target.checked, name: e.target.checked ? "Desconocido" : "" })}
                                /> Sin nombre
                            </label>
                        </div>
                        <Input
                            value={formData.name}
                            maxLength={40}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={formData.nameUnknown}
                            placeholder={formData.nameUnknown ? "Desconocido" : "Ej. Toby"}
                        />
                    </div>
                    <div>
                        <Label>Tipo</Label>
                        <Select value={formData.animalType} onValueChange={(v) => setFormData({ ...formData, animalType: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="perro">Perro</SelectItem>
                                <SelectItem value="gato">Gato</SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <Label>Edad</Label>
                            <label className="text-[10px] text-muted-foreground flex items-center gap-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.ageApproximate}
                                    onChange={(e) => setFormData({ ...formData, ageApproximate: e.target.checked })}
                                /> Aprox.
                            </label>
                        </div>
                        <Input value={formData.age} maxLength={20} onChange={(e) => setFormData({ ...formData, age: e.target.value })} placeholder="Ej. 2 años" />
                    </div>
                    <div>
                        <Label>Tamaño</Label>
                        <Select value={formData.size} onValueChange={(v) => setFormData({ ...formData, size: v })}>
                            <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pequeño">Pequeño</SelectItem>
                                <SelectItem value="mediano">Mediano</SelectItem>
                                <SelectItem value="grande">Grande</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {type === "adopcion" && (
                    <div className="space-y-4 pt-2">
                        <div>
                            <Label>Procedencia</Label>
                            <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v as any })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="callejero">Callejero/Rescatado</SelectItem>
                                    <SelectItem value="rescatado">Rescatado (Refugio)</SelectItem>
                                    <SelectItem value="propio">Mascota propia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-start space-x-2 p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                            <input
                                type="checkbox"
                                id="wizardSalesAgreement"
                                checked={formData.salesAgreement}
                                onChange={(e) => setFormData({ ...formData, salesAgreement: e.target.checked })}
                                className="mt-1"
                            />
                            <div className="grid gap-1.5 leading-none">
                                <label htmlFor="wizardSalesAgreement" className="text-xs font-bold text-destructive uppercase tracking-tight">
                                    Prohibida la Venta
                                </label>
                                <p className="text-[10px] text-muted-foreground">
                                    Entiendo que vender animales es ilegal y está prohibido en Huellas Digitales.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <Label>Resumen de Salud (Visible en Perfil)</Label>
                    <Textarea
                        value={formData.healthInfo}
                        maxLength={500}
                        onChange={(e) => setFormData({ ...formData, healthInfo: e.target.value })}
                        rows={2}
                        placeholder="Vacunas, castración, etc."
                        className="text-sm"
                    />
                </div>

                <div>
                    <Label>Descripción ({formData.description.length}/600)</Label>
                    <Textarea
                        value={formData.description}
                        maxLength={600}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        placeholder="Cuenta su historia, personalidad, etc."
                    />
                </div>

                <Button className="w-full mt-4 btn-hero" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Publicando..." : "Publicar Ahora"}
                </Button>
            </div>
        );
    }

    return null;
}
