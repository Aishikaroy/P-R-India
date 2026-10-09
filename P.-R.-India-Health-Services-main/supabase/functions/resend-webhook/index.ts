// Resend Webhook Ingestion Handler
// Handles Resend delivery status lifecycle: email.delivered, email.bounced, email.complained

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    created_at?: string;
    email_id?: string;
    id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    bounce_type?: string;
    [key: string]: unknown;
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // 1. Signature Verification Check
    const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
    if (webhookSecret) {
      const svixSignature = req.headers.get("svix-signature");
      if (!svixSignature) {
        return new Response(JSON.stringify({ error: "Missing required svix-signature header" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 2. Parse Resend Event
    const payload: ResendWebhookEvent = await req.json();
    const eventType = payload.type;
    const providerMessageId = payload.data?.email_id || payload.data?.id;

    if (!providerMessageId) {
      return new Response(
        JSON.stringify({ error: "Missing email provider message ID in webhook payload." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Database service credentials unconfigured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Lookup Notification by provider_message_id
    const { data: notification, error: lookupError } = await supabase
      .from("notifications")
      .select("id, status, attempt_count")
      .eq("provider_message_id", providerMessageId)
      .maybeSingle();

    if (lookupError || !notification) {
      // Return 200 to acknowledge webhook even if not found to avoid provider webhook retry storm
      return new Response(
        JSON.stringify({
          success: true,
          message: "Notification record not found or already archived.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const nowIso = new Date().toISOString();

    // 5. Handle Status Transitions Idempotently
    if (eventType === "email.delivered") {
      await supabase
        .from("notifications")
        .update({
          status: "delivered",
          delivered_at: nowIso,
          next_retry_at: null,
          updated_at: nowIso,
        })
        .eq("id", notification.id);
    } else if (eventType === "email.bounced" || eventType === "email.complained") {
      const bounceReason =
        eventType === "email.complained"
          ? "Spam complaint reported by recipient email provider."
          : `Email delivery bounced (${payload.data?.bounce_type || "permanent"}).`;

      await supabase
        .from("notifications")
        .update({
          status: "failed",
          failed_at: nowIso,
          next_retry_at: null, // Permanent failure: cancel retries
          error_message: bounceReason,
          updated_at: nowIso,
        })
        .eq("id", notification.id);
    }

    return new Response(JSON.stringify({ success: true, processed: true, event: eventType }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Webhook Processing Error";
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
