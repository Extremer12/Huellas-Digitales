-- Create adoption stories table
CREATE TABLE public.adoption_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE NOT NULL,
  adopter_user_id UUID NOT NULL,
  story_text TEXT NOT NULL,
  story_image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on adoption_stories
ALTER TABLE public.adoption_stories ENABLE ROW LEVEL SECURITY;

-- RLS policies for adoption_stories
CREATE POLICY "Anyone can view adoption stories"
ON public.adoption_stories
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create adoption stories"
ON public.adoption_stories
FOR INSERT
WITH CHECK (auth.uid() = adopter_user_id);

CREATE POLICY "Users can update their own adoption stories"
ON public.adoption_stories
FOR UPDATE
USING (auth.uid() = adopter_user_id);

CREATE POLICY "Users can delete their own adoption stories"
ON public.adoption_stories
FOR DELETE
USING (auth.uid() = adopter_user_id);

-- Trigger for adoption_stories updated_at
CREATE TRIGGER update_adoption_stories_updated_at
BEFORE UPDATE ON public.adoption_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();