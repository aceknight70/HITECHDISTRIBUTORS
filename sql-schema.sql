CREATE TABLE IF NOT EXISTS hublet_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  client_id text NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  active boolean DEFAULT true
);
