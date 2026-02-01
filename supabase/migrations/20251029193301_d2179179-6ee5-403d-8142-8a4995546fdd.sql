-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create animal_type enum
CREATE TYPE public.animal_type AS ENUM ('perro', 'gato', 'otro');

-- Create animals table
CREATE TABLE public.animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  type animal_type NOT NULL,
  age TEXT NOT NULL,
  size TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  health_info TEXT,
  personality TEXT,
  image_url TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  contact_whatsapp TEXT,
  status TEXT NOT NULL DEFAULT 'disponible',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

-- Animals policies - everyone can view, only authenticated can create, only owner can update/delete
CREATE POLICY "Anyone can view animals"
  ON public.animals FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create animals"
  ON public.animals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own animals"
  ON public.animals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own animals"
  ON public.animals FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for animal photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('animal-photos', 'animal-photos', true);

-- Storage policies for animal photos
CREATE POLICY "Anyone can view animal photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'animal-photos');

CREATE POLICY "Authenticated users can upload animal photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'animal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own animal photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'animal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own animal photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'animal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_animals_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();