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
