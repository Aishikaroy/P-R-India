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
