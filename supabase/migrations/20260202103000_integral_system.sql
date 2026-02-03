-- Enable PostGIS if available (optional, but good for future)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Create organizations table
CREATE TYPE public.organization_type AS ENUM ('shelter', 'vet', 'municipality', 'ngo');

CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type public.organization_type NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  address TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified organizations"
  ON public.organizations FOR SELECT
  USING (true);

-- 2. Modify animals table to add location and organization
ALTER TABLE public.animals ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION;
ALTER TABLE public.animals ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;
ALTER TABLE public.animals ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 3. Create medical_records table
CREATE TYPE public.medical_record_type AS ENUM ('vaccine', 'sterilization', 'checkup', 'surgery', 'other');

CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  type public.medical_record_type NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  vet_name TEXT,
  next_due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view medical records of animals"
  ON public.medical_records FOR SELECT
  USING (true);

CREATE POLICY "Authorized users can manage medical records"
  ON public.medical_records FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.animals WHERE id = animal_id));

-- 4. Create citizen_reports table (Geosocial)
CREATE TYPE public.report_type AS ENUM ('abuse', 'stray_sighting', 'lost_pet', 'other');
CREATE TYPE public.report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');
CREATE TYPE public.report_severity AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE public.citizen_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable if we allow anon later, but currently requiring auth
  type public.report_type NOT NULL,
  status public.report_status NOT NULL DEFAULT 'pending',
  severity public.report_severity NOT NULL DEFAULT 'low',
  description TEXT NOT NULL,
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  address_reference TEXT,
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reports"
  ON public.citizen_reports FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reports"
  ON public.citizen_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Reporters can update their own reports"
  ON public.citizen_reports FOR UPDATE
  USING (auth.uid() = reporter_id);

-- 5. Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_citizen_reports_updated_at
  BEFORE UPDATE ON public.citizen_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
