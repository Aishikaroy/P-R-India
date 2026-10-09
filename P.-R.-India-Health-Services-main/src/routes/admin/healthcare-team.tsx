import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  Eye,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AdminLayout } from "../../components/admin/AdminLayout";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import type { Database } from "../../lib/database.types";

type TeamRegistration = Database["public"]["Tables"]["team_registrations"]["Row"];
type VerificationStatus = "pending" | "under_review" | "verified" | "rejected";

const STATUS_OPTIONS: { value: VerificationStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

export const Route = createFileRoute("/admin/healthcare-team")({
  head: () => ({
    meta: [
      {
        title: "Healthcare Team — Admin Portal | P. R. India Health Services",
      },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
  component: AdminHealthcareTeamPage,
});

function AdminHealthcareTeamPage() {
  const [candidates, setCandidates] = useState<TeamRegistration[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<TeamRegistration[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<TeamRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [professionFilter, setProfessionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Status update state (scoped to detail modal)
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchCandidates = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from("team_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;

      setCandidates(data || []);
      setFilteredCandidates(data || []);
    } catch (err) {
      console.error(
        "Error fetching candidate registrations:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setError("Failed to load healthcare candidate profiles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    let result = [...candidates];

    if (professionFilter !== "all") {
      result = result.filter((c) => c.profession === professionFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.verification_status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.full_name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.profession.toLowerCase().includes(term) ||
          c.city.toLowerCase().includes(term) ||
          c.areas_served.toLowerCase().includes(term) ||
          c.qualification.toLowerCase().includes(term) ||
          c.phone.includes(term) ||
          c.application_id.toLowerCase().includes(term),
      );
    }

    setFilteredCandidates(result);
  }, [searchTerm, professionFilter, statusFilter, candidates]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
      case "onboarded":
        return "bg-emerald-500/15 text-emerald-700 font-semibold";
      case "under_review":
        return "bg-sky-500/15 text-sky-700 font-semibold";
      case "pending":
        return "bg-teal/15 text-teal font-semibold";
      case "rejected":
        return "bg-destructive/15 text-destructive font-semibold";
      default:
        return "bg-secondary text-foreground";
    }
  };

  const handleStatusUpdate = async (candidateId: string, newStatus: VerificationStatus) => {
    if (!isSupabaseConfigured) return;
    if (selectedCandidate?.verification_status === newStatus) return;

    setUpdatingStatus(true);
    setUpdateSuccess(false);
    setUpdateError(null);

    try {
      const { error: updateErr } = await supabase
        .from("team_registrations")
        .update({
          verification_status: newStatus,
        } as Database["public"]["Tables"]["team_registrations"]["Update"])
        .eq("id", candidateId);

      if (updateErr) throw updateErr;

      const updated = { ...selectedCandidate!, verification_status: newStatus };
      setSelectedCandidate(updated);
      setCandidates((prev) => prev.map((c) => (c.id === candidateId ? updated : c)));
      setUpdateSuccess(true);

      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error(
        "Error updating candidate verification status:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setUpdateError("Unable to update the status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenCandidate = (cand: TeamRegistration) => {
    setSelectedCandidate(cand);
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  const handleCloseCandidate = () => {
    setSelectedCandidate(null);
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  return (
    <AdminLayout title="Healthcare Team">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Candidate Registrations
            </h2>
            <p className="text-xs text-muted-foreground">
              Review healthcare professional profiles registered to join the care network.
            </p>
          </div>
          <button
            onClick={fetchCandidates}
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
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate name, profession, city, qualification, ID..."
              className="flex h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Profession Filter */}
          <div className="sm:col-span-3">
            <select
              value={professionFilter}
              onChange={(e) => setProfessionFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Professions</option>
              <option value="MBBS / MD / DM Doctor">Doctors</option>
              <option value="Critical Care / ICU Nurse">ICU Nurses</option>
              <option value="Registered / Staff Nurse">Staff Nurses</option>
              <option value="Physiotherapist">Physiotherapists</option>
              <option value="Attendant / Caretaker">Attendants</option>
              <option value="Technician">Technicians</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Verification Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card-soft bg-card overflow-hidden shadow-soft">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-xs text-muted-foreground">Loading candidate profiles...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No candidate registrations found.
              </p>
              {(searchTerm || professionFilter !== "all" || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setProfessionFilter("all");
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
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Candidate Name</th>
                    <th className="px-5 py-3.5">Profession</th>
                    <th className="px-5 py-3.5">Qualification</th>
                    <th className="px-5 py-3.5">Experience</th>
                    <th className="px-5 py-3.5">City</th>
                    <th className="px-5 py-3.5">Availability</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Registered</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCandidates.map((cand) => (
                    <tr key={cand.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-semibold text-primary">
                        {cand.application_id}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-foreground">
                        {cand.full_name}
                      </td>
                      <td className="px-5 py-3.5 text-foreground">{cand.profession}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{cand.qualification}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{cand.experience}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{cand.city}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{cand.availability}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] ${getStatusBadge(
                            cand.verification_status,
                          )}`}
                        >
                          {cand.verification_status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {formatDate(cand.created_at)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenCandidate(cand)}
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

      {/* Candidate Details Modal with Status Management */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="card-soft max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-card p-6 sm:p-8 shadow-lift">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">
                    {selectedCandidate.application_id}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] ${getStatusBadge(
                      selectedCandidate.verification_status,
                    )}`}
                  >
                    {selectedCandidate.verification_status}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                  {selectedCandidate.full_name}
                </h3>
                <p className="text-xs text-muted-foreground">{selectedCandidate.profession}</p>
              </div>

              <button
                type="button"
                onClick={handleCloseCandidate}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-6 space-y-6 text-xs sm:text-sm">
              {/* Contact Info */}
              <div>
                <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-xs">
                  <User className="h-3.5 w-3.5 text-teal" />
                  Personal Information
                </h4>
                <div className="mt-2 grid gap-3 rounded-lg border border-border bg-section p-4 sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Phone</span>
                    <span className="font-mono font-semibold text-foreground">
                      {selectedCandidate.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Email</span>
                    <span className="font-mono text-foreground">{selectedCandidate.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Primary City</span>
                    <span className="text-foreground font-medium">{selectedCandidate.city}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Areas Served</span>
                    <span className="text-foreground">{selectedCandidate.areas_served}</span>
                  </div>
                </div>
              </div>

              {/* Professional Credentials */}
              <div>
                <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-xs">
                  <GraduationCap className="h-3.5 w-3.5 text-teal" />
                  Professional Qualifications
                </h4>
                <div className="mt-2 rounded-lg border border-border bg-section p-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Qualification</span>
                      <span className="text-foreground font-bold">
                        {selectedCandidate.qualification}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Experience</span>
                      <span className="text-foreground font-medium">
                        {selectedCandidate.experience}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      License / Council Registration Number
                    </span>
                    <span className="font-mono text-foreground font-semibold">
                      {selectedCandidate.license_number || "Not specified / Not applicable"}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Availability Preference
                    </span>
                    <span className="text-foreground font-medium">
                      {selectedCandidate.availability}
                    </span>
                  </div>
                </div>
              </div>

              {/* Services Provided */}
              <div>
                <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-xs">
                  <Briefcase className="h-3.5 w-3.5 text-teal" />
                  Clinical Capabilities
                </h4>
                <div className="mt-2 rounded-lg border border-border bg-section p-4">
                  {selectedCandidate.services_provided &&
                  selectedCandidate.services_provided.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.services_provided.map((s) => (
                        <span
                          key={s}
                          className="rounded bg-card px-2.5 py-1 text-xs font-medium border border-border text-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">None selected</span>
                  )}
                </div>
              </div>

              {/* Clinical Experience Summary */}
              {selectedCandidate.additional_info && (
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-muted-foreground text-xs">
                    Clinical Experience & Additional Notes
                  </h4>
                  <div className="mt-2 rounded-lg border border-border bg-section p-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                    {selectedCandidate.additional_info}
                  </div>
                </div>
              )}

              {/* Status Management */}
              <div>
                <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal" />
                  Verification Status Management
                </h4>
                <div className="mt-2 rounded-lg border border-border bg-section p-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        Registration Date
                      </span>
                      <span className="font-medium text-foreground">
                        {formatDate(selectedCandidate.created_at)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        Current Status
                      </span>
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] ${getStatusBadge(
                          selectedCandidate.verification_status,
                        )}`}
                      >
                        {selectedCandidate.verification_status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px] mb-2">
                      Update Verification Status
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((opt) => {
                        const isCurrent = selectedCandidate.verification_status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={isCurrent || updatingStatus}
                            onClick={() => handleStatusUpdate(selectedCandidate.id, opt.value)}
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

            {/* Footer */}
            <div className="mt-6 flex justify-end border-t border-border pt-4">
              <button
                type="button"
                onClick={handleCloseCandidate}
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
