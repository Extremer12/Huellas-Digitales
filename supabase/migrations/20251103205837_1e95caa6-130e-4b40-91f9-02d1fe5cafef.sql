-- Add animal_name column to adoption_stories table
ALTER TABLE public.adoption_stories 
ADD COLUMN animal_name TEXT;

-- Make animal_id nullable since stories are now independent
ALTER TABLE public.adoption_stories 
ALTER COLUMN animal_id DROP NOT NULL;