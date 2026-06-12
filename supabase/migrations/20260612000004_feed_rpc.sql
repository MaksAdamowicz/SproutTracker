-- Create a function to get feed logs for a specific user
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
  user_avatar text
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
    u.avatar_url AS user_avatar
  FROM public.growth_logs gl
  JOIN public.plants p ON p.id = gl.plant_id
  JOIN public.profiles u ON u.id = gl.user_id
  WHERE gl.user_id IN (
    SELECT following_id FROM public.follows WHERE follower_id = viewer_id
  ) OR gl.user_id = viewer_id -- Include own logs as well
  ORDER BY gl.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
