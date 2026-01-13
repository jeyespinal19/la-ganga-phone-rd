-- Create brands table for dynamic category tabs
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Seed initial brands
INSERT INTO public.brands (name, position) VALUES
  ('Samsung', 1),
  ('Xiaomi', 2),
  ('Oukitel', 3),
  ('Accesorios', 4)
ON CONFLICT (name) DO NOTHING;

-- RLS: allow anyone to read, authenticated admins to write
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read brands" ON public.brands
  FOR SELECT USING (true);

CREATE POLICY "Admin insert brands" ON public.brands
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin update brands" ON public.brands
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
