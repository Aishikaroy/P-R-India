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
