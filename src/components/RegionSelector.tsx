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

  // Fallback data in case the API fails
  const FALLBACK_COUNTRIES: Country[] = [
    { name: { common: "Argentina" }, cca2: "AR" },
    { name: { common: "Bolivia" }, cca2: "BO" },
    { name: { common: "Chile" }, cca2: "CL" },
    { name: { common: "Colombia" }, cca2: "CO" },
    { name: { common: "Costa Rica" }, cca2: "CR" },
    { name: { common: "Cuba" }, cca2: "CU" },
    { name: { common: "Ecuador" }, cca2: "EC" },
    { name: { common: "El Salvador" }, cca2: "SV" },
    { name: { common: "España" }, cca2: "ES" },
    { name: { common: "Estados Unidos" }, cca2: "US" },
    { name: { common: "Guatemala" }, cca2: "GT" },
    { name: { common: "Honduras" }, cca2: "HN" },
    { name: { common: "México" }, cca2: "MX" },
    { name: { common: "Nicaragua" }, cca2: "NI" },
    { name: { common: "Panamá" }, cca2: "PA" },
    { name: { common: "Paraguay" }, cca2: "PY" },
    { name: { common: "Perú" }, cca2: "PE" },
    { name: { common: "Puerto Rico" }, cca2: "PR" },
    { name: { common: "República Dominicana" }, cca2: "DO" },
    { name: { common: "Uruguay" }, cca2: "UY" },
    { name: { common: "Venezuela" }, cca2: "VE" },
  ];

  const fetchCountries = async () => {
    try {
      // Set a timeout to avoid long hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const res = await fetch("https://restcountries.com/v3.1/lang/spanish", {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("API response not ok");

      const data = await res.json();

      // Sort alphabetically
      const sorted = (data as Country[]).sort((a, b) =>
        a.name.common.localeCompare(b.name.common)
      );

      setCountries(sorted);
    } catch (error) {
      console.error("Error fetching countries, using fallback:", error);
      // Fallback silently or with a small hint if preferred, but crucial to unblock user
      setCountries(FALLBACK_COUNTRIES);
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
