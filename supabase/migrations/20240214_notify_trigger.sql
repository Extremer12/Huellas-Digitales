
-- Asegurar que la columna province existe
ALTER TABLE public.animals ADD COLUMN IF NOT EXISTS province text;

-- Habilitar extensión pg_net para llamadas HTTP
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

-- Función para llamar a Edge Function
CREATE OR REPLACE FUNCTION public.handle_new_lost_animal()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'perdido' AND NEW.province IS NOT NULL THEN
    PERFORM
      net.http_post(
        url:='https://oesnfhhyzjgoilapyiti.supabase.co/functions/v1/notify-users',
        headers:=jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body:=jsonb_build_object(
          'type', TG_OP,
          'record', row_to_json(NEW)
        )
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_lost_animal_created ON public.animals;
CREATE TRIGGER on_lost_animal_created
  AFTER INSERT ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_lost_animal();
