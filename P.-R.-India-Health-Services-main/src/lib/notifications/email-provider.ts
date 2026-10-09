import { supabase } from "../supabase";
import { renderNotificationTemplate } from "./templates";
import type { NotificationProvider, NotificationRecord, ProviderSendResult } from "./types";

/**
 * Server-Side Resend Email Notification Provider.
 * Dispatches transactional email notifications via secure Supabase Edge Function
 * without exposing RESEND_API_KEY or SMTP passwords to the browser client.
 */
export class ServerEmailNotificationProvider implements NotificationProvider {
  public readonly name = "resend";
  public readonly channel = "email" as const;

  public async send(notification: NotificationRecord): Promise<ProviderSendResult> {
    if (!notification.recipient_email) {
      return {
        success: false,
        error: "Missing recipient email address.",
      };
    }

    try {
      // 1. Render branded HTML template and plain text message
      const rendered = renderNotificationTemplate(notification.event_type, {
        recipientName: notification.recipient_name,
        referenceId: (notification.metadata as Record<string, unknown> | null)?.["reference_id"] as
          string | undefined,
      });

      // 2. Invoke server-side Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("send-notification-email", {
        body: {
          notificationId: notification.id,
          recipientEmail: notification.recipient_email,
          recipientName: notification.recipient_name,
          subject:
            notification.subject || rendered.subject || "P. R. India Health Services Notification",
          message: notification.message || rendered.message,
          html: rendered.html,
          eventType: notification.event_type,
        },
      });

      if (error) {
        return {
          success: false,
          error: `Resend server gateway error: ${error.message || "Function unconfigured or unreachable"}`,
        };
      }

      if (data && data.success === false) {
        return {
          success: false,
          error: data.error || "Resend dispatch rejected by provider.",
        };
      }

      // 3. Successful acceptance by Resend (Status = 'sent', provider message ID recorded)
      return {
        success: true,
        providerMessageId:
          data?.providerMessageId ||
          `resend_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        delivered: false, // Strictly false upon dispatch; 'delivered' only occurs via verified webhook
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to execute server email dispatch.",
      };
    }
  }
}

export const serverEmailProvider = new ServerEmailNotificationProvider();
