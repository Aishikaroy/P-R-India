// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code runs securely server-side inside Supabase Edge Functions.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SendEmailPayload {
  notificationId?: string;
  recipientEmail: string;
  recipientName?: string | null;
  subject: string;
  message: string;
  html?: string | null;
  eventType?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verify authorization header exists
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Validate payload
    const body: SendEmailPayload = await req.json();
    if (!body.recipientEmail || typeof body.recipientEmail !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or missing recipientEmail." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.recipientEmail)) {
      return new Response(
        JSON.stringify({ success: false, error: "Malformed recipient email address format." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Read secret credentials securely from server environment
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "RESEND_API_KEY is not configured on the server environment.",
          code: "PROVIDER_UNCONFIGURED",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const fromEmail =
      Deno.env.get("RESEND_FROM_EMAIL") ||
      "P. R. India Health Services <notifications@prindiahealth.com>";

    const toFormatted = body.recipientName
      ? `${body.recipientName} <${body.recipientEmail}>`
      : body.recipientEmail;

    // 4. Dispatch request to Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toFormatted],
        subject: body.subject || "P. R. India Health Services Notification",
        text: body.message,
        html: body.html || undefined,
        headers: {
          "X-Entity-Ref-ID": body.notificationId || "",
        },
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      const sanitizedError =
        resendData?.message || `Resend API rejected with status ${resendResponse.status}`;
      return new Response(
        JSON.stringify({
          success: false,
          provider: "resend",
          error: sanitizedError,
        }),
        {
          status: resendResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 5. Successful acceptance by Resend (status = sent)
    return new Response(
      JSON.stringify({
        success: true,
        provider: "resend",
        providerMessageId: resendData.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ success: false, error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
