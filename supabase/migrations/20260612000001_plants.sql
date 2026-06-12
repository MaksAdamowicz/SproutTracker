-- Create plants table
CREATE TABLE public.plants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text,
  date_planted date,
  status text CHECK (status IN ('seedling', 'growing', 'blooming', 'harvested', 'dead')) DEFAULT 'seedling',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public plants are viewable by everyone."
  ON public.plants FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own plants."
  ON public.plants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants."
  ON public.plants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants."
  ON public.plants FOR DELETE
  USING (auth.uid() = user_id);
