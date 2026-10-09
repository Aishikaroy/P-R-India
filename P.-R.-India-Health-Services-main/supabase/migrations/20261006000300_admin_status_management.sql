-- ==============================================================================
-- P. R. INDIA HEALTH SERVICES -- DATABASE MIGRATION (PHASE 4B)
-- Admin status management for service_requests and team_registrations
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SERVICE REQUESTS: Expand status CHECK constraint
--    Existing values: 'pending','in_review','contacted','assigned','active','completed','cancelled'
--    New values added: 'reviewing','scheduled'
--    Existing values 'in_review' and 'active' are preserved so existing records are not broken.
--    Maps: in_review -> reviewing (conceptual alias, both kept valid)
--          active -> scheduled (conceptual alias, both kept valid)
-- ------------------------------------------------------------------------------
ALTER TABLE public.service_requests
    DROP CONSTRAINT IF EXISTS service_requests_status_check;
ALTER TABLE public.service_requests
    ADD CONSTRAINT service_requests_status_check
    CHECK (status IN ('pending', 'in_review', 'reviewing', 'contacted', 'scheduled', 'assigned', 'active', 'completed', 'cancelled'));

-- Migrate any existing 'in_review' rows to 'reviewing'
UPDATE public.service_requests SET status = 'reviewing' WHERE status = 'in_review';
-- Migrate any existing 'active' rows to 'scheduled'
UPDATE public.service_requests SET status = 'scheduled' WHERE status = 'active';

-- ------------------------------------------------------------------------------
-- 2. RLS: Admin UPDATE policy for service_requests
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can update service requests" ON public.service_requests;
CREATE POLICY "Admins can update service requests"
    ON public.service_requests
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. RLS: Admin UPDATE policy for team_registrations
--    The CHECK constraint already permits: 'pending','under_review','verified','rejected','onboarded'
--    These match the user requirements (onboarded is a bonus existing state).
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can update team registrations" ON public.team_registrations;
CREATE POLICY "Admins can update team registrations"
    ON public.team_registrations
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
