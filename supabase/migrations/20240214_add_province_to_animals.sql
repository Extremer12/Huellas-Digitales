-- Add province column to animals table
ALTER TABLE public.animals ADD COLUMN IF NOT EXISTS province text;

-- Create an index for faster filtering by province
CREATE INDEX IF NOT EXISTS idx_animals_province ON public.animals(province);

-- Optional: Update existing records to have a default province if needed, or leave null
-- UPDATE public.animals SET province = 'San Juan' WHERE province IS NULL;
