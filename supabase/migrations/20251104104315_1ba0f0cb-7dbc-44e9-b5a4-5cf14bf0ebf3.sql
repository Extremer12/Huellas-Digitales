-- Create reports table for adoption stories
CREATE TABLE IF NOT EXISTS public.story_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.adoption_stories(id) ON DELETE CASCADE,
  reporter_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.story_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can create story reports" 
ON public.story_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can view their own story reports" 
ON public.story_reports 
FOR SELECT 
USING (auth.uid() = reporter_user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_story_reports_updated_at
BEFORE UPDATE ON public.story_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();