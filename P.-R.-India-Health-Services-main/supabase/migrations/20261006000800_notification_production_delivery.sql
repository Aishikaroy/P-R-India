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
