-- Create a security definer function to safely get a user's province
CREATE OR REPLACE FUNCTION public.get_user_province(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT province FROM public.profiles WHERE id = user_id
$$;

-- Drop existing problematic policies on animals
DROP POLICY IF EXISTS "Users can view animals in their region" ON public.animals;
DROP POLICY IF EXISTS "Users without region can view all animals" ON public.animals;
DROP POLICY IF EXISTS "Anonymous users can view all animals" ON public.animals;
DROP POLICY IF EXISTS "Users can view their own animals" ON public.animals;

-- Create a unified policy for viewing animals that handles all cases properly
CREATE POLICY "Anyone can view animals based on region" ON public.animals
FOR SELECT USING (
  -- Case 1: Anonymous users can see all
  auth.uid() IS NULL
  OR
  -- Case 2: User viewing their own animals (always allowed)
  auth.uid() = user_id
  OR
  -- Case 3: User doesn't have province set - can see all
  public.get_user_province(auth.uid()) IS NULL
  OR
  -- Case 4: User has province - can see animals from same province
  public.get_user_province(auth.uid()) = public.get_user_province(user_id)
);