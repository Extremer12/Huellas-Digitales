-- Fix RLS policies for animals table to allow users to see their own animals
DROP POLICY IF EXISTS "Users can view animals in their region" ON public.animals;
DROP POLICY IF EXISTS "View all animals without region restriction" ON public.animals;

-- Users can ALWAYS view their own animals
CREATE POLICY "Users can view their own animals"
ON public.animals
FOR SELECT
USING (auth.uid() = user_id);

-- Users can view other animals in their region (if they have region set)
CREATE POLICY "Users can view animals in their region"
ON public.animals
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != user_id
  AND location IN (
    SELECT province FROM profiles WHERE id = auth.uid()
  )
);

-- Anonymous users can view all animals
CREATE POLICY "Anonymous users can view all animals"
ON public.animals
FOR SELECT
USING (auth.uid() IS NULL);

-- Users without region can view all animals
CREATE POLICY "Users without region can view all animals"
ON public.animals
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND province IS NOT NULL
  )
);

-- Add message length constraint to messages table
ALTER TABLE public.messages ADD CONSTRAINT message_content_length 
  CHECK (length(content) BETWEEN 1 AND 1000);

-- Remove contact columns from animals table (security fix - use chat instead)
ALTER TABLE public.animals DROP COLUMN IF EXISTS contact_phone;
ALTER TABLE public.animals DROP COLUMN IF EXISTS contact_email;
ALTER TABLE public.animals DROP COLUMN IF EXISTS contact_whatsapp;