-- ==============================================================================
-- P. R. INDIA HEALTH SERVICES -- DATABASE MIGRATION (PHASE 5B)
-- Service Request Assignment System: Professionals & Equipment Assets
-- Atomic Consistency & Double-Assignment Protection with Strict Admin RLS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: service_request_assignments
-- Relational assignment mapping of verified professionals & equipment assets
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_request_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE RESTRICT,
    assignment_type TEXT NOT NULL CHECK (assignment_type IN ('professional', 'equipment')),
    professional_id UUID REFERENCES public.team_registrations(id) ON DELETE RESTRICT,
    equipment_asset_id UUID REFERENCES public.equipment_assets(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    released_at TIMESTAMPTZ,
    notes TEXT,

    -- Enforce that an assignment references exactly one resource type
    CONSTRAINT chk_assignment_resource CHECK (
        (assignment_type = 'professional' AND professional_id IS NOT NULL AND equipment_asset_id IS NULL) OR
        (assignment_type = 'equipment' AND equipment_asset_id IS NOT NULL AND professional_id IS NULL)
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sra_service_request_id ON public.service_request_assignments(service_request_id);
CREATE INDEX IF NOT EXISTS idx_sra_professional_id ON public.service_request_assignments(professional_id);
CREATE INDEX IF NOT EXISTS idx_sra_equipment_asset_id ON public.service_request_assignments(equipment_asset_id);
CREATE INDEX IF NOT EXISTS idx_sra_status ON public.service_request_assignments(status);

-- ------------------------------------------------------------------------------
-- 2. DOUBLE-ASSIGNMENT PROTECTION (EQUIPMENT)
-- Partial unique index ensures no physical equipment asset can have more than one
-- 'active' assignment across the entire platform at any time.
-- ------------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_equipment_assignment 
ON public.service_request_assignments (equipment_asset_id) 
WHERE (status = 'active' AND assignment_type = 'equipment');

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS)
-- Administrative resource: public/anonymous users have zero access.
-- ------------------------------------------------------------------------------
ALTER TABLE public.service_request_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view assignments" ON public.service_request_assignments;
CREATE POLICY "Admins can view assignments"
    ON public.service_request_assignments
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert assignments" ON public.service_request_assignments;
CREATE POLICY "Admins can insert assignments"
    ON public.service_request_assignments
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update assignments" ON public.service_request_assignments;
CREATE POLICY "Admins can update assignments"
    ON public.service_request_assignments
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. ATOMIC DATABASE FUNCTIONS / RPCS
-- Ensures equipment state synchronization & eligibility rules are enforced atomically
-- ------------------------------------------------------------------------------

-- 4.1 Assign Equipment
CREATE OR REPLACE FUNCTION public.assign_equipment_to_request(
    p_request_id UUID,
    p_asset_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_req_status TEXT;
    v_asset_status TEXT;
    v_assignment_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Authorization check
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Administrator privileges required.' USING ERRCODE = '42501';
    END IF;

    -- 2. Verify request eligibility (not completed/cancelled)
    SELECT status INTO v_req_status
    FROM public.service_requests
    WHERE id = p_request_id;

    IF v_req_status IS NULL THEN
        RAISE EXCEPTION 'Service request not found.' USING ERRCODE = 'P0002';
    END IF;

    IF v_req_status IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION 'Cannot assign equipment to a % request.', v_req_status USING ERRCODE = '22000';
    END IF;

    -- 3. Lock & verify equipment asset eligibility (must be available)
    SELECT status INTO v_asset_status
    FROM public.equipment_assets
    WHERE id = p_asset_id
    FOR UPDATE;

    IF v_asset_status IS NULL THEN
        RAISE EXCEPTION 'Equipment asset not found.' USING ERRCODE = 'P0002';
    END IF;

    IF v_asset_status != 'available' THEN
        RAISE EXCEPTION 'Equipment asset is currently % and not available for assignment.', v_asset_status USING ERRCODE = '22000';
    END IF;

    -- 4. Create active assignment row
    INSERT INTO public.service_request_assignments (
        service_request_id,
        assignment_type,
        equipment_asset_id,
        status,
        assigned_at,
        notes
    ) VALUES (
        p_request_id,
        'equipment',
        p_asset_id,
        'active',
        timezone('utc'::text, now()),
        p_notes
    ) RETURNING id INTO v_assignment_id;

    -- 5. Atomically transition asset status: available -> assigned
    UPDATE public.equipment_assets
    SET status = 'assigned',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_asset_id;

    SELECT jsonb_build_object(
        'success', true,
        'assignment_id', v_assignment_id,
        'status', 'active'
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- 4.2 Release Equipment
CREATE OR REPLACE FUNCTION public.release_equipment_assignment(
    p_assignment_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_asset_id UUID;
    v_current_status TEXT;
    v_result JSONB;
BEGIN
    -- 1. Authorization check
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Administrator privileges required.' USING ERRCODE = '42501';
    END IF;

    -- 2. Lock and retrieve assignment
    SELECT equipment_asset_id, status INTO v_asset_id, v_current_status
    FROM public.service_request_assignments
    WHERE id = p_assignment_id AND assignment_type = 'equipment'
    FOR UPDATE;

    IF v_asset_id IS NULL THEN
        RAISE EXCEPTION 'Active equipment assignment not found.' USING ERRCODE = 'P0002';
    END IF;

    IF v_current_status != 'active' THEN
        RAISE EXCEPTION 'Assignment is already %.', v_current_status USING ERRCODE = '22000';
    END IF;

    -- 3. Update assignment: active -> released
    UPDATE public.service_request_assignments
    SET status = 'released',
        released_at = timezone('utc'::text, now()),
        notes = COALESCE(p_notes, notes),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_assignment_id;

    -- 4. Atomically transition asset status: assigned -> available
    UPDATE public.equipment_assets
    SET status = 'available',
        updated_at = timezone('utc'::text, now())
    WHERE id = v_asset_id;

    SELECT jsonb_build_object(
        'success', true,
        'assignment_id', p_assignment_id,
        'status', 'released'
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- 4.3 Assign Professional
CREATE OR REPLACE FUNCTION public.assign_professional_to_request(
    p_request_id UUID,
    p_professional_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_req_status TEXT;
    v_prof_status TEXT;
    v_assignment_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Authorization check
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Administrator privileges required.' USING ERRCODE = '42501';
    END IF;

    -- 2. Verify request eligibility (not completed/cancelled)
    SELECT status INTO v_req_status
    FROM public.service_requests
    WHERE id = p_request_id;

    IF v_req_status IS NULL THEN
        RAISE EXCEPTION 'Service request not found.' USING ERRCODE = 'P0002';
    END IF;

    IF v_req_status IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION 'Cannot assign professional to a % request.', v_req_status USING ERRCODE = '22000';
    END IF;

    -- 3. Verify professional verification status (must be verified)
    SELECT verification_status INTO v_prof_status
    FROM public.team_registrations
    WHERE id = p_professional_id;

    IF v_prof_status IS NULL THEN
        RAISE EXCEPTION 'Healthcare professional profile not found.' USING ERRCODE = 'P0002';
    END IF;

    IF v_prof_status != 'verified' THEN
        RAISE EXCEPTION 'Healthcare professional must be verified prior to assignment (current status: %).', v_prof_status USING ERRCODE = '22000';
    END IF;

    -- 4. Create active assignment row
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

    SELECT jsonb_build_object(
        'success', true,
        'assignment_id', v_assignment_id,
        'status', 'active'
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- 4.4 Release Professional
CREATE OR REPLACE FUNCTION public.release_professional_assignment(
    p_assignment_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_status TEXT;
    v_result JSONB;
BEGIN
    -- 1. Authorization check
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Administrator privileges required.' USING ERRCODE = '42501';
    END IF;

    -- 2. Verify assignment exists and is active
    SELECT status INTO v_current_status
    FROM public.service_request_assignments
    WHERE id = p_assignment_id AND assignment_type = 'professional'
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'Active professional assignment not found.' USING ERRCODE = 'P0002';
    END IF;

    IF v_current_status != 'active' THEN
        RAISE EXCEPTION 'Assignment is already %.', v_current_status USING ERRCODE = '22000';
    END IF;

    -- 3. Update assignment: active -> released (professional remains verified)
    UPDATE public.service_request_assignments
    SET status = 'released',
        released_at = timezone('utc'::text, now()),
        notes = COALESCE(p_notes, notes),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_assignment_id;

    SELECT jsonb_build_object(
        'success', true,
        'assignment_id', p_assignment_id,
        'status', 'released'
    ) INTO v_result;

    RETURN v_result;
END;
$$;
