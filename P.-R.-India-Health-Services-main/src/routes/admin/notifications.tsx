import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Loader2,
  Mail,
  MessageCircle,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Settings2,
  Shield,
  Smartphone,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AdminLayout } from "../../components/admin/AdminLayout";
import { notificationRegistry } from "../../lib/notifications/provider-registry";
import { NotificationService } from "../../lib/notifications/service";
import type {
  NotificationChannel,
  NotificationEventType,
  NotificationPreference,
  NotificationRecord,
} from "../../lib/notifications/types";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      {
        title: "Notification Log & Preferences — Admin Portal | P. R. India Health Services",
      },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
  component: AdminNotificationsPage,
});

const EVENT_LABELS: Record<NotificationEventType, string> = {
  request_received: "Request Received",
  request_under_review: "Under Review",
  request_contacted: "Contacted",
  request_scheduled: "Scheduled",
  professional_assigned: "Staff Assigned",
  professional_released: "Staff Released",
  new_service_request: "Admin: New Request",
  new_team_registration: "Admin: Team Reg",
  new_contact_message: "Admin: Contact Msg",
};

const CHANNEL_ICONS = {
  email: Mail,
  whatsapp: MessageCircle,
  sms: Smartphone,
};

function formatEventLabel(event: string): string {
  return EVENT_LABELS[event as NotificationEventType] || event.replace(/_/g, " ");
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCheck className="h-3 w-3" />
          Delivered
        </span>
      );
    case "sent":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-teal">
          <CheckCircle2 className="h-3 w-3" />
          Sent
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
          <XCircle className="h-3 w-3" />
          Failed
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          Cancelled
        </span>
      );
    case "queued":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <Clock className="h-3 w-3" />
          Queued
        </span>
      );
  }
}

function ChannelBadge({ channel }: { channel: string }) {
  const Icon = CHANNEL_ICONS[channel as NotificationChannel] || Bell;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-xs font-medium capitalize text-foreground">
      <Icon className="h-3 w-3 text-muted-foreground" />
      {channel}
    </span>
  );
}

function RecipientTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    patient: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    professional: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
    admin: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  };
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        colors[type] || "bg-muted text-muted-foreground"
      }`}
    >
      {type}
    </span>
  );
}

function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationRecord[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<NotificationRecord | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [prefSaveFeedback, setPrefSaveFeedback] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");

  // Dispatch / retry / queue processing state
  const [isDispatching, setIsDispatching] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueProcessResult, setQueueProcessResult] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;

      setNotifications((data as NotificationRecord[]) || []);
      setFilteredNotifications((data as NotificationRecord[]) || []);
    } catch (err) {
      console.error(
        "Error loading notifications:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setError("Failed to fetch notification history. Please check admin permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const prefs = await NotificationService.getPreferences();
      setPreferences(prefs);
    } catch (err) {
      console.error(
        "Error fetching notification preferences:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...notifications];

    if (statusFilter !== "all") {
      result = result.filter((n) => n.status === statusFilter);
    }
    if (channelFilter !== "all") {
      result = result.filter((n) => n.channel === channelFilter);
    }
    if (eventTypeFilter !== "all") {
      result = result.filter((n) => n.event_type === eventTypeFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (n) =>
          n.recipient_name?.toLowerCase().includes(term) ||
          n.recipient_email?.toLowerCase().includes(term) ||
          n.recipient_phone?.toLowerCase().includes(term) ||
          n.subject?.toLowerCase().includes(term) ||
          n.message?.toLowerCase().includes(term) ||
          n.id.toLowerCase().includes(term),
      );
    }

    setFilteredNotifications(result);
  }, [notifications, statusFilter, channelFilter, eventTypeFilter, searchTerm]);

  // Handle retry / dispatch
  const handleDispatchOrRetry = async (notificationId: string) => {
    setIsDispatching(true);
    setDispatchError(null);
    setDispatchSuccess(null);

    try {
      const res = await NotificationService.dispatchNotification(notificationId);
      if (res.error || !res.notification) {
        setDispatchError(res.error?.message || "Failed to dispatch notification.");
      } else {
        const notif = res.notification as NotificationRecord;
        setDispatchSuccess(
          notif.status === "sent" || notif.status === "delivered"
            ? `Successfully dispatched via ${notif.provider || "Provider"} (Status: ${notif.status}, ID: ${notif.provider_message_id || "N/A"})`
            : `Dispatch resulted in: ${notif.status} (Attempt ${notif.attempt_count}/3)`,
        );
        // Update in list & selected view
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? notif : n)));
        setSelectedNotification(notif);
      }
    } catch (err) {
      setDispatchError(err instanceof Error ? err.message : "Unexpected error occurred");
    } finally {
      setIsDispatching(false);
    }
  };

  // Handle Background Queue Dispatch trigger
  const handleProcessQueue = async () => {
    setIsProcessingQueue(true);
    setQueueProcessResult(null);

    try {
      const result = await NotificationService.processQueuedAndRetryNotifications(15);
      setQueueProcessResult(
        `Queue run completed: ${result.processed} processed (${result.sent} sent, ${result.delivered} delivered, ${result.failed} failed).`,
      );
      await fetchNotifications();
    } catch (err) {
      setQueueProcessResult(
        `Queue run failed: ${err instanceof Error ? err.message : "Unexpected error"}`,
      );
    } finally {
      setIsProcessingQueue(false);
      setTimeout(() => setQueueProcessResult(null), 6000);
    }
  };

  // Handle Preference Toggle
  const handleTogglePreference = async (
    eventType: NotificationEventType,
    channel: NotificationChannel,
    currentValue: boolean,
  ) => {
    setIsSavingPref(true);
    setPrefSaveFeedback(null);

    const updatePayload =
      channel === "email"
        ? { email_enabled: !currentValue }
        : channel === "whatsapp"
          ? { whatsapp_enabled: !currentValue }
          : { sms_enabled: !currentValue };

    const { preference, error: prefErr } = await NotificationService.updatePreference(
      eventType,
      updatePayload,
    );

    if (prefErr || !preference) {
      setPrefSaveFeedback(`Failed to update preference: ${prefErr?.message || "Error"}`);
    } else {
      setPreferences((prev) => prev.map((p) => (p.event_type === eventType ? preference : p)));
      setPrefSaveFeedback(`Updated preference for ${formatEventLabel(eventType)}.`);
      setTimeout(() => setPrefSaveFeedback(null), 3000);
    }
    setIsSavingPref(false);
  };

  // Metrics
  const totalCount = notifications.length;
  const sentCount = notifications.filter((n) => n.status === "sent").length;
  const deliveredCount = notifications.filter((n) => n.status === "delivered").length;
  const queuedCount = notifications.filter((n) => n.status === "queued").length;
  const failedCount = notifications.filter((n) => n.status === "failed").length;

  return (
    <AdminLayout title="Notification System">
      <div className="space-y-6">
        {/* Header summary & action buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              Notification Management & Delivery Queue
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Transactional notification dispatch, channel routing preferences, and bounded retry
              architecture (Phase 6B)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreferencesOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-secondary"
            >
              <Settings2 className="h-3.5 w-3.5 text-primary" />
              Channel Preferences
            </button>

            <button
              type="button"
              onClick={handleProcessQueue}
              disabled={isProcessingQueue}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-navy disabled:opacity-50"
            >
              {isProcessingQueue ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              Process Queue ({queuedCount})
            </button>

            <button
              type="button"
              onClick={fetchNotifications}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-secondary disabled:opacity-50"
              aria-label="Refresh notifications"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Queue run feedback banner */}
        {queueProcessResult && (
          <div className="rounded-lg border border-teal/30 bg-teal/10 p-3 text-xs font-medium text-foreground">
            <div className="flex items-center gap-2 text-teal">
              <CheckCircle2 className="h-4 w-4" />
              <span>{queueProcessResult}</span>
            </div>
          </div>
        )}

        {/* Informational Banner */}
        <div className="rounded-lg border border-teal/20 bg-teal/5 p-4 text-xs leading-relaxed text-foreground sm:text-sm">
          <div className="flex items-center gap-2 font-semibold text-teal">
            <Shield className="h-4 w-4 shrink-0" />
            <span>Multi-Channel Notification Architecture (Email, WhatsApp, SMS)</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Notifications are decoupled through provider adapters. Server email execution is
            prepared via secure Edge Functions (zero client-side secrets). Local and testing
            environments utilize the in-memory{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-foreground font-mono">
              MockNotificationProvider
            </code>
            .
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium uppercase tracking-wider">Total</span>
              <Bell className="h-4 w-4" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{totalCount}</p>
          </div>

          <div className="rounded-xl border border-teal/20 bg-teal/5 p-4 shadow-xs">
            <div className="flex items-center justify-between text-teal">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Sent</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-teal">{sentCount}</p>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Delivered</span>
              <CheckCheck className="h-4 w-4" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {deliveredCount}
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-xs">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Queued</span>
              <Clock className="h-4 w-4" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-amber-700 dark:text-amber-300">
              {queuedCount}
            </p>
          </div>

          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 shadow-xs">
            <div className="flex items-center justify-between text-destructive">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Failed</span>
              <AlertCircle className="h-4 w-4" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-destructive">{failedCount}</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search recipient name, email, phone, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="queued">Queued</option>
              <option value="processing">Processing</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Channel Filter */}
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>

            {/* Event Type Filter */}
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">All Events</option>
              <option value="request_received">Request Received</option>
              <option value="request_under_review">Under Review</option>
              <option value="request_contacted">Contacted</option>
              <option value="request_scheduled">Scheduled</option>
              <option value="professional_assigned">Staff Assigned</option>
              <option value="professional_released">Staff Released</option>
              <option value="new_service_request">Admin: New Request</option>
              <option value="new_team_registration">Admin: Team Reg</option>
              <option value="new_contact_message">Admin: Contact Msg</option>
            </select>
          </div>
        </div>

        {/* Notification Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-xs text-muted-foreground">Loading notification history...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="mt-2 text-sm font-semibold">{error}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Bell className="mx-auto h-8 w-8 stroke-1" />
              <p className="mt-2 text-sm font-medium text-foreground">No notifications found</p>
              <p className="text-xs">
                {notifications.length === 0
                  ? "Notification records will appear here as operational events occur."
                  : "No notifications match the active filter criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-border bg-secondary/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Event & Recipient</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Attempts & Retries</th>
                    <th className="px-4 py-3">Created / Sent</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredNotifications.map((notif) => (
                    <tr
                      key={notif.id}
                      className="cursor-pointer transition-colors hover:bg-secondary/20"
                      onClick={() => {
                        setSelectedNotification(notif);
                        setDispatchError(null);
                        setDispatchSuccess(null);
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {formatEventLabel(notif.event_type)}
                            </span>
                            <RecipientTypeBadge type={notif.recipient_type} />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {notif.recipient_name ||
                              notif.recipient_email ||
                              notif.recipient_phone ||
                              "System Recipient"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <ChannelBadge channel={notif.channel} />
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={notif.status} />
                      </td>

                      <td className="px-4 py-3 text-xs">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span>{notif.attempt_count}/3</span>
                          {notif.status === "failed" && notif.attempt_count < 3 && (
                            <span className="rounded bg-amber-500/10 px-1 py-0.2 text-[10px] text-amber-600 dark:text-amber-400">
                              Retryable
                            </span>
                          )}
                          {notif.status === "failed" && notif.attempt_count >= 3 && (
                            <span className="rounded bg-destructive/10 px-1 py-0.2 text-[10px] text-destructive">
                              Max attempts
                            </span>
                          )}
                        </div>
                        {notif.next_retry_at && notif.status === "failed" && (
                          <div className="mt-0.5 text-[10px] text-muted-foreground">
                            Next:{" "}
                            {new Date(notif.next_retry_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <div>
                          {new Date(notif.created_at).toLocaleDateString()}{" "}
                          {new Date(notif.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {notif.sent_at && (
                          <div className="text-[11px] text-teal">
                            Sent:{" "}
                            {new Date(notif.sent_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {notif.status === "failed" && (
                            <button
                              type="button"
                              onClick={() => handleDispatchOrRetry(notif.id)}
                              disabled={isDispatching}
                              title="Retry failed notification"
                              className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Retry
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNotification(notif);
                              setDispatchError(null);
                              setDispatchSuccess(null);
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Channel Preferences Management Modal */}
      {isPreferencesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Notification Channel Preferences
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure active delivery channels per operational business event (Phase 6B)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {prefSaveFeedback && (
              <div className="mt-3 rounded-lg border border-teal/30 bg-teal/10 p-2.5 text-xs text-teal">
                {prefSaveFeedback}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-border bg-secondary/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5">Event Type</th>
                      <th className="px-4 py-2.5 text-center">Email</th>
                      <th className="px-4 py-2.5 text-center">WhatsApp</th>
                      <th className="px-4 py-2.5 text-center">SMS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preferences.map((pref) => (
                      <tr key={pref.event_type} className="hover:bg-secondary/10">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {formatEventLabel(pref.event_type)}
                        </td>

                        {/* Email Toggle */}
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            disabled={isSavingPref}
                            onClick={() =>
                              handleTogglePreference(
                                pref.event_type as NotificationEventType,
                                "email",
                                pref.email_enabled,
                              )
                            }
                            className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              pref.email_enabled ? "bg-primary" : "bg-muted"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                pref.email_enabled ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>

                        {/* WhatsApp Toggle */}
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            disabled={isSavingPref}
                            onClick={() =>
                              handleTogglePreference(
                                pref.event_type as NotificationEventType,
                                "whatsapp",
                                pref.whatsapp_enabled,
                              )
                            }
                            className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              pref.whatsapp_enabled ? "bg-emerald-600" : "bg-muted"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                pref.whatsapp_enabled ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>

                        {/* SMS Toggle */}
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            disabled={isSavingPref}
                            onClick={() =>
                              handleTogglePreference(
                                pref.event_type as NotificationEventType,
                                "sms",
                                pref.sms_enabled,
                              )
                            }
                            className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              pref.sms_enabled ? "bg-blue-600" : "bg-muted"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                pref.sms_enabled ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(false)}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-navy"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {formatEventLabel(selectedNotification.event_type)}
                  </h3>
                  <RecipientTypeBadge type={selectedNotification.recipient_type} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  ID: {selectedNotification.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-4 text-xs sm:text-sm">
              {/* Status & Channel */}
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-secondary/20 p-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Delivery Status
                  </span>
                  <div className="mt-1">
                    <StatusBadge status={selectedNotification.status} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Channel & Provider
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <ChannelBadge channel={selectedNotification.channel} />
                    <span className="text-xs text-muted-foreground font-mono">
                      ({selectedNotification.provider || "None"})
                    </span>
                  </div>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="rounded-lg border border-border p-3 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Recipient Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Name: </span>
                    <span className="font-medium text-foreground">
                      {selectedNotification.recipient_name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="font-medium text-foreground">
                      {selectedNotification.recipient_email || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="font-medium text-foreground">
                      {selectedNotification.recipient_phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Attempts: </span>
                    <span className="font-mono font-medium text-foreground">
                      {selectedNotification.attempt_count}/3
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject & Rendered Message */}
              <div className="rounded-lg border border-border p-3 space-y-2">
                {selectedNotification.subject && (
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Subject
                    </span>
                    <p className="mt-0.5 text-xs font-semibold text-foreground">
                      {selectedNotification.subject}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    Privacy-Safe Message Body
                  </span>
                  <div className="mt-1 rounded-md bg-secondary/50 p-3 text-xs leading-relaxed text-foreground font-sans whitespace-pre-wrap">
                    {selectedNotification.message}
                  </div>
                </div>
              </div>

              {/* Timestamps & Technical details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted-foreground border-t border-border pt-3">
                <div>
                  <span className="block font-medium">Created</span>
                  <span>{new Date(selectedNotification.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="block font-medium">Last Attempt</span>
                  <span>
                    {selectedNotification.last_attempt_at
                      ? new Date(selectedNotification.last_attempt_at).toLocaleString()
                      : "Never"}
                  </span>
                </div>
                <div>
                  <span className="block font-medium">Sent At</span>
                  <span>
                    {selectedNotification.sent_at
                      ? new Date(selectedNotification.sent_at).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block font-medium">Delivered At</span>
                  <span
                    className={
                      selectedNotification.delivered_at
                        ? "font-semibold text-emerald-600 dark:text-emerald-400"
                        : ""
                    }
                  >
                    {selectedNotification.delivered_at
                      ? new Date(selectedNotification.delivered_at).toLocaleString()
                      : "Awaiting Receipt"}
                  </span>
                </div>
              </div>

              {selectedNotification.provider_message_id && (
                <div className="text-[11px] font-mono text-muted-foreground border-t border-border pt-2">
                  <span className="font-semibold text-foreground">Provider Message ID: </span>
                  <span>{selectedNotification.provider_message_id}</span>
                </div>
              )}

              {/* Error Message if Failed */}
              {selectedNotification.error_message && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertCircle className="h-4 w-4" />
                    <span>Failure Reason:</span>
                  </div>
                  <p className="mt-1 font-mono text-[11px]">{selectedNotification.error_message}</p>
                  {selectedNotification.next_retry_at && (
                    <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                      Next automatic retry scheduled:{" "}
                      {new Date(selectedNotification.next_retry_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Dispatch Feedback messages */}
              {dispatchSuccess && (
                <div className="rounded-lg border border-teal/30 bg-teal/10 p-3 text-xs text-teal">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Dispatch Result:</span>
                  </div>
                  <p className="mt-1">{dispatchSuccess}</p>
                </div>
              )}

              {dispatchError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertCircle className="h-4 w-4" />
                    <span>Dispatch Error:</span>
                  </div>
                  <p className="mt-1">{dispatchError}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleDispatchOrRetry(selectedNotification.id)}
                disabled={isDispatching}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-navy disabled:opacity-50"
              >
                {isDispatching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : selectedNotification.status === "failed" ? (
                  <RotateCcw className="h-3.5 w-3.5" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {selectedNotification.status === "failed"
                  ? "Retry Dispatch"
                  : "Dispatch Notification"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
