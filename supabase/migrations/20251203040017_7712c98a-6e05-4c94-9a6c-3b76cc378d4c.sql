-- Fix RLS policies for animals table - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users can create animals" ON public.animals;
DROP POLICY IF EXISTS "Users can delete their own animals" ON public.animals;
DROP POLICY IF EXISTS "Users can update their own animals" ON public.animals;
DROP POLICY IF EXISTS "Users can view animals in their region" ON public.animals;
DROP POLICY IF EXISTS "View all animals without region restriction" ON public.animals;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Authenticated users can create animals" 
ON public.animals 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own animals" 
ON public.animals 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own animals" 
ON public.animals 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Permissive SELECT policies
CREATE POLICY "Users can view animals in their region" 
ON public.animals 
FOR SELECT 
USING (
  location IN (
    SELECT profiles.province
    FROM profiles
    WHERE profiles.id = auth.uid()
  ) OR auth.uid() IS NULL
);

CREATE POLICY "View all animals without region restriction" 
ON public.animals 
FOR SELECT 
USING (
  NOT EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.country IS NOT NULL 
    AND profiles.province IS NOT NULL
  )
);

-- Also fix animal_images policies
DROP POLICY IF EXISTS "Anyone can view animal images" ON public.animal_images;
DROP POLICY IF EXISTS "Users can create images for their animals" ON public.animal_images;
DROP POLICY IF EXISTS "Users can delete their animal images" ON public.animal_images;

CREATE POLICY "Anyone can view animal images" 
ON public.animal_images 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create images for their animals" 
ON public.animal_images 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM animals
    WHERE animals.id = animal_images.animal_id 
    AND animals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their animal images" 
ON public.animal_images 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM animals
    WHERE animals.id = animal_images.animal_id 
    AND animals.user_id = auth.uid()
  )
);