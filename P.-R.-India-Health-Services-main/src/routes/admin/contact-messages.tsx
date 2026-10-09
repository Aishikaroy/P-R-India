import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AdminLayout } from "../../components/admin/AdminLayout";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import type { Database } from "../../lib/database.types";

type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"];
type MessageStatus = "new" | "contacted" | "resolved";

const STATUS_OPTIONS: { value: MessageStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "resolved", label: "Resolved" },
];

export const Route = createFileRoute("/admin/contact-messages")({
  head: () => ({
    meta: [
      {
        title: "Contact Messages — Admin Portal | P. R. India Health Services",
      },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
  component: AdminContactMessagesPage,
});

function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Status update state (scoped to detail modal)
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;

      setMessages(data || []);
      setFilteredMessages(data || []);
    } catch (err) {
      console.error(
        "Error loading contact messages:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setError("Failed to fetch contact messages. Please check your admin permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Apply search and filter
  useEffect(() => {
    let result = [...messages];

    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.email.toLowerCase().includes(term) ||
          m.subject.toLowerCase().includes(term) ||
          m.phone.includes(term),
      );
    }

    setFilteredMessages(result);
  }, [searchTerm, statusFilter, messages]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return "bg-teal/15 text-teal font-semibold";
      case "contacted":
        return "bg-amber-500/15 text-amber-700 font-semibold";
      case "resolved":
        return "bg-emerald-500/15 text-emerald-700 font-semibold";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  const handleStatusUpdate = async (messageId: string, newStatus: MessageStatus) => {
    if (!isSupabaseConfigured) return;

    // Guard: don't re-save the same status
    if (selectedMessage?.status === newStatus) return;

    setUpdatingStatus(true);
    setUpdateSuccess(false);
    setUpdateError(null);

    try {
      const { error: updateErr } = await supabase
        .from("contact_messages")
        .update({ status: newStatus } as Database["public"]["Tables"]["contact_messages"]["Update"])
        .eq("id", messageId);

      if (updateErr) throw updateErr;

      // Update local state immediately without full refetch
      const updated = { ...selectedMessage!, status: newStatus };
      setSelectedMessage(updated);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
      setUpdateSuccess(true);

      // Auto-clear success feedback after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error(
        "Error updating contact message status:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setUpdateError("Status update failed. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  const handleCloseMessage = () => {
    setSelectedMessage(null);
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  return (
    <AdminLayout title="Contact Messages">
      <div className="space-y-6">
        {/* Header and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Contact Inquiries</h2>
            <p className="text-xs text-muted-foreground">
              Review and manage messages submitted through the public contact form.
            </p>
          </div>
          <button
            onClick={fetchMessages}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="card-soft p-4 bg-card grid gap-3 sm:grid-cols-12">
          <div className="sm:col-span-9 relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, subject or phone..."
              className="flex h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Messages Table */}
        <div className="card-soft bg-card overflow-hidden shadow-soft">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-xs text-muted-foreground">Loading contact messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-16 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                {messages.length === 0
                  ? "No contact messages have been submitted yet."
                  : "No messages match your current filters."}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="mt-3 text-xs text-primary underline-offset-4 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-section text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Subject</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Submitted</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMessages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-foreground whitespace-nowrap">
                        {msg.name}
                      </td>
                      <td className="px-5 py-3.5 text-foreground max-w-[200px]">
                        <span className="block truncate">{msg.subject}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-muted-foreground whitespace-nowrap">
                        {msg.email}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-muted-foreground whitespace-nowrap">
                        {msg.phone}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] ${getStatusBadge(msg.status)}`}
                        >
                          {msg.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(msg.created_at)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenMessage(msg)}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-primary hover:bg-secondary"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="card-soft max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-card p-6 sm:p-8 shadow-lift">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] ${getStatusBadge(selectedMessage.status)}`}
                  >
                    {selectedMessage.status}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                  {selectedMessage.subject}
                </h3>
                <p className="text-xs text-muted-foreground">
                  From {selectedMessage.name} &middot; Received{" "}
                  {formatDate(selectedMessage.created_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseMessage}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-6 space-y-6 text-xs sm:text-sm">
              {/* Contact Information */}
              <div>
                <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-xs">
                  <User className="h-3.5 w-3.5 text-teal" />
                  Contact Information
                </h4>
                <div className="mt-2 grid gap-3 rounded-lg border border-border bg-section p-4 sm:grid-cols-3">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Full Name</span>
                    <span className="font-semibold text-foreground">{selectedMessage.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Email</span>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="font-mono text-primary hover:underline underline-offset-4 break-all"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Phone</span>
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="font-mono font-semibold text-foreground hover:text-primary"
                    >
                      {selectedMessage.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-xs">
                  <Mail className="h-3.5 w-3.5 text-teal" />
                  Message
                </h4>
                <div className="mt-2 rounded-lg border border-border bg-section p-4 space-y-3">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Subject</span>
                    <span className="font-semibold text-foreground text-base">
                      {selectedMessage.subject}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Full Message</span>
                    <p className="mt-1.5 leading-relaxed text-foreground whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata & Status Management */}
              <div>
                <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-xs">
                  <Phone className="h-3.5 w-3.5 text-teal" />
                  Metadata &amp; Status
                </h4>
                <div className="mt-2 rounded-lg border border-border bg-section p-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        Submission Date
                      </span>
                      <span className="font-medium text-foreground">
                        {formatDate(selectedMessage.created_at)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        Current Status
                      </span>
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] ${getStatusBadge(selectedMessage.status)}`}
                      >
                        {selectedMessage.status}
                      </span>
                    </div>
                  </div>

                  {/* Status Update Controls */}
                  <div>
                    <span className="text-muted-foreground block text-[11px] mb-2">
                      Update Status
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((opt) => {
                        const isCurrent = selectedMessage.status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={isCurrent || updatingStatus}
                            onClick={() => handleStatusUpdate(selectedMessage.id, opt.value)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                              isCurrent
                                ? "border-primary/30 bg-primary/10 text-primary opacity-90"
                                : "border-border bg-card text-foreground hover:bg-secondary disabled:opacity-50"
                            }`}
                          >
                            {updatingStatus && !isCurrent ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isCurrent ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : null}
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {updateSuccess && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Status updated successfully.
                      </div>
                    )}
                    {updateError && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {updateError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end border-t border-border pt-4">
              <button
                type="button"
                onClick={handleCloseMessage}
                className="rounded-lg border border-border bg-card px-5 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
