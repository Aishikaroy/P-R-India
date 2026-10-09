import type { Database } from "../database.types";

export type NotificationChannel = "email" | "whatsapp" | "sms";
export type NotificationRecipientType = "patient" | "professional" | "admin";
export type NotificationStatus =
  "queued" | "processing" | "sent" | "delivered" | "failed" | "cancelled";

export type NotificationEventType =
  | "request_received"
  | "request_under_review"
  | "request_contacted"
  | "request_scheduled"
  | "professional_assigned"
  | "professional_released"
  | "new_service_request"
  | "new_team_registration"
  | "new_contact_message";

export type NotificationRecord = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"];

export type NotificationPreference =
  Database["public"]["Tables"]["notification_preferences"]["Row"];
export type NotificationPreferenceInsert =
  Database["public"]["Tables"]["notification_preferences"]["Insert"];
export type NotificationPreferenceUpdate =
  Database["public"]["Tables"]["notification_preferences"]["Update"];

export interface ProviderSendResult {
  success: boolean;
  providerMessageId?: string | undefined;
  delivered?: boolean | undefined;
  error?: string | undefined;
}

export interface NotificationProvider {
  name: string;
  channel: NotificationChannel | "multi";
  send(notification: NotificationRecord): Promise<ProviderSendResult>;
}

export interface TemplateContext {
  recipientName?: string | null | undefined;
  referenceId?: string | null | undefined;
  serviceRequired?: string | null | undefined;
  profession?: string | null | undefined;
  city?: string | null | undefined;
  customData?: Record<string, unknown> | undefined;
}

export interface RenderedMessage {
  subject?: string | undefined;
  message: string;
  html?: string | undefined;
}
