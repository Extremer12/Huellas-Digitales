-- Add region fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN country TEXT,
ADD COLUMN province TEXT;

-- Update animals table to support lost pets status
-- First check if we need to modify the status column
ALTER TABLE public.animals 
ALTER COLUMN status TYPE TEXT;

-- Add comment to clarify status options
COMMENT ON COLUMN public.animals.status IS 'Status can be: disponible (available for adoption), adoptado (adopted), or perdido (lost pet)';

-- Update RLS policies to filter by region
-- Drop existing policy and recreate with region filter
DROP POLICY IF EXISTS "Anyone can view animals" ON public.animals;

CREATE POLICY "Users can view animals in their region"
ON public.animals
FOR SELECT
USING (
  location IN (
    SELECT province 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
  OR auth.uid() IS NULL -- Allow viewing for non-authenticated users initially
);

-- Policy for viewing all animals if user hasn't set region yet
CREATE POLICY "View all animals without region restriction"
ON public.animals
FOR SELECT
USING (
  NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND country IS NOT NULL 
    AND province IS NOT NULL
  )
);