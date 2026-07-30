-- Supabase Schema for Hublet Ads

CREATE TABLE IF NOT EXISTS public.hublet_ads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  client_id text NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  active boolean DEFAULT true
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.hublet_ads ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.hublet_ads
  FOR SELECT USING (true);

-- Allow public insert access (for the app manager)
CREATE POLICY "Allow public insert access" ON public.hublet_ads
  FOR INSERT WITH CHECK (true);

-- Allow public update access (for the app manager)
CREATE POLICY "Allow public update access" ON public.hublet_ads
  FOR UPDATE USING (true);
