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
