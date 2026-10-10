-- ==============================================================================
-- P. R. INDIA HEALTH SERVICES — DATABASE MIGRATION
-- Core Schema: Service Requests, Team Registrations, Contact Messages
-- Security: Row Level Security (RLS) enabled on all tables (INSERT only for public)
-- ==============================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABLE: service_requests
-- Stores patient service & home ICU inquiries submitted via /request-service
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    reference_id TEXT NOT NULL UNIQUE,
    patient_name TEXT NOT NULL,
    patient_age INTEGER NOT NULL CHECK (patient_age > 0 AND patient_age <= 130),
    contact_number TEXT NOT NULL,
    alternate_contact_number TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    pincode TEXT NOT NULL,
    service_required TEXT NOT NULL,
    equipment_required TEXT[] NOT NULL DEFAULT '{}',
    preferred_date DATE,
    preferred_time TEXT,
    expected_duration TEXT,
    urgency TEXT NOT NULL DEFAULT 'Planned',
    additional_requirements TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'contacted', 'assigned', 'active', 'completed', 'cancelled'))
);

-- Index for operational lookup and status filtering
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON public.service_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_reference_id ON public.service_requests(reference_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_urgency ON public.service_requests(urgency);

-- ------------------------------------------------------------------------------
-- 2. TABLE: team_registrations
-- Stores healthcare professional candidate registrations via /join-team
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    application_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL,
    areas_served TEXT NOT NULL,
    profession TEXT NOT NULL,
    qualification TEXT NOT NULL,
    experience TEXT NOT NULL,
    license_number TEXT,
    services_provided TEXT[] NOT NULL DEFAULT '{}',
    availability TEXT NOT NULL,
    additional_info TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected', 'onboarded'))
);

-- Index for candidate tracking
CREATE INDEX IF NOT EXISTS idx_team_registrations_created_at ON public.team_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_registrations_application_id ON public.team_registrations(application_id);
CREATE INDEX IF NOT EXISTS idx_team_registrations_profession ON public.team_registrations(profession);
CREATE INDEX IF NOT EXISTS idx_team_registrations_verification_status ON public.team_registrations(verification_status);

-- ------------------------------------------------------------------------------
-- 3. TABLE: contact_messages
-- Stores general public inquiries submitted via /contact
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'in_progress', 'resolved', 'archived'))
);

-- Index for message sorting
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: Anonymous/Public users can ONLY INSERT into these tables.
-- Public SELECT, UPDATE, and DELETE are strictly disallowed.
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 4.1 Policies for service_requests
-- Public anonymous client can insert new service inquiries
DROP POLICY IF EXISTS "Public can submit service requests" ON public.service_requests;
CREATE POLICY "Public can submit service requests"
    ON public.service_requests
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        status = 'pending'
    );

-- 4.2 Policies for team_registrations
-- Public anonymous client can insert new professional registrations
DROP POLICY IF EXISTS "Public can submit team registrations" ON public.team_registrations;
CREATE POLICY "Public can submit team registrations"
    ON public.team_registrations
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        verification_status = 'pending'
    );

-- 4.3 Policies for contact_messages
-- Public anonymous client can insert contact inquiries
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages"
    ON public.contact_messages
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        status = 'new'
    );

-- Note: SELECT, UPDATE, DELETE permissions are withheld from public roles.
-- Future admin roles / Supabase service_role keys will have full management policies.
-- ==============================================================================
-- P. R. INDIA HEALTH SERVICES — DATABASE MIGRATION (PHASE 3)
-- Admin Role-Based Authorization & Read-Only Management Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: user_roles
-- Associates authenticated Supabase Auth users with authorized roles (e.g. admin)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'coordinator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- ------------------------------------------------------------------------------
-- 2. HELPER FUNCTION: is_admin()
-- Evaluates whether the currently authenticated session (auth.uid()) has 'admin' role
-- Executed as SECURITY DEFINER to safely inspect user_roles without exposing table
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role = 'admin'
    );
$$;

-- ------------------------------------------------------------------------------
-- 3. RLS POLICIES FOR user_roles
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can check their own role; admins can view all assigned roles
DROP POLICY IF EXISTS "Users can view own role or admin can view all" ON public.user_roles;
CREATE POLICY "Users can view own role or admin can view all"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR public.is_admin()
    );

-- ------------------------------------------------------------------------------
-- 4. RLS SELECT POLICIES FOR ADMINS ON SUBMISSIONS
-- Permits ONLY verified administrators to query patient requests, team registrations,
-- and contact messages. Anonymous users and non-admin authenticated users cannot SELECT.
-- ------------------------------------------------------------------------------

-- 4.1 Admin SELECT policy for service_requests
DROP POLICY IF EXISTS "Admins can view service requests" ON public.service_requests;
CREATE POLICY "Admins can view service requests"
    ON public.service_requests
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
    );

-- 4.2 Admin SELECT policy for team_registrations
DROP POLICY IF EXISTS "Admins can view team registrations" ON public.team_registrations;
CREATE POLICY "Admins can view team registrations"
    ON public.team_registrations
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
    );

-- 4.3 Admin SELECT policy for contact_messages
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages"
    ON public.contact_messages
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
    );
-- ==============================================================================
-- P. R. INDIA HEALTH SERVICES � DATABASE MIGRATION
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
-- ==============================================================================
-- P. R. INDIA HEALTH SERVICES -- DATABASE MIGRATION (PHASE 5A)
-- Healthcare Equipment Inventory: Equipment Types & Equipment Assets
-- Security: Strict RLS (Admins only for SELECT, INSERT, UPDATE; Public has no access)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: equipment_types
-- Categorical catalog/models of medical equipment (e.g., ICU Bed, BiPAP, Monitor)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.equipment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_equipment_types_category ON public.equipment_types(category);
CREATE INDEX IF NOT EXISTS idx_equipment_types_active ON public.equipment_types(active);
CREATE INDEX IF NOT EXISTS idx_equipment_types_name ON public.equipment_types(name);

-- ------------------------------------------------------------------------------
-- 2. TABLE: equipment_assets
-- Specific physical items/assets tracked individually with unique asset codes
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.equipment_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    equipment_type_id UUID NOT NULL REFERENCES public.equipment_types(id) ON DELETE RESTRICT,
    asset_code TEXT NOT NULL UNIQUE,
    serial_number TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'unavailable')),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_equipment_assets_type_id ON public.equipment_assets(equipment_type_id);
CREATE INDEX IF NOT EXISTS idx_equipment_assets_asset_code ON public.equipment_assets(asset_code);
CREATE INDEX IF NOT EXISTS idx_equipment_assets_status ON public.equipment_assets(status);

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- Internal administrative resource: anonymous/public users have zero access.
-- Authorized administrators (is_admin()) have SELECT, INSERT, UPDATE permissions.
-- Deletions are restricted to preserve relational audit integrity.
-- ------------------------------------------------------------------------------

ALTER TABLE public.equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_assets ENABLE ROW LEVEL SECURITY;

-- 3.1 Policies for equipment_types
DROP POLICY IF EXISTS "Admins can view equipment types" ON public.equipment_types;
CREATE POLICY "Admins can view equipment types"
    ON public.equipment_types
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert equipment types" ON public.equipment_types;
CREATE POLICY "Admins can insert equipment types"
    ON public.equipment_types
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update equipment types" ON public.equipment_types;
CREATE POLICY "Admins can update equipment types"
    ON public.equipment_types
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3.2 Policies for equipment_assets
DROP POLICY IF EXISTS "Admins can view equipment assets" ON public.equipment_assets;
CREATE POLICY "Admins can view equipment assets"
    ON public.equipment_assets
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert equipment assets" ON public.equipment_assets;
CREATE POLICY "Admins can insert equipment assets"
    ON public.equipment_assets
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update equipment assets" ON public.equipment_assets;
CREATE POLICY "Admins can update equipment assets"
    ON public.equipment_assets
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
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
-- ==============================================================================
-- P. R. INDIA HEALTH SERVICES -- DATABASE MIGRATION (PHASE 6A)
-- Notification Infrastructure Foundation
-- Supports Multi-Channel (Email, WhatsApp, SMS) with Provider Abstraction & RLS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: notifications
-- Records transactional notification dispatch lifecycle and delivery history
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
    activity_id UUID REFERENCES public.service_request_activity(id) ON DELETE SET NULL,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('patient', 'professional', 'admin')),
    recipient_name TEXT,
    recipient_email TEXT,
    recipient_phone TEXT,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
    event_type TEXT NOT NULL CHECK (event_type IN (
        'request_received',
        'request_under_review',
        'request_contacted',
        'request_scheduled',
        'professional_assigned',
        'professional_released',
        'new_service_request',
        'new_team_registration',
        'new_contact_message'
    )),
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'failed', 'cancelled')),
    provider TEXT,
    provider_message_id TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON public.notifications(channel);
CREATE INDEX IF NOT EXISTS idx_notifications_event_type ON public.notifications(event_type);
CREATE INDEX IF NOT EXISTS idx_notifications_service_request_id ON public.notifications(service_request_id);

-- Idempotency protection: Prevents duplicate notifications for the same activity event + channel + recipient
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_idempotency 
ON public.notifications (activity_id, channel, recipient_type, event_type) 
WHERE (activity_id IS NOT NULL);

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS)
--   - Public/Anonymous: No access
--   - Non-Admin Authenticated: No access
--   - Authenticated Administrators: SELECT, INSERT, UPDATE
-- ------------------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view notifications" ON public.notifications;
CREATE POLICY "Admins can view notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications"
    ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
CREATE POLICY "Admins can update notifications"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
-- ==============================================================================
-- P. R. INDIA HEALTH SERVICES -- DATABASE MIGRATION (PHASE 6B)
-- Production Notification Delivery Infrastructure & Preferences System
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. UPDATE TABLE: notifications
-- Add 'delivered' status & retry scheduling column
-- ------------------------------------------------------------------------------

-- Update status check constraint on public.notifications
ALTER TABLE public.notifications 
    DROP CONSTRAINT IF EXISTS notifications_status_check;

ALTER TABLE public.notifications 
    ADD CONSTRAINT notifications_status_check 
    CHECK (status IN ('queued', 'processing', 'sent', 'delivered', 'failed', 'cancelled'));

-- Add retry scheduling column if not exists
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;

-- Index for queue dispatcher and retry scheduler
CREATE INDEX IF NOT EXISTS idx_notifications_queue_dispatch 
    ON public.notifications(status, next_retry_at, created_at)
    WHERE status IN ('queued', 'failed');

-- ------------------------------------------------------------------------------
-- 2. TABLE: notification_preferences
-- Channel routing toggles per business event type
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL UNIQUE CHECK (event_type IN (
        'request_received',
        'request_under_review',
        'request_contacted',
        'request_scheduled',
        'professional_assigned',
        'professional_released',
        'new_service_request',
        'new_team_registration',
        'new_contact_message'
    )),
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT true,
    sms_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Initial Default Channel Preferences
INSERT INTO public.notification_preferences (event_type, email_enabled, whatsapp_enabled, sms_enabled)
VALUES
    ('request_received', true, true, false),
    ('request_under_review', true, true, false),
    ('request_contacted', true, true, false),
    ('request_scheduled', true, true, true),
    ('professional_assigned', true, true, false),
    ('professional_released', true, false, false),
    ('new_service_request', true, false, false),
    ('new_team_registration', true, false, false),
    ('new_contact_message', true, false, false)
ON CONFLICT (event_type) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) FOR notification_preferences
-- ------------------------------------------------------------------------------
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view notification preferences" ON public.notification_preferences;
CREATE POLICY "Admins can view notification preferences"
    ON public.notification_preferences
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update notification preferences" ON public.notification_preferences;
CREATE POLICY "Admins can update notification preferences"
    ON public.notification_preferences
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert notification preferences" ON public.notification_preferences;
CREATE POLICY "Admins can insert notification preferences"
    ON public.notification_preferences
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());
-- ==============================================================================
-- P. R. INDIA HEALTH SERVICES -- DATABASE MIGRATION (PHASE 6C)
-- Resend Transactional Email Delivery, Webhooks & Delivery Confirmation
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. UPDATE TABLE: notifications
-- Add delivered_at column and provider_message_id lookup index
-- ------------------------------------------------------------------------------
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Index for fast webhook resolution by provider_message_id
CREATE INDEX IF NOT EXISTS idx_notifications_provider_message_id 
    ON public.notifications(provider_message_id)
    WHERE (provider_message_id IS NOT NULL);

-- Index for delivery state queries
CREATE INDEX IF NOT EXISTS idx_notifications_delivered_at 
    ON public.notifications(delivered_at DESC)
    WHERE (delivered_at IS NOT NULL);
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
