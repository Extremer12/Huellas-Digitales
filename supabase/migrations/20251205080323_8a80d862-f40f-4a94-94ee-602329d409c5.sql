-- Drop the incorrect policy that compares location with province
DROP POLICY IF EXISTS "Users can view animals in their region" ON public.animals;

-- Create corrected policy that compares provinces of users
CREATE POLICY "Users can view animals in their region" 
ON public.animals 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL) 
  AND (auth.uid() <> user_id) 
  AND (
    EXISTS (
      SELECT 1 FROM profiles owner_profile
      WHERE owner_profile.id = animals.user_id
      AND owner_profile.province = (
        SELECT province FROM profiles WHERE id = auth.uid()
      )
    )
  )
);