-- Add sex, province, and country columns to animals table
ALTER TABLE animals 
ADD COLUMN sex text CHECK (sex IN ('macho', 'hembra', 'desconocido')) DEFAULT 'desconocido',
ADD COLUMN province text,
ADD COLUMN country text DEFAULT 'Argentina';

-- Update RLS policies if necessary (usually not needed for just adding columns if generic policies exist)
