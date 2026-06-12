-- Create leaves table
CREATE TABLE public.leaves (
  log_id uuid NOT NULL REFERENCES public.growth_logs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (log_id, user_id)
);

-- Enable RLS
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Leaves are viewable by everyone."
  ON public.leaves FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own leaves."
  ON public.leaves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leaves."
  ON public.leaves FOR DELETE
  USING (auth.uid() = user_id);

-- Update the get_feed_logs RPC to include leaf counts and whether the viewer has left a leaf
DROP FUNCTION IF EXISTS public.get_feed_logs(uuid, int, int);

CREATE OR REPLACE FUNCTION public.get_feed_logs(viewer_id uuid, p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE (
  log_id uuid,
  activity_type text,
  measurement_cm numeric,
  notes text,
  image_url text,
  created_at timestamp with time zone,
  plant_id uuid,
  plant_name text,
  plant_species text,
  user_id uuid,
  username text,
  user_avatar text,
  leaves_count bigint,
  viewer_has_leafed boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gl.id AS log_id,
    gl.activity_type,
    gl.measurement_cm,
    gl.notes,
    gl.image_url,
    gl.created_at,
    p.id AS plant_id,
    p.name AS plant_name,
    p.species AS plant_species,
    u.id AS user_id,
    u.username,
    u.avatar_url AS user_avatar,
    (SELECT COUNT(*) FROM public.leaves l WHERE l.log_id = gl.id) AS leaves_count,
    EXISTS(SELECT 1 FROM public.leaves l WHERE l.log_id = gl.id AND l.user_id = viewer_id) AS viewer_has_leafed
  FROM public.growth_logs gl
  JOIN public.plants p ON p.id = gl.plant_id
  JOIN public.profiles u ON u.id = gl.user_id
  WHERE gl.user_id IN (
    SELECT following_id FROM public.follows WHERE follower_id = viewer_id
  ) OR gl.user_id = viewer_id
  ORDER BY gl.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
