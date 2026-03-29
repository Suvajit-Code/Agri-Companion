-- Allow users to view public profile info (full_name) for all users
-- This is needed for displaying post author names in Community forum
CREATE POLICY "Users can view all profiles for public display"
ON public.profiles FOR SELECT
USING (true);

-- Grant policy to allow authenticated users to see other users' names
-- This ensures community posts display author names correctly
