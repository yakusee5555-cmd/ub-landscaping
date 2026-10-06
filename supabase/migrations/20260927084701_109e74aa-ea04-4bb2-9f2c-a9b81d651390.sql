CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 50),
  service TEXT NOT NULL CHECK (char_length(service) BETWEEN 2 AND 100),
  consultation_date DATE NOT NULL,
  consultation_time TIME NOT NULL,
  project_brief TEXT CHECK (project_brief IS NULL OR char_length(project_brief) <= 10000),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.consultations TO service_role;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.set_consultations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER consultations_set_updated_at
BEFORE UPDATE ON public.consultations
FOR EACH ROW EXECUTE FUNCTION public.set_consultations_updated_at();