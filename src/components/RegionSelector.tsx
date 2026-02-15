import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface RegionSelectorProps {
  open: boolean;
  userId: string;
  userEmail?: string; // Added email prop
  onRegionSet: () => void;
}

interface Country {
  name: {
    common: string;
  };
  cca2: string;
}

export default function RegionSelector({ open, userId, userEmail, onRegionSet }: RegionSelectorProps) {
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2");
      const data = await response.json();
      const sortedCountries = data.sort((a: Country, b: Country) =>
        a.name.common.localeCompare(b.name.common)
      );
      setCountries(sortedCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error("Error al cargar la lista de países");
    } finally {
      setLoadingCountries(false);
    }
  };

  const handleSubmit = async () => {
    if (!country || !province) {
      toast.error("Por favor completa país y provincia/estado");
      return;
    }

    setLoading(true);
    try {
      // Use UPSERT instead of UPDATE
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          country,
          province,
          email: userEmail || "", // Required for new rows
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      toast.success("Región configurada correctamente");
      onRegionSet();
    } catch (error) {
      console.error("Error setting region:", error);
      toast.error("Error al configurar la región");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Selecciona tu región</DialogTitle>
          <DialogDescription>
            Para ofrecerte mascotas cercanas a tu ubicación, necesitamos saber dónde estás.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">País</label>
            <Select value={country} onValueChange={setCountry} disabled={loadingCountries}>
              <SelectTrigger>
                <SelectValue placeholder={loadingCountries ? "Cargando..." : "Selecciona tu país"} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.cca2} value={c.name.common}>
                    {c.name.common}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Provincia / Estado / Región</label>
            <Input
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="Escribe tu provincia o estado"
              disabled={!country}
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading || !country || !province} className="w-full">
            {loading ? "Guardando..." : "Continuar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
