-- ==============================================================================
-- P. R. INDIA HEALTH SERVICES — DATABASE MIGRATION
-- Adds admin UPDATE policy for contact_messages status field
-- ==============================================================================

-- Allow authorized admins to update contact_messages (specifically status column)
-- Public anon users have INSERT only (from core tables migration) and cannot UPDATE.
DROP POLICY IF EXISTS "Admins can update contact message status" ON public.contact_messages;
CREATE POLICY "Admins can update contact message status"
    ON public.contact_messages
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
