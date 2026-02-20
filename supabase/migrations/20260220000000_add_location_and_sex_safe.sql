-- Add columns if they don't exist
DO $$ 
BEGIN 
    -- Check and add 'sex' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animals' AND column_name = 'sex') THEN
        ALTER TABLE animals ADD COLUMN sex text CHECK (sex IN ('macho', 'hembra', 'desconocido')) DEFAULT 'desconocido';
    END IF;

    -- Check and add 'province' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animals' AND column_name = 'province') THEN
        ALTER TABLE animals ADD COLUMN province text;
    END IF;

    -- Check and add 'country' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animals' AND column_name = 'country') THEN
        ALTER TABLE animals ADD COLUMN country text DEFAULT 'Argentina';
    END IF;
END $$;
