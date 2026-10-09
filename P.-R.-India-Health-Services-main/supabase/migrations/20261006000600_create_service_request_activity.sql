-- ==============================================================================
-- P. R. INDIA HEALTH SERVICES -- DATABASE MIGRATION (PHASE 5C / ACTIVITY)
-- Service Request Activity History System: Timeline of Operational Events
-- Append-Only Event Log with Automated Database Triggers & RPC Integration
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: service_request_activity
-- Append-only chronological timeline of operational events on a service request
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_request_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE RESTRICT,
    event_type TEXT NOT NULL CHECK (event_type IN ('request_created', 'status_changed', 'professional_assigned', 'professional_released', 'equipment_assigned', 'equipment_released')),
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Compound index for fast individual request timeline queries
CREATE INDEX IF NOT EXISTS idx_sra_activity_req_created ON public.service_request_activity(service_request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sra_activity_event_type ON public.service_request_activity(event_type);

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS)
-- Append-only operational history:
--   - Public/Anonymous: No access (cannot SELECT, INSERT, UPDATE, DELETE)
--   - Authenticated Admins: SELECT only (cannot UPDATE or DELETE historical records)
--   - System triggers & SECURITY DEFINER functions insert new events
-- ------------------------------------------------------------------------------
ALTER TABLE public.service_request_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view activity" ON public.service_request_activity;
CREATE POLICY "Admins can view activity"
    ON public.service_request_activity
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. TRIGGERS FOR AUTOMATIC EVENT CREATION
-- ------------------------------------------------------------------------------

-- 3.1 Trigger: request_created (on service_requests INSERT)
CREATE OR REPLACE FUNCTION public.trg_service_request_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.service_request_activity (
        service_request_id,
        event_type,
        actor_user_id,
        description,
        metadata,
        created_at
    ) VALUES (
        NEW.id,
        'request_created',
        auth.uid(),
        'Service request submitted',
        jsonb_build_object(
            'reference_id', NEW.reference_id,
            'service_required', NEW.service_required,
            'urgency', NEW.urgency
        ),
        NEW.created_at
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_service_request_created ON public.service_requests;
CREATE TRIGGER trg_service_request_created
    AFTER INSERT ON public.service_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_service_request_created();

-- 3.2 Trigger: status_changed (on service_requests status UPDATE)
CREATE OR REPLACE FUNCTION public.trg_service_request_status_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.service_request_activity (
            service_request_id,
            event_type,
            actor_user_id,
            description,
            metadata
        ) VALUES (
            NEW.id,
            'status_changed',
            auth.uid(),
            'Status changed from ' || INITCAP(REPLACE(OLD.status, '_', ' ')) || ' to ' || INITCAP(REPLACE(NEW.status, '_', ' ')),
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_service_request_status_changed ON public.service_requests;
CREATE TRIGGER trg_service_request_status_changed
    AFTER UPDATE OF status ON public.service_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_service_request_status_changed();

-- ------------------------------------------------------------------------------
-- 4. UPDATE ATOMIC RPCS TO INCLUDE ACTIVITY LOGGING
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
    v_asset_code TEXT;
    v_type_name TEXT;
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
    SELECT ea.status, ea.asset_code, et.name 
    INTO v_asset_status, v_asset_code, v_type_name
    FROM public.equipment_assets ea
    JOIN public.equipment_types et ON et.id = ea.equipment_type_id
    WHERE ea.id = p_asset_id
    FOR UPDATE OF ea;

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

    -- 6. Insert activity event
    INSERT INTO public.service_request_activity (
        service_request_id,
        event_type,
        actor_user_id,
        description,
        metadata
    ) VALUES (
        p_request_id,
        'equipment_assigned',
        auth.uid(),
        'Equipment ' || v_asset_code || ' (' || COALESCE(v_type_name, 'Device') || ') assigned',
        jsonb_build_object(
            'equipment_asset_id', p_asset_id,
            'asset_code', v_asset_code,
            'equipment_type', v_type_name,
            'assignment_id', v_assignment_id
        )
    );

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
    v_req_id UUID;
    v_asset_id UUID;
    v_asset_code TEXT;
    v_current_status TEXT;
    v_result JSONB;
BEGIN
    -- 1. Authorization check
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Administrator privileges required.' USING ERRCODE = '42501';
    END IF;

    -- 2. Lock and retrieve assignment
    SELECT sra.service_request_id, sra.equipment_asset_id, sra.status, ea.asset_code
    INTO v_req_id, v_asset_id, v_current_status, v_asset_code
    FROM public.service_request_assignments sra
    LEFT JOIN public.equipment_assets ea ON ea.id = sra.equipment_asset_id
    WHERE sra.id = p_assignment_id AND sra.assignment_type = 'equipment'
    FOR UPDATE OF sra;

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

    -- 5. Insert activity event
    INSERT INTO public.service_request_activity (
        service_request_id,
        event_type,
        actor_user_id,
        description,
        metadata
    ) VALUES (
        v_req_id,
        'equipment_released',
        auth.uid(),
        'Equipment ' || COALESCE(v_asset_code, 'Asset') || ' released',
        jsonb_build_object(
            'equipment_asset_id', v_asset_id,
            'asset_code', v_asset_code,
            'assignment_id', p_assignment_id
        )
    );

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
    v_prof_name TEXT;
    v_prof_role TEXT;
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
    SELECT verification_status, full_name, profession 
    INTO v_prof_status, v_prof_name, v_prof_role
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

    -- 5. Insert activity event
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
            'professional_id', p_professional_id,
            'professional_name', v_prof_name,
            'profession', v_prof_role,
            'assignment_id', v_assignment_id
        )
    );

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
    v_req_id UUID;
    v_prof_id UUID;
    v_prof_name TEXT;
    v_current_status TEXT;
    v_result JSONB;
BEGIN
    -- 1. Authorization check
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Administrator privileges required.' USING ERRCODE = '42501';
    END IF;

    -- 2. Verify assignment exists and is active
    SELECT sra.service_request_id, sra.professional_id, sra.status, tr.full_name
    INTO v_req_id, v_prof_id, v_current_status, v_prof_name
    FROM public.service_request_assignments sra
    LEFT JOIN public.team_registrations tr ON tr.id = sra.professional_id
    WHERE sra.id = p_assignment_id AND sra.assignment_type = 'professional'
    FOR UPDATE OF sra;

    IF v_prof_id IS NULL THEN
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

    -- 4. Insert activity event
    INSERT INTO public.service_request_activity (
        service_request_id,
        event_type,
        actor_user_id,
        description,
        metadata
    ) VALUES (
        v_req_id,
        'professional_released',
        auth.uid(),
        COALESCE(v_prof_name, 'Professional') || ' released from request',
        jsonb_build_object(
            'professional_id', v_prof_id,
            'professional_name', v_prof_name,
            'assignment_id', p_assignment_id
        )
    );

    SELECT jsonb_build_object(
        'success', true,
        'assignment_id', p_assignment_id,
        'status', 'released'
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. SEED INITIAL ACTIVITY FOR EXISTING SERVICE REQUESTS
-- ------------------------------------------------------------------------------
INSERT INTO public.service_request_activity (
    service_request_id,
    event_type,
    actor_user_id,
    description,
    metadata,
    created_at
)
SELECT 
    id,
    'request_created',
    NULL,
    'Service request submitted',
    jsonb_build_object(
        'reference_id', reference_id,
        'service_required', service_required,
        'urgency', urgency
    ),
    created_at
FROM public.service_requests sr
WHERE NOT EXISTS (
    SELECT 1 FROM public.service_request_activity sra
    WHERE sra.service_request_id = sr.id AND sra.event_type = 'request_created'
);
