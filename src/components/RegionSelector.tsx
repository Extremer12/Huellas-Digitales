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
  onRegionSet: () => void;
}

interface Country {
  name: {
    common: string;
  };
  cca2: string;
}

export default function RegionSelector({ open, userId, onRegionSet }: RegionSelectorProps) {
  const [country, setCountry] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await fetch("https://restcountries.com/v3.1/lang/spanish");
      const data = await res.json();

      // Sort alphabetically
      const sorted = (data as Country[]).sort((a, b) =>
        a.name.common.localeCompare(b.name.common)
      );

      setCountries(sorted);
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error("Error cargando lista de países");
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
      const { error } = await supabase
        .from("profiles")
        .update({ country, province }) // province is just a text field in DB
        .eq("id", userId);

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
