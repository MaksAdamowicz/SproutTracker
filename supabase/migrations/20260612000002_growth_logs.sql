-- Create growth_logs table
CREATE TABLE public.growth_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id uuid NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('water', 'fertilize', 'measure', 'note')),
  measurement_cm numeric,
  notes text,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.growth_logs ENABLE ROW LEVEL SECURITY;

-- Policies for growth_logs
CREATE POLICY "Public growth logs are viewable by everyone."
  ON public.growth_logs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own logs."
  ON public.growth_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs."
  ON public.growth_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs."
  ON public.growth_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Define log-images storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('log-images', 'log-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage (note: these policies apply to storage.objects)
CREATE POLICY "Public log images are viewable by everyone."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'log-images');

CREATE POLICY "Authenticated users can upload log images."
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'log-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own log images."
  ON storage.objects FOR DELETE
  USING (bucket_id = 'log-images' AND auth.uid() = owner);
