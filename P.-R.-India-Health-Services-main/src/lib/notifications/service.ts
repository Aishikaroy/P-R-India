import { isSupabaseConfigured, supabase } from "../supabase";
import { renderNotificationTemplate } from "./templates";
import { notificationRegistry } from "./provider-registry";
import type {
  NotificationChannel,
  NotificationEventType,
  NotificationPreference,
  NotificationProvider,
  NotificationRecipientType,
  NotificationRecord,
  TemplateContext,
} from "./types";

export interface CreateNotificationParams {
  serviceRequestId?: string | null | undefined;
  activityId?: string | null | undefined;
  recipientType: NotificationRecipientType;
  recipientName?: string | null | undefined;
  recipientEmail?: string | null | undefined;
  recipientPhone?: string | null | undefined;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  templateContext?: TemplateContext | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface RecipientContactInfo {
  type: NotificationRecipientType;
  name?: string | null | undefined;
  email?: string | null | undefined;
  phone?: string | null | undefined;
}

export const DEFAULT_PREFERENCES: Record<
  NotificationEventType,
  { email: boolean; whatsapp: boolean; sms: boolean }
> = {
  request_received: { email: true, whatsapp: true, sms: false },
  request_under_review: { email: true, whatsapp: true, sms: false },
  request_contacted: { email: true, whatsapp: true, sms: false },
  request_scheduled: { email: true, whatsapp: true, sms: true },
  professional_assigned: { email: true, whatsapp: true, sms: false },
  professional_released: { email: true, whatsapp: false, sms: false },
  new_service_request: { email: true, whatsapp: false, sms: false },
  new_team_registration: { email: true, whatsapp: false, sms: false },
  new_contact_message: { email: true, whatsapp: false, sms: false },
};

export const MAX_RETRY_ATTEMPTS = 3;

export class NotificationService {
  /**
   * Retrieves notification preferences from database or default fallback.
   */
  public static async getPreferences(): Promise<NotificationPreference[]> {
    if (!isSupabaseConfigured) {
      return Object.entries(DEFAULT_PREFERENCES).map(([eventType, config]) => ({
        id: `pref-${eventType}`,
        event_type: eventType as NotificationEventType,
        email_enabled: config.email,
        whatsapp_enabled: config.whatsapp,
        sms_enabled: config.sms,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .order("event_type", { ascending: true });

      if (error || !data || data.length === 0) {
        // Return default preference mapping
        return Object.entries(DEFAULT_PREFERENCES).map(([eventType, config]) => ({
          id: `pref-${eventType}`,
          event_type: eventType as NotificationEventType,
          email_enabled: config.email,
          whatsapp_enabled: config.whatsapp,
          sms_enabled: config.sms,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      }

      return data as NotificationPreference[];
    } catch {
      return Object.entries(DEFAULT_PREFERENCES).map(([eventType, config]) => ({
        id: `pref-${eventType}`,
        event_type: eventType as NotificationEventType,
        email_enabled: config.email,
        whatsapp_enabled: config.whatsapp,
        sms_enabled: config.sms,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
  }

  /**
   * Updates channel routing preferences for a specific business event.
   */
  public static async updatePreference(
    eventType: NotificationEventType,
    updates: {
      email_enabled?: boolean | undefined;
      whatsapp_enabled?: boolean | undefined;
      sms_enabled?: boolean | undefined;
    },
  ): Promise<{ preference: NotificationPreference | null; error: Error | null }> {
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("notification_preferences")
        .upsert(
          {
            event_type: eventType,
            ...updates,
            updated_at: nowIso,
          },
          { onConflict: "event_type" },
        )
        .select()
        .single();

      if (error) {
        return { preference: null, error: new Error(error.message) };
      }

      return { preference: data as NotificationPreference, error: null };
    } catch (err) {
      return {
        preference: null,
        error: err instanceof Error ? err : new Error("Failed to update notification preference"),
      };
    }
  }

  /**
   * Checks whether a channel is enabled for a given event type according to admin preferences.
   */
  public static async isChannelEnabled(
    eventType: NotificationEventType,
    channel: NotificationChannel,
  ): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const defaultCfg = DEFAULT_PREFERENCES[eventType];
      if (!defaultCfg) return true;
      if (channel === "email") return defaultCfg.email;
      if (channel === "whatsapp") return defaultCfg.whatsapp;
      if (channel === "sms") return defaultCfg.sms;
      return true;
    }

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("event_type", eventType)
        .maybeSingle();

      if (error || !data) {
        const defaultCfg = DEFAULT_PREFERENCES[eventType];
        if (!defaultCfg) return true;
        if (channel === "email") return defaultCfg.email;
        if (channel === "whatsapp") return defaultCfg.whatsapp;
        if (channel === "sms") return defaultCfg.sms;
        return true;
      }

      const pref = data as NotificationPreference;
      if (channel === "email") return pref.email_enabled;
      if (channel === "whatsapp") return pref.whatsapp_enabled;
      if (channel === "sms") return pref.sms_enabled;
      return false;
    } catch {
      return true;
    }
  }

  /**
   * Creates and queues a notification record in the database after preference & idempotency checks.
   */
  public static async queueNotification(params: CreateNotificationParams): Promise<{
    notification: NotificationRecord | null;
    error: Error | null;
    idempotentSkipped?: boolean | undefined;
    skippedByPreference?: boolean | undefined;
  }> {
    try {
      // 1. Check administrative channel preference
      const isEnabled = await this.isChannelEnabled(params.eventType, params.channel);
      if (!isEnabled) {
        return {
          notification: null,
          error: null,
          skippedByPreference: true,
        };
      }

      // 2. Idempotency pre-check if activityId is present
      if (params.activityId) {
        const { data: existing, error: checkError } = await supabase
          .from("notifications")
          .select("*")
          .eq("activity_id", params.activityId)
          .eq("channel", params.channel)
          .eq("recipient_type", params.recipientType)
          .eq("event_type", params.eventType)
          .maybeSingle();

        if (checkError) {
          console.error("Failed idempotency check query:", checkError.message || "Unknown error");
        } else if (existing) {
          // Idempotent duplicate detected, return existing record safely
          return {
            notification: existing as NotificationRecord,
            error: null,
            idempotentSkipped: true,
          };
        }
      }

      // 3. Render safe, privacy-compliant, provider-agnostic template
      const rendered = renderNotificationTemplate(params.eventType, {
        recipientName: params.recipientName,
        ...params.templateContext,
      });

      // 4. Insert queued notification
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          service_request_id: params.serviceRequestId || null,
          activity_id: params.activityId || null,
          recipient_type: params.recipientType,
          recipient_name: params.recipientName || null,
          recipient_email: params.recipientEmail || null,
          recipient_phone: params.recipientPhone || null,
          channel: params.channel,
          event_type: params.eventType,
          subject: rendered.subject || null,
          message: rendered.message,
          status: "queued",
          attempt_count: 0,
          metadata: params.metadata || {},
        })
        .select()
        .single();

      if (error) {
        // If unique index violation happened concurrently, retrieve the existing record
        if (error.code === "23505" && params.activityId) {
          const { data: dupData } = await supabase
            .from("notifications")
            .select("*")
            .eq("activity_id", params.activityId)
            .eq("channel", params.channel)
            .eq("recipient_type", params.recipientType)
            .eq("event_type", params.eventType)
            .maybeSingle();
          if (dupData) {
            return {
              notification: dupData as NotificationRecord,
              error: null,
              idempotentSkipped: true,
            };
          }
        }
        return { notification: null, error: new Error(error.message) };
      }

      return { notification: data as NotificationRecord, error: null, idempotentSkipped: false };
    } catch (err) {
      return {
        notification: null,
        error:
          err instanceof Error
            ? err
            : new Error("An unexpected error occurred while queuing notification"),
      };
    }
  }

  /**
   * Helper to queue multi-channel notifications for a business event based on active preferences.
   */
  public static async queueNotificationsForEvent(
    eventType: NotificationEventType,
    recipient: RecipientContactInfo,
    options: {
      serviceRequestId?: string | null | undefined;
      activityId?: string | null | undefined;
      templateContext?: TemplateContext | undefined;
      metadata?: Record<string, unknown> | undefined;
    } = {},
  ): Promise<{ queuedCount: number; errors: Error[] }> {
    const channels: NotificationChannel[] = ["email", "whatsapp", "sms"];
    let queuedCount = 0;
    const errors: Error[] = [];

    for (const channel of channels) {
      // Validate contact channel availability
      if (channel === "email" && !recipient.email) continue;
      if ((channel === "whatsapp" || channel === "sms") && !recipient.phone) continue;

      const result = await this.queueNotification({
        serviceRequestId: options.serviceRequestId,
        activityId: options.activityId,
        recipientType: recipient.type,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        recipientPhone: recipient.phone,
        channel,
        eventType,
        templateContext: options.templateContext,
        metadata: options.metadata,
      });

      if (result.error) {
        errors.push(result.error);
      } else if (result.notification && !result.idempotentSkipped && !result.skippedByPreference) {
        queuedCount++;
      }
    }

    return { queuedCount, errors };
  }

  /**
   * Dispatches a notification record through its designated provider adapter.
   * Tracks attempt count, last attempt, next retry backoff, provider metadata, and error details.
   */
  public static async dispatchNotification(
    notificationId: string,
    providerOverride?: NotificationProvider,
  ): Promise<{ notification: NotificationRecord | null; error: Error | null }> {
    try {
      // 1. Fetch current notification
      const { data: current, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", notificationId)
        .single();

      if (fetchError || !current) {
        return {
          notification: null,
          error: new Error(fetchError?.message || "Notification not found"),
        };
      }

      const record = current as NotificationRecord;

      // 2. Select provider (override > registry provider for channel)
      const provider = providerOverride || notificationRegistry.getProvider(record.channel);

      // 3. Mark as processing and increment attempt count
      const nextAttemptCount = (record.attempt_count || 0) + 1;
      const nowIso = new Date().toISOString();

      await supabase
        .from("notifications")
        .update({
          status: "processing",
          attempt_count: nextAttemptCount,
          last_attempt_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", notificationId);

      // 4. Invoke provider abstraction
      const sendResult = await provider.send(record);

      // 5. Update state according to delivery result
      if (sendResult.success) {
        const finalStatus = sendResult.delivered === true ? "delivered" : "sent";
        const { data: updated, error: updateError } = await supabase
          .from("notifications")
          .update({
            status: finalStatus,
            sent_at: new Date().toISOString(),
            next_retry_at: null,
            provider: provider.name,
            provider_message_id: sendResult.providerMessageId || null,
            error_message: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", notificationId)
          .select()
          .single();

        if (updateError) {
          return { notification: null, error: new Error(updateError.message) };
        }
        return { notification: updated as NotificationRecord, error: null };
      } else {
        // Calculate bounded exponential backoff for retries
        let nextRetryIso: string | null = null;
        if (nextAttemptCount < MAX_RETRY_ATTEMPTS) {
          // Attempt 1: 5 minutes, Attempt 2: 15 minutes, Attempt 3: 60 minutes
          const backoffMinutes = nextAttemptCount === 1 ? 5 : nextAttemptCount === 2 ? 15 : 60;
          nextRetryIso = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();
        }

        const errorMessage =
          nextAttemptCount >= MAX_RETRY_ATTEMPTS
            ? `${sendResult.error || "Provider delivery failed"} (Max retries reached: ${MAX_RETRY_ATTEMPTS}/${MAX_RETRY_ATTEMPTS})`
            : sendResult.error || "Provider delivery failed";

        const { data: updated, error: updateError } = await supabase
          .from("notifications")
          .update({
            status: "failed",
            failed_at: new Date().toISOString(),
            next_retry_at: nextRetryIso,
            provider: provider.name,
            error_message: errorMessage,
            updated_at: new Date().toISOString(),
          })
          .eq("id", notificationId)
          .select()
          .single();

        if (updateError) {
          return { notification: null, error: new Error(updateError.message) };
        }
        return { notification: updated as NotificationRecord, error: null };
      }
    } catch (err) {
      return {
        notification: null,
        error:
          err instanceof Error
            ? err
            : new Error("An unexpected error occurred while dispatching notification"),
      };
    }
  }

  /**
   * Retries a failed notification if within allowable attempt limits.
   */
  public static async retryNotification(
    notificationId: string,
    providerOverride?: NotificationProvider,
  ): Promise<{ notification: NotificationRecord | null; error: Error | null }> {
    const { data: current, error: fetchError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .single();

    if (fetchError || !current) {
      return {
        notification: null,
        error: new Error(fetchError?.message || "Notification not found"),
      };
    }

    const record = current as NotificationRecord;
    if (record.status !== "failed" && record.status !== "queued") {
      return {
        notification: record,
        error: new Error(`Notification is in '${record.status}' state and cannot be retried.`),
      };
    }

    return this.dispatchNotification(notificationId, providerOverride);
  }

  /**
   * Helper to queue and immediately dispatch in a single coordinated call.
   */
  public static async createAndDispatchNotification(
    params: CreateNotificationParams,
    providerOverride?: NotificationProvider,
  ): Promise<{
    notification: NotificationRecord | null;
    error: Error | null;
    idempotentSkipped?: boolean | undefined;
    skippedByPreference?: boolean | undefined;
  }> {
    const queueResult = await this.queueNotification(params);
    if (queueResult.error || !queueResult.notification) {
      return queueResult;
    }

    // If duplicate was detected and already sent/delivered/processing, avoid re-dispatching unless queued
    if (
      queueResult.idempotentSkipped &&
      (queueResult.notification.status === "sent" ||
        queueResult.notification.status === "delivered")
    ) {
      return queueResult;
    }

    const dispatchResult = await this.dispatchNotification(
      queueResult.notification.id,
      providerOverride,
    );
    return {
      notification: dispatchResult.notification || queueResult.notification,
      error: dispatchResult.error,
      idempotentSkipped: queueResult.idempotentSkipped,
      skippedByPreference: queueResult.skippedByPreference,
    };
  }

  /**
   * Background dispatcher entry point for scheduled tasks, cron jobs, or webhook triggers.
   * Processes queued items and eligible retries within bounded limits.
   */
  public static async processQueuedAndRetryNotifications(batchLimit = 10): Promise<{
    processed: number;
    sent: number;
    delivered: number;
    failed: number;
  }> {
    const nowIso = new Date().toISOString();

    // Query queued records or failed records ready for next retry
    const { data: candidates, error } = await supabase
      .from("notifications")
      .select("id, status, attempt_count, next_retry_at")
      .or(
        `status.eq.queued,and(status.eq.failed,attempt_count.lt.${MAX_RETRY_ATTEMPTS},next_retry_at.lte.${nowIso})`,
      )
      .order("created_at", { ascending: true })
      .limit(batchLimit);

    if (error || !candidates) {
      console.error(
        "Error querying dispatch queue:",
        error ? error.message : "No candidate data returned",
      );
      return { processed: 0, sent: 0, delivered: 0, failed: 0 };
    }

    let sent = 0;
    let delivered = 0;
    let failed = 0;

    for (const item of candidates) {
      const result = await this.dispatchNotification(item.id);
      if (result.notification) {
        if (result.notification.status === "delivered") delivered++;
        else if (result.notification.status === "sent") sent++;
        else if (result.notification.status === "failed") failed++;
      }
    }

    return {
      processed: candidates.length,
      sent,
      delivered,
      failed,
    };
  }
}
