-- ==============================================================================
-- P. R. INDIA HEALTH SERVICES -- DATABASE MIGRATION (AUDIT FIX)
-- Professional Assignment Integrity: Audit Fixes B1 + C2
-- ==============================================================================
-- FIX B1: Prevent duplicate active professional assignments (unique partial index)
-- FIX C2: Lock professional row during assignment (FOR UPDATE on team_registrations)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: Pre-flight duplicate-data check
-- Before creating the unique partial index, verify that no existing rows would
-- violate it.  If duplicates are found, the migration raises an exception and
-- halts cleanly without touching any data.  Review and resolve duplicates
-- manually before re-running.
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_duplicate_count
    FROM (
        SELECT service_request_id, professional_id
        FROM public.service_request_assignments
        WHERE
            status          = 'active'
            AND assignment_type = 'professional'
            AND professional_id IS NOT NULL
        GROUP BY service_request_id, professional_id
        HAVING COUNT(*) > 1
    ) duplicates;

    IF v_duplicate_count > 0 THEN
        RAISE EXCEPTION
            'Migration halted: % duplicate active professional assignment(s) detected. '
            'Review service_request_assignments rows where status=''active'', '
            'assignment_type=''professional'', and (service_request_id, professional_id) '
            'appears more than once. Resolve manually before re-running this migration.',
            v_duplicate_count
        USING ERRCODE = 'unique_violation';
    END IF;

    RAISE NOTICE 'Duplicate check passed: no conflicting rows found.  Proceeding.';
END;
$$;

-- ------------------------------------------------------------------------------
-- FIX B1: Unique partial index — one active professional per (request, professional)
-- Mirrors the existing equipment double-assignment index created in migration 000500.
-- Released assignments (status = 'released') are intentionally excluded so that
-- a professional can be re-assigned to the same request after a release.
-- NULL professional_id rows (equipment assignments) are also excluded.
-- ------------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_professional_assignment
    ON public.service_request_assignments (service_request_id, professional_id)
    WHERE (
        status          = 'active'
        AND assignment_type = 'professional'
        AND professional_id IS NOT NULL
    );

-- ------------------------------------------------------------------------------
-- FIX C2: Update assign_professional_to_request to lock the professional row
-- Uses CREATE OR REPLACE FUNCTION — all existing callers are unaffected.
-- The ONLY behavioural change is adding FOR UPDATE to the team_registrations
-- SELECT so that a concurrent admin UPDATE on verification_status is serialised.
-- All other logic, error codes, activity events, and return values are identical
-- to the version defined in migration 000600.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_professional_to_request(
    p_request_id     UUID,
    p_professional_id UUID,
    p_notes          TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_req_status    TEXT;
    v_prof_status   TEXT;
    v_prof_name     TEXT;
    v_prof_role     TEXT;
    v_assignment_id UUID;
    v_result        JSONB;
BEGIN
    -- 1. Authorization check (unchanged)
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Administrator privileges required.' USING ERRCODE = '42501';
    END IF;

    -- 2. Verify request eligibility — not completed/cancelled (unchanged)
    SELECT status INTO v_req_status
    FROM public.service_requests
    WHERE id = p_request_id;

    IF v_req_status IS NULL THEN
        RAISE EXCEPTION 'Service request not found.' USING ERRCODE = 'P0002';
    END IF;

    IF v_req_status IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION 'Cannot assign professional to a % request.', v_req_status USING ERRCODE = '22000';
    END IF;

    -- 3. Lock the professional row and read verification status atomically.
    --    FOR UPDATE prevents a concurrent admin UPDATE on verification_status
    --    from succeeding between this check and the assignment INSERT below.
    --    FIX C2: added FOR UPDATE (was plain SELECT in migration 000600).
    SELECT verification_status, full_name, profession
    INTO   v_prof_status, v_prof_name, v_prof_role
    FROM   public.team_registrations
    WHERE  id = p_professional_id
    FOR UPDATE;

    IF v_prof_status IS NULL THEN
        RAISE EXCEPTION 'Healthcare professional profile not found.' USING ERRCODE = 'P0002';
    END IF;

    IF v_prof_status != 'verified' THEN
        RAISE EXCEPTION 'Healthcare professional must be verified prior to assignment (current status: %).', v_prof_status USING ERRCODE = '22000';
    END IF;

    -- 4. Create active assignment row (unchanged)
    INSERT INTO public.service_request_assignments (
        service_request_id,
        assignment_type,
        professional_id,
        status,
        assigned_at,
        notes
    ) VALUES (
        p_request_id,
        'professional',
        p_professional_id,
        'active',
        timezone('utc'::text, now()),
        p_notes
    ) RETURNING id INTO v_assignment_id;

    -- 5. Insert activity event (unchanged)
    INSERT INTO public.service_request_activity (
        service_request_id,
        event_type,
        actor_user_id,
        description,
        metadata
    ) VALUES (
        p_request_id,
        'professional_assigned',
        auth.uid(),
        v_prof_name || ' (' || v_prof_role || ') assigned to request',
        jsonb_build_object(
            'professional_id',   p_professional_id,
            'professional_name', v_prof_name,
            'profession',        v_prof_role,
            'assignment_id',     v_assignment_id
        )
    );

    SELECT jsonb_build_object(
        'success',       true,
        'assignment_id', v_assignment_id,
        'status',        'active'
    ) INTO v_result;

    RETURN v_result;
END;
$$;
