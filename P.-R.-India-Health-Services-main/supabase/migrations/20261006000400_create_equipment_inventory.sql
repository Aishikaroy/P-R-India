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
