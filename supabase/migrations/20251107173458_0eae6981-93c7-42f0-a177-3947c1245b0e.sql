-- Create table for multiple animal images
CREATE TABLE IF NOT EXISTS public.animal_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.animal_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view animal images"
  ON public.animal_images
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create images for their animals"
  ON public.animal_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.animals
      WHERE animals.id = animal_images.animal_id
      AND animals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their animal images"
  ON public.animal_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.animals
      WHERE animals.id = animal_images.animal_id
      AND animals.user_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX idx_animal_images_animal_id ON public.animal_images(animal_id);
CREATE INDEX idx_animal_images_order ON public.animal_images(animal_id, display_order);