import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { z } from "zod";

// Anti-spam and inappropriate content filter
const inappropriateWords = ["spam", "scam", "fraude", "estafa", "xxx", "sexo"];

const containsInappropriateContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return inappropriateWords.some(word => lowerText.includes(word));
};

const formSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(50)
    .refine(val => !containsInappropriateContent(val), "El nombre contiene contenido no permitido"),
  type: z.enum(["perro", "gato", "otro"]),
  age: z.string().trim().min(1, "La edad es requerida").max(30),
  size: z.string().trim().min(1, "El tamaño es requerido").max(30),
  location: z.string().trim().min(3, "La ubicación debe tener al menos 3 caracteres").max(100)
    .refine(val => !containsInappropriateContent(val), "La ubicación contiene contenido no permitido"),
  description: z.string().trim().min(10, "La descripción debe tener al menos 10 caracteres").max(500)
    .refine(val => !containsInappropriateContent(val), "La descripción contiene contenido no permitido"),
  healthInfo: z.string().trim().max(500).optional()
    .refine(val => !val || !containsInappropriateContent(val), "La información de salud contiene contenido no permitido"),
  personality: z.string().trim().max(300).optional()
    .refine(val => !val || !containsInappropriateContent(val), "La personalidad contiene contenido no permitido"),
  source: z.enum(["callejero", "propio", "rescatado"]).optional(),
  salesAgreement: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar que está prohibida la venta de animales" }),
  }),
});

interface PublicationFormProps {
  onSuccess: () => void;
}

const PublicationForm = ({ onSuccess }: PublicationFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [nameUnknown, setNameUnknown] = useState(false);
  const [ageApproximate, setAgeApproximate] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    age: "",
    size: "",
    location: "",
    description: "",
    healthInfo: "",
    personality: "",
    status: "disponible",
    lat: null as number | null,
    lng: null as number | null,
    source: "rescatado" as "callejero" | "propio" | "rescatado",
    salesAgreement: false,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (imageFiles.length + files.length > 5) {
      toast({
        title: "Máximo de imágenes alcanzado",
        description: "Puedes subir máximo 5 imágenes por mascota",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Formato no permitido",
          description: "Solo se permiten imágenes JPG, PNG o WEBP",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "Cada imagen no debe superar los 5MB",
          variant: "destructive",
        });
        return;
      }

      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImageFiles([...imageFiles, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      formSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Error de validación",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    if (imageFiles.length === 0) {
      toast({
        title: "Imagen requerida",
        description: "Por favor selecciona al menos una imagen del animal",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para publicar",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Upload all images
      const uploadedUrls: string[] = [];
      for (const [index, file] of imageFiles.entries()) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}_${index}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("animal-photos")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("animal-photos")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      // Insert animal with first image      // 2. Prepare data for insertion
      const nameToSave = nameUnknown ? "Nombre Desconocido" : formData.name;
      const ageToSave = ageApproximate ? `${formData.age} (Aprox.)` : formData.age;

      // We'll append the source to the description for now to avoid schema changes
      const sourceLabel = formData.source === "callejero" ? "Callejero/Rescatado" :
        (formData.source === "propio" ? "Mascota propia" : "Rescatado");

      const descriptionToSave = `[PROCEDENCIA: ${sourceLabel}]\n\n${formData.description}`;

      const { data: animalData, error: animalError } = await supabase
        .from("animals")
        .insert({
          user_id: user.id,
          name: nameToSave,
          type: formData.type as "perro" | "gato" | "otro",
          age: ageToSave,
          size: formData.size,
          location: formData.location,
          description: descriptionToSave,
          health_info: formData.healthInfo || null,
          personality: formData.personality || null,
          image_url: uploadedUrls[0],
          status: formData.status,
          lat: formData.lat,
          lng: formData.lng,
        })
        .select('id')
        .single();

      if (animalError) throw animalError;

      // Insert all images into animal_images table
      const imageRecords = uploadedUrls.map((url, index) => ({
        animal_id: animalData.id,
        image_url: url,
        display_order: index,
      }));

      const { error: imagesError } = await supabase
        .from("animal_images")
        .insert(imageRecords);

      if (imagesError) throw imagesError;

      toast({
        title: "¡Publicación exitosa!",
        description: "El animal ha sido publicado correctamente",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error al publicar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="images">Fotos del animal * (Máximo 5)</Label>
          <div className="mt-2 space-y-3">
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-full h-32 rounded-lg overflow-hidden">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-7 w-7"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {imagePreviews.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mb-1" />
                <span className="text-sm text-muted-foreground">
                  {imagePreviews.length === 0 ? "Haz clic para subir imágenes" : "Agregar más imágenes"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  PNG, JPG (max. 5MB) - {imagePreviews.length}/5
                </span>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={loading}
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="status">Tipo de publicación *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
            disabled={loading}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disponible">En adopción</SelectItem>
              <SelectItem value="perdido">Mascota perdida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="name">Nombre *</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="nameUnknown"
                  checked={nameUnknown}
                  onChange={(e) => {
                    setNameUnknown(e.target.checked);
                    if (e.target.checked) setFormData({ ...formData, name: "Sin nombre / Desconocido" });
                    else setFormData({ ...formData, name: "" });
                  }}
                  className="rounded border-primary text-primary focus:ring-primary"
                />
                <label htmlFor="nameUnknown" className="text-xs text-muted-foreground cursor-pointer">Desconocido</label>
              </div>
            </div>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading || nameUnknown}
              maxLength={50}
              placeholder={nameUnknown ? "Desconocido" : "Ej. Toby, Luna..."}
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo de animal *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
              disabled={loading}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perro">Perro</SelectItem>
                <SelectItem value="gato">Gato</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="age">Edad aproximada *</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ageApproximate"
                  checked={ageApproximate}
                  onChange={(e) => setAgeApproximate(e.target.checked)}
                  className="rounded border-primary text-primary focus:ring-primary"
                />
                <label htmlFor="ageApproximate" className="text-xs text-muted-foreground cursor-pointer">Es un estimado</label>
              </div>
            </div>
            <Input
              id="age"
              placeholder="Ej: 2 años, 6 meses"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
              disabled={loading}
              maxLength={30}
            />
          </div>

          <div>
            <Label htmlFor="size">Tamaño *</Label>
            <Input
              id="size"
              placeholder="Pequeño, Mediano, Grande"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              required
              disabled={loading}
              maxLength={30}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="location">Ubicación *</Label>
          <div className="flex gap-2">
            <Input
              id="location"
              placeholder="Ciudad, Barrio"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              disabled={loading}
              maxLength={100}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Usar mi ubicación actual"
              onClick={() => {
                if ("geolocation" in navigator) {
                  toast({ title: "Obteniendo ubicación...", description: "Por favor permite el acceso a tu ubicación." });
                  navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));

                    // Reverse geocoding to get city name (optional but nice)
                    try {
                      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                      const data = await response.json();
                      const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "";
                      if (city) {
                        setFormData(prev => ({ ...prev, location: city, lat: latitude, lng: longitude }));
                      }
                      toast({ title: "Ubicación obtenida", description: "Se han guardado las coordenadas correctamente." });
                    } catch (e) {
                      toast({ title: "Ubicación guardada", description: "Coordenadas registradas. Puedes escribir el nombre de la ciudad manualmente." });
                    }
                  }, (error) => {
                    console.error("Error getting location:", error);
                    toast({ variant: "destructive", title: "Error", description: "No se pudo obtener la ubicación. Verifica los permisos." });
                  });
                } else {
                  toast({ variant: "destructive", title: "Error", description: "Geolocalización no soportada en este navegador." });
                }
              }}
            >
              <span className="text-xl">📍</span>
            </Button>
          </div>
          {formData.lat && <p className="text-xs text-green-600 mt-1 flex items-center gap-1">✓ Coordenadas registradas</p>}
        </div>

        <div>
          <Label htmlFor="description">Descripción *</Label>
          <Textarea
            id="description"
            placeholder="Describe al animal, su historia, comportamiento..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            disabled={loading}
            rows={4}
            maxLength={500}
          />
        </div>

        <div>
          <Label htmlFor="personality">Personalidad</Label>
          <Textarea
            id="personality"
            placeholder="Describe su personalidad y comportamiento"
            value={formData.personality}
            onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
            disabled={loading}
            rows={3}
            maxLength={300}
          />
        </div>

        <div>
          <Label htmlFor="healthInfo">Historia Clínica / Salud</Label>
          <Textarea
            id="healthInfo"
            placeholder="Vacunas, enfermedades, esterilización, etc..."
            value={formData.healthInfo}
            onChange={(e) => setFormData({ ...formData, healthInfo: e.target.value })}
            disabled={loading}
            rows={3}
            maxLength={500}
          />
        </div>

        <div>
          <Label htmlFor="source">Procedencia del animal *</Label>
          <Select
            value={formData.source}
            onValueChange={(value) => setFormData({ ...formData, source: value as any })}
            disabled={loading}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona la procedencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="callejero">Animal Callejero / Rescatado de la calle</SelectItem>
              <SelectItem value="rescatado">Rescatado por organización/refugio</SelectItem>
              <SelectItem value="propio">Mascota propia que no puedo cuidar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-xl">
            <input
              type="checkbox"
              id="salesAgreement"
              checked={formData.salesAgreement}
              onChange={(e) => setFormData({ ...formData, salesAgreement: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-primary text-primary focus:ring-primary"
              required
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="salesAgreement"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-destructive"
              >
                Advertencia de No Venta
              </label>
              <p className="text-sm text-muted-foreground">
                Declaro bajo juramento que este animal no está a la venta. En esta plataforma está estrictamente prohibida la comercialización de seres vivos.
              </p>
            </div>
          </div>
        </div>

      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Publicando..." : "Publicar Animal"}
      </Button>
    </form>
  );
};

export default PublicationForm;
