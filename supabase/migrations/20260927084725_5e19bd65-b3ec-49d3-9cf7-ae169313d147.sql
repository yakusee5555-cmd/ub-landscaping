CREATE POLICY "Server manages consultations"
ON public.consultations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);