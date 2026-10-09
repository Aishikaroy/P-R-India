import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Clock,
  HeartPulse,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AdminLayout } from "../../components/admin/AdminLayout";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      {
        title: "Admin Dashboard — P. R. India Health Services",
      },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
  component: AdminDashboardPage,
});

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  urgentRequests: number;
  totalCandidates: number;
  totalMessages: number;
  newMessages: number;
}

interface RecentRequest {
  id: string;
  reference_id: string;
  patient_name: string;
  service_required: string;
  city: string;
  urgency: string;
  status: string;
  created_at: string;
}

function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    urgentRequests: 0,
    totalCandidates: 0,
    totalMessages: 0,
    newMessages: 0,
  });
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch Service Requests counts
      const [
        { count: totalReqCount, error: errTotalReq },
        { count: pendingReqCount, error: errPendingReq },
        { count: urgentReqCount, error: errUrgentReq },
        { count: candidatesCount, error: errCandidates },
        { count: totalMsgCount, error: errTotalMsg },
        { count: newMsgCount, error: errNewMsg },
        { data: recents, error: errRecents },
      ] = await Promise.all([
        supabase.from("service_requests").select("*", { count: "exact", head: true }),
        supabase
          .from("service_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("service_requests")
          .select("*", { count: "exact", head: true })
          .eq("urgency", "Urgent"),
        supabase.from("team_registrations").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
        supabase
          .from("contact_messages")
          .select("*", { count: "exact", head: true })
          .eq("status", "new"),
        supabase
          .from("service_requests")
          .select(
            "id, reference_id, patient_name, service_required, city, urgency, status, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      if (errTotalReq || errRecents) {
        throw errTotalReq || errRecents || errPendingReq || errCandidates || errTotalMsg;
      }

      setStats({
        totalRequests: totalReqCount ?? 0,
        pendingRequests: pendingReqCount ?? 0,
        urgentRequests: urgentReqCount ?? 0,
        totalCandidates: candidatesCount ?? 0,
        totalMessages: totalMsgCount ?? 0,
        newMessages: newMsgCount ?? 0,
      });

      setRecentRequests((recents as RecentRequest[]) || []);
    } catch (err) {
      console.error(
        "Error fetching admin dashboard statistics:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setError("Unable to load live dashboard statistics. Please ensure you are authorized.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
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

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "Urgent":
        return "bg-destructive/15 text-destructive font-bold";
      case "Within 24 Hours":
        return "bg-amber-500/15 text-amber-700 font-semibold";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-teal/15 text-teal font-semibold";
      case "completed":
        return "bg-emerald-500/15 text-emerald-700 font-semibold";
      case "cancelled":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-foreground";
    }
  };

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="space-y-8">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Operational Summary</h2>
            <p className="text-xs text-muted-foreground">
              Real-time patient service requests, team registrations, and incoming inquiries.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 KPI Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Service Requests */}
          <div className="card-soft p-5 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Service Requests
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary">
                <ClipboardList className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="font-display text-3xl font-bold text-foreground">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalRequests}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats.urgentRequests} flagged as urgent
              </p>
            </div>
          </div>

          {/* Card 2: Pending Inquiries */}
          <div className="card-soft p-5 bg-card border-l-4 border-l-teal">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Triage
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="font-display text-3xl font-bold text-teal">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pendingRequests}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Awaiting coordinator review</p>
            </div>
          </div>

          {/* Card 3: Healthcare Professionals */}
          <div className="card-soft p-5 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Team Candidates
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="font-display text-3xl font-bold text-foreground">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalCandidates}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Doctors, Nurses, Caretakers</p>
            </div>
          </div>

          {/* Card 4: Contact Messages */}
          <div className="card-soft p-5 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Inquiries
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary">
                <MessageSquare className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="font-display text-3xl font-bold text-foreground">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalMessages}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{stats.newMessages} unread</p>
            </div>
          </div>
        </div>

        {/* Recent Service Requests Section */}
        <div className="card-soft bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Recent Service Requests
              </h3>
              <p className="text-xs text-muted-foreground">
                Latest patient service requirements submitted through the website.
              </p>
            </div>
            <Link
              to="/admin/service-requests"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
              View All Requests
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="mt-2 text-xs text-muted-foreground">Loading recent submissions...</p>
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No service requests have been submitted yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-section text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">Patient</th>
                    <th className="px-5 py-3.5">Service</th>
                    <th className="px-5 py-3.5">City</th>
                    <th className="px-5 py-3.5">Urgency</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Received Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-semibold text-primary">
                        {req.reference_id}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        {req.patient_name}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{req.service_required}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{req.city}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] ${getUrgencyBadge(
                            req.urgency,
                          )}`}
                        >
                          {req.urgency}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] ${getStatusBadge(
                            req.status,
                          )}`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {formatDate(req.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
