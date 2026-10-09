import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  Boxes,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  GraduationCap,
  HeartPulse,
  History,
  Layers,
  Loader2,
  MapPin,
  Package,
  PackageMinus,
  Phone,
  Plus,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2,
  User,
  UserCheck,
  UserMinus,
  Users,
  Wind,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminLayout } from "../../components/admin/AdminLayout";
import { NotificationService } from "../../lib/notifications/service";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import type { Database } from "../../lib/database.types";

type ServiceRequest = Database["public"]["Tables"]["service_requests"]["Row"];
type RequestStatus =
  "pending" | "reviewing" | "contacted" | "scheduled" | "assigned" | "completed" | "cancelled";

interface ActiveProfessionalAssignment {
  id: string;
  assigned_at: string;
  notes: string | null;
  professional: {
    id: string;
    full_name: string;
    profession: string;
    qualification: string;
    phone: string;
    city: string;
    areas_served: string;
  } | null;
}

interface ActiveEquipmentAssignment {
  id: string;
  assigned_at: string;
  notes: string | null;
  equipment: {
    id: string;
    asset_code: string;
    serial_number: string | null;
    status: string;
    equipment_type: {
      id: string;
      name: string;
      category: string;
    } | null;
  } | null;
}

interface EligibleProfessional {
  id: string;
  full_name: string;
  profession: string;
  qualification: string;
  phone: string;
  city: string;
  areas_served: string;
}

interface EligibleEquipmentAsset {
  id: string;
  asset_code: string;
  serial_number: string | null;
  status: string;
  equipment_type: {
    id: string;
    name: string;
    category: string;
  } | null;
}

interface ServiceRequestActivity {
  id: string;
  created_at: string;
  service_request_id: string;
  event_type:
    | "request_created"
    | "status_changed"
    | "professional_assigned"
    | "professional_released"
    | "equipment_assigned"
    | "equipment_released";
  actor_user_id: string | null;
  description: string;
  metadata: Record<string, unknown>;
}

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "contacted", label: "Contacted" },
  { value: "scheduled", label: "Scheduled" },
  { value: "assigned", label: "Assigned" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const Route = createFileRoute("/admin/service-requests")({
  head: () => ({
    meta: [
      {
        title: "Service Requests — Admin Portal | P. R. India Health Services",
      },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
  component: AdminServiceRequestsPage,
});

function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // Status update state (scoped to detail modal)
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Assignment states for selected request
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignedProfessionals, setAssignedProfessionals] = useState<
    ActiveProfessionalAssignment[]
  >([]);
  const [assignedEquipment, setAssignedEquipment] = useState<ActiveEquipmentAssignment[]>([]);
  const [assignmentFeedback, setAssignmentFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Activity Timeline state for selected request
  const [activities, setActivities] = useState<ServiceRequestActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Modal: Assign Professional
  const [isAssignProfModalOpen, setIsAssignProfModalOpen] = useState(false);
  const [eligibleProfessionals, setEligibleProfessionals] = useState<EligibleProfessional[]>([]);
  const [loadingEligibleProfs, setLoadingEligibleProfs] = useState(false);
  const [selectedProfId, setSelectedProfId] = useState("");
  const [profSearch, setProfSearch] = useState("");
  const [profNotes, setProfNotes] = useState("");
  const [submittingProfAssign, setSubmittingProfAssign] = useState(false);
  const [profAssignError, setProfAssignError] = useState<string | null>(null);

  // Modal: Assign Equipment
  const [isAssignEquipModalOpen, setIsAssignEquipModalOpen] = useState(false);
  const [eligibleEquipment, setEligibleEquipment] = useState<EligibleEquipmentAsset[]>([]);
  const [loadingEligibleEquip, setLoadingEligibleEquip] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [equipSearch, setEquipSearch] = useState("");
  const [equipNotes, setEquipNotes] = useState("");
  const [submittingEquipAssign, setSubmittingEquipAssign] = useState(false);
  const [equipAssignError, setEquipAssignError] = useState<string | null>(null);

  // Modal: Release Confirmation
  const [releaseConfirmItem, setReleaseConfirmItem] = useState<{
    type: "professional" | "equipment";
    assignmentId: string;
    name: string;
  } | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);

  const fetchRequests = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from("service_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;

      setRequests(data || []);
      setFilteredRequests(data || []);
    } catch (err) {
      console.error(
        "Error loading service requests:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setError("Failed to fetch service requests. Please check permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter and search application
  useEffect(() => {
    let result = [...requests];

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (urgencyFilter !== "all") {
      result = result.filter((r) => r.urgency === urgencyFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.reference_id.toLowerCase().includes(term) ||
          r.patient_name.toLowerCase().includes(term) ||
          r.city.toLowerCase().includes(term) ||
          r.contact_number.includes(term) ||
          r.service_required.toLowerCase().includes(term),
      );
    }

    setFilteredRequests(result);
  }, [searchTerm, statusFilter, urgencyFilter, requests]);

  // Fetch active assignments for the currently open request
  const fetchActiveAssignments = async (requestId: string) => {
    if (!isSupabaseConfigured) return;
    setLoadingAssignments(true);

    try {
      const { data, error: fetchErr } = await supabase
        .from("service_request_assignments")
        .select(
          `
          id,
          assigned_at,
          assignment_type,
          status,
          notes,
          professional:team_registrations(id, full_name, profession, qualification, phone, city, areas_served),
          equipment:equipment_assets(id, asset_code, serial_number, status, equipment_type:equipment_types(id, name, category))
        `,
        )
        .eq("service_request_id", requestId)
        .eq("status", "active")
        .order("assigned_at", { ascending: true });

      if (fetchErr) throw fetchErr;

      const profs: ActiveProfessionalAssignment[] = [];
      const equips: ActiveEquipmentAssignment[] = [];

      interface RawAssignmentRow {
        id: string;
        assigned_at: string;
        assignment_type: string;
        status: string;
        notes: string | null;
        professional: {
          id: string;
          full_name: string;
          profession: string;
          qualification: string;
          phone: string;
          city: string;
          areas_served: string;
        } | null;
        equipment: {
          id: string;
          asset_code: string;
          serial_number: string | null;
          status: string;
          equipment_type: {
            id: string;
            name: string;
            category: string;
          } | null;
        } | null;
      }

      ((data as unknown as RawAssignmentRow[]) || []).forEach((row) => {
        if (row.assignment_type === "professional" && row.professional) {
          profs.push({
            id: row.id,
            assigned_at: row.assigned_at,
            notes: row.notes,
            professional: row.professional,
          });
        } else if (row.assignment_type === "equipment" && row.equipment) {
          equips.push({
            id: row.id,
            assigned_at: row.assigned_at,
            notes: row.notes,
            equipment: row.equipment,
          });
        }
      });

      setAssignedProfessionals(profs);
      setAssignedEquipment(equips);
    } catch (err) {
      console.error(
        "Error fetching assignments:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Fetch chronological activity history for currently open request
  const fetchActivities = async (requestId: string) => {
    if (!isSupabaseConfigured) return;
    setLoadingActivities(true);

    try {
      const { data, error: actErr } = await supabase
        .from("service_request_activity")
        .select("*")
        .eq("service_request_id", requestId)
        .order("created_at", { ascending: false });

      if (actErr) throw actErr;

      setActivities((data as unknown as ServiceRequestActivity[]) || []);
    } catch (err) {
      console.error(
        "Error loading activity timeline:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
    } finally {
      setLoadingActivities(false);
    }
  };

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
      case "reviewing":
      case "in_review":
        return "bg-sky-500/15 text-sky-700 font-semibold";
      case "contacted":
        return "bg-amber-500/15 text-amber-700 font-semibold";
      case "scheduled":
      case "active":
        return "bg-violet-500/15 text-violet-700 font-semibold";
      case "assigned":
        return "bg-indigo-500/15 text-indigo-700 font-semibold";
      case "completed":
        return "bg-emerald-500/15 text-emerald-700 font-semibold";
      case "cancelled":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-foreground";
    }
  };

  const getActivityEventMeta = (eventType: string) => {
    switch (eventType) {
      case "request_created":
        return {
          icon: PlusCircle,
          badgeColor: "bg-teal/15 text-teal",
          title: "Request Submitted",
        };
      case "status_changed":
        return {
          icon: RefreshCw,
          badgeColor: "bg-violet-500/15 text-violet-700",
          title: "Status Updated",
        };
      case "professional_assigned":
        return {
          icon: UserCheck,
          badgeColor: "bg-indigo-500/15 text-indigo-700",
          title: "Healthcare Professional Assigned",
        };
      case "professional_released":
        return {
          icon: UserMinus,
          badgeColor: "bg-amber-500/15 text-amber-700",
          title: "Healthcare Professional Released",
        };
      case "equipment_assigned":
        return {
          icon: Package,
          badgeColor: "bg-emerald-500/15 text-emerald-700",
          title: "Equipment Asset Assigned",
        };
      case "equipment_released":
        return {
          icon: PackageMinus,
          badgeColor: "bg-rose-500/15 text-rose-700",
          title: "Equipment Asset Released",
        };
      default:
        return {
          icon: Activity,
          badgeColor: "bg-secondary text-foreground",
          title: "Operational Event",
        };
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: RequestStatus) => {
    if (!isSupabaseConfigured) return;
    if (selectedRequest?.status === newStatus) return;

    setUpdatingStatus(true);
    setUpdateSuccess(false);
    setUpdateError(null);

    try {
      const { error: updateErr } = await supabase
        .from("service_requests")
        .update({
          status: newStatus,
        } as Database["public"]["Tables"]["service_requests"]["Update"])
        .eq("id", requestId);

      if (updateErr) throw updateErr;

      const updated = { ...selectedRequest!, status: newStatus };
      setSelectedRequest(updated);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      setUpdateSuccess(true);

      setTimeout(() => setUpdateSuccess(false), 3000);
      fetchActivities(requestId);

      // Queue patient status update notifications based on active channel preferences
      const notifEventType =
        newStatus === "reviewing"
          ? ("request_under_review" as const)
          : newStatus === "contacted"
            ? ("request_contacted" as const)
            : newStatus === "scheduled"
              ? ("request_scheduled" as const)
              : null;

      if (notifEventType && selectedRequest) {
        NotificationService.queueNotificationsForEvent(
          notifEventType,
          {
            type: "patient",
            name: selectedRequest.patient_name,
            phone: selectedRequest.contact_number,
          },
          {
            serviceRequestId: requestId,
            templateContext: {
              recipientName: selectedRequest.patient_name,
              referenceId: selectedRequest.reference_id,
              serviceRequired: selectedRequest.service_required,
            },
          },
        ).catch((err) =>
          console.error(
            "Notification queuing error on status update:",
            err instanceof Error
              ? err.message
              : (err as { message?: string })?.message || "Unknown error",
          ),
        );
      }
    } catch (err) {
      console.error(
        "Error updating service request status:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setUpdateError("Unable to update the status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenRequest = (req: ServiceRequest) => {
    setSelectedRequest(req);
    setUpdateSuccess(false);
    setUpdateError(null);
    setAssignmentFeedback(null);
    fetchActiveAssignments(req.id);
    fetchActivities(req.id);
  };

  const handleCloseRequest = () => {
    setSelectedRequest(null);
    setUpdateSuccess(false);
    setUpdateError(null);
    setAssignmentFeedback(null);
    setAssignedProfessionals([]);
    setAssignedEquipment([]);
    setActivities([]);
  };

  // ----------------------------------------------------------------------------
  // Assign Professional Handlers
  // ----------------------------------------------------------------------------
  const handleOpenAssignProfModal = async () => {
    if (!selectedRequest) return;
    setIsAssignProfModalOpen(true);
    setLoadingEligibleProfs(true);
    setSelectedProfId("");
    setProfSearch("");
    setProfNotes("");
    setProfAssignError(null);

    try {
      const { data, error: profErr } = await supabase
        .from("team_registrations")
        .select("id, full_name, profession, qualification, phone, city, areas_served")
        .eq("verification_status", "verified")
        .order("full_name", { ascending: true });

      if (profErr) throw profErr;

      // Filter out professionals already actively assigned to this request
      const activeProfIds = new Set(
        assignedProfessionals.map((p) => p.professional?.id).filter(Boolean),
      );
      const available = (data || []).filter((p) => !activeProfIds.has(p.id));

      setEligibleProfessionals(available);
      if (available.length > 0 && available[0]) {
        setSelectedProfId(available[0].id);
      }
    } catch (err) {
      console.error(
        "Error fetching eligible professionals:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setProfAssignError("Failed to load verified healthcare professionals.");
    } finally {
      setLoadingEligibleProfs(false);
    }
  };

  const handleAssignProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedProfId || !isSupabaseConfigured) return;

    setSubmittingProfAssign(true);
    setProfAssignError(null);

    try {
      const { error: rpcErr } = await supabase.rpc("assign_professional_to_request", {
        p_request_id: selectedRequest.id,
        p_professional_id: selectedProfId,
        p_notes: profNotes.trim() || null,
      });

      if (rpcErr) throw rpcErr;

      setIsAssignProfModalOpen(false);
      setAssignmentFeedback({
        type: "success",
        message: "Healthcare professional assigned successfully.",
      });
      setTimeout(() => setAssignmentFeedback(null), 4000);
      fetchActiveAssignments(selectedRequest.id);
      fetchActivities(selectedRequest.id);

      // Queue professional assignment notification
      const assignedProf = eligibleProfessionals.find((p) => p.id === selectedProfId);
      if (assignedProf) {
        NotificationService.queueNotificationsForEvent(
          "professional_assigned",
          {
            type: "professional",
            name: assignedProf.full_name,
            phone: assignedProf.phone,
          },
          {
            serviceRequestId: selectedRequest.id,
            templateContext: {
              recipientName: assignedProf.full_name,
              referenceId: selectedRequest.reference_id,
              serviceRequired: selectedRequest.service_required,
              profession: assignedProf.profession,
            },
          },
        ).catch((err) =>
          console.error(
            "Notification queuing error on prof assign:",
            err instanceof Error
              ? err.message
              : (err as { message?: string })?.message || "Unknown error",
          ),
        );
      }
    } catch (err: unknown) {
      console.error(
        "Error assigning professional:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      const msg =
        err instanceof Error ? err.message : "Unable to assign professional. Please try again.";
      setProfAssignError(msg);
    } finally {
      setSubmittingProfAssign(false);
    }
  };

  // ----------------------------------------------------------------------------
  // Assign Equipment Handlers
  // ----------------------------------------------------------------------------
  const handleOpenAssignEquipModal = async () => {
    if (!selectedRequest) return;
    setIsAssignEquipModalOpen(true);
    setLoadingEligibleEquip(true);
    setSelectedAssetId("");
    setEquipSearch("");
    setEquipNotes("");
    setEquipAssignError(null);

    try {
      const { data, error: equipErr } = await supabase
        .from("equipment_assets")
        .select(
          `
          id,
          asset_code,
          serial_number,
          status,
          equipment_type:equipment_types(id, name, category)
        `,
        )
        .eq("status", "available")
        .order("asset_code", { ascending: true });

      if (equipErr) throw equipErr;

      const assetsList = (data as unknown as EligibleEquipmentAsset[]) || [];
      setEligibleEquipment(assetsList);
      if (assetsList.length > 0 && assetsList[0]) {
        setSelectedAssetId(assetsList[0].id);
      }
    } catch (err) {
      console.error(
        "Error fetching available equipment:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setEquipAssignError("Failed to load available equipment assets.");
    } finally {
      setLoadingEligibleEquip(false);
    }
  };

  const handleAssignEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedAssetId || !isSupabaseConfigured) return;

    setSubmittingEquipAssign(true);
    setEquipAssignError(null);

    try {
      const { error: rpcErr } = await supabase.rpc("assign_equipment_to_request", {
        p_request_id: selectedRequest.id,
        p_asset_id: selectedAssetId,
        p_notes: equipNotes.trim() || null,
      });

      if (rpcErr) throw rpcErr;

      setIsAssignEquipModalOpen(false);
      setAssignmentFeedback({
        type: "success",
        message: "Equipment asset assigned successfully.",
      });
      setTimeout(() => setAssignmentFeedback(null), 4000);
      fetchActiveAssignments(selectedRequest.id);
      fetchActivities(selectedRequest.id);
    } catch (err: unknown) {
      console.error(
        "Error assigning equipment:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      const msg =
        err instanceof Error ? err.message : "Unable to assign equipment. Please try again.";
      setEquipAssignError(msg);
    } finally {
      setSubmittingEquipAssign(false);
    }
  };

  // ----------------------------------------------------------------------------
  // Release Handlers
  // ----------------------------------------------------------------------------
  const handleConfirmRelease = async () => {
    if (!releaseConfirmItem || !selectedRequest || !isSupabaseConfigured) return;

    setIsReleasing(true);

    try {
      if (releaseConfirmItem.type === "professional") {
        const { error: rpcErr } = await supabase.rpc("release_professional_assignment", {
          p_assignment_id: releaseConfirmItem.assignmentId,
        });
        if (rpcErr) throw rpcErr;
        setAssignmentFeedback({
          type: "success",
          message: `${releaseConfirmItem.name} released from service request.`,
        });
      } else {
        const { error: rpcErr } = await supabase.rpc("release_equipment_assignment", {
          p_assignment_id: releaseConfirmItem.assignmentId,
        });
        if (rpcErr) throw rpcErr;
        setAssignmentFeedback({
          type: "success",
          message: `Equipment asset ${releaseConfirmItem.name} released and returned to available inventory.`,
        });
      }

      setReleaseConfirmItem(null);
      setTimeout(() => setAssignmentFeedback(null), 4000);
      fetchActiveAssignments(selectedRequest.id);
      fetchActivities(selectedRequest.id);

      // Queue professional release notification if professional assignment was released
      if (releaseConfirmItem.type === "professional") {
        NotificationService.queueNotificationsForEvent(
          "professional_released",
          {
            type: "professional",
            name: releaseConfirmItem.name,
          },
          {
            serviceRequestId: selectedRequest.id,
            templateContext: {
              recipientName: releaseConfirmItem.name,
              referenceId: selectedRequest.reference_id,
            },
          },
        ).catch((err) =>
          console.error(
            "Notification queuing error on prof release:",
            err instanceof Error
              ? err.message
              : (err as { message?: string })?.message || "Unknown error",
          ),
        );
      }
    } catch (err: unknown) {
      console.error(
        "Error releasing assignment:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      const msg = err instanceof Error ? err.message : "Failed to release assignment.";
      setAssignmentFeedback({
        type: "error",
        message: msg,
      });
    } finally {
      setIsReleasing(false);
    }
  };

  // Filtered lists for assignment modals
  const filteredEligibleProfs = useMemo(() => {
    if (!profSearch.trim()) return eligibleProfessionals;
    const q = profSearch.toLowerCase().trim();
    return eligibleProfessionals.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        p.profession.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.areas_served.toLowerCase().includes(q) ||
        p.qualification.toLowerCase().includes(q),
    );
  }, [eligibleProfessionals, profSearch]);

  const filteredEligibleEquip = useMemo(() => {
    if (!equipSearch.trim()) return eligibleEquipment;
    const q = equipSearch.toLowerCase().trim();
    return eligibleEquipment.filter(
      (e) =>
        e.asset_code.toLowerCase().includes(q) ||
        (e.serial_number && e.serial_number.toLowerCase().includes(q)) ||
        (e.equipment_type?.name && e.equipment_type.name.toLowerCase().includes(q)) ||
        (e.equipment_type?.category && e.equipment_type.category.toLowerCase().includes(q)),
    );
  }, [eligibleEquipment, equipSearch]);

  const isRequestLocked =
    selectedRequest?.status === "completed" || selectedRequest?.status === "cancelled";

  return (
    <AdminLayout title="Service Requests">
      <div className="space-y-6">
        {/* Header and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Patient Service Requests
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage incoming home ICU setup, nursing, medical equipment inquiries, resource
              assignments, and activity timelines.
            </p>
          </div>
          <button
            onClick={fetchRequests}
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
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference ID, patient, city, phone..."
              className="flex h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="contacted">Contacted</option>
              <option value="scheduled">Scheduled</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="sm:col-span-3">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Urgencies</option>
              <option value="Planned">Planned</option>
              <option value="Within 24 Hours">Within 24 Hours</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="card-soft bg-card overflow-hidden shadow-soft">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-xs text-muted-foreground">Loading service inquiries...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No service requests matched your filters.
              </p>
              {(searchTerm || statusFilter !== "all" || urgencyFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setUrgencyFilter("all");
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
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">Patient Details</th>
                    <th className="px-5 py-3.5">Service Requested</th>
                    <th className="px-5 py-3.5">Location</th>
                    <th className="px-5 py-3.5">Urgency</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-semibold text-primary">
                        {req.reference_id}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        <div>{req.patient_name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Age: {req.patient_age}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        {req.service_required}
                      </td>
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
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenRequest(req)}
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

      {/* Service Request Detail & Assignment Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="card-soft max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-card p-6 sm:p-8 shadow-lift">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">
                    {selectedRequest.reference_id}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] ${getStatusBadge(
                      selectedRequest.status,
                    )}`}
                  >
                    {selectedRequest.status}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] ${getUrgencyBadge(
                      selectedRequest.urgency,
                    )}`}
                  >
                    {selectedRequest.urgency}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                  {selectedRequest.patient_name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Patient Age: {selectedRequest.patient_age} yrs • Location: {selectedRequest.city}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseRequest}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Global Assignment Feedback Banner */}
            {assignmentFeedback && (
              <div
                className={`mt-4 flex items-center gap-2 rounded-lg border p-3 text-xs ${
                  assignmentFeedback.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {assignmentFeedback.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{assignmentFeedback.message}</span>
              </div>
            )}

            {/* Content Sections */}
            <div className="mt-6 space-y-6 text-xs sm:text-sm">
              {/* Patient Contact & Demographics */}
              <div>
                <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-xs">
                  <User className="h-3.5 w-3.5 text-teal" />
                  Patient & Contact Details
                </h4>
                <div className="mt-2 grid gap-3 rounded-lg border border-border bg-section p-4 sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Primary Contact</span>
                    <span className="font-mono font-semibold text-foreground">
                      {selectedRequest.contact_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Alternate Contact
                    </span>
                    <span className="font-mono text-foreground">
                      {selectedRequest.alternate_contact_number || "None provided"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Service Address</span>
                    <span className="text-foreground">
                      {selectedRequest.address}, {selectedRequest.city} — {selectedRequest.pincode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service & Equipment Requirements */}
              <div>
                <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-xs">
                  <Wind className="h-3.5 w-3.5 text-teal" />
                  Requested Care & Requirements
                </h4>
                <div className="mt-2 rounded-lg border border-border bg-section p-4 space-y-3">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Primary Service</span>
                    <span className="text-base font-bold text-primary">
                      {selectedRequest.service_required}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Required Equipment
                    </span>
                    {selectedRequest.equipment_required &&
                    selectedRequest.equipment_required.length > 0 ? (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {selectedRequest.equipment_required.map((eq) => (
                          <span
                            key={eq}
                            className="rounded bg-card px-2 py-1 text-xs font-medium border border-border text-foreground"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No equipment specified
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 pt-2 sm:grid-cols-3">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        Preferred Date
                      </span>
                      <span className="text-foreground">
                        {selectedRequest.preferred_date || "Flexible / Immediate"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        Preferred Time
                      </span>
                      <span className="text-foreground">
                        {selectedRequest.preferred_time || "Flexible"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Duration</span>
                      <span className="text-foreground">
                        {selectedRequest.expected_duration || "As advised"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Notes */}
              {selectedRequest.additional_requirements && (
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-muted-foreground text-xs">
                    Additional Clinical Notes
                  </h4>
                  <div className="mt-2 rounded-lg border border-border bg-section p-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                    {selectedRequest.additional_requirements}
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* RESOURCE ASSIGNMENTS SECTION */}
              {/* ================================================================ */}
              <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/80 pb-3">
                  <div>
                    <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary text-xs">
                      <Stethoscope className="h-4 w-4 text-teal" />
                      Resource Assignments
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {assignedProfessionals.length} Healthcare Team Member
                      {assignedProfessionals.length === 1 ? "" : "s"} • {assignedEquipment.length}{" "}
                      Equipment Asset{assignedEquipment.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  {isRequestLocked && (
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded">
                      Assignment locked for {selectedRequest.status} request
                    </span>
                  )}
                </div>

                {/* Sub-section 1: Assigned Healthcare Team */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Users className="h-3.5 w-3.5 text-teal" />
                      Assigned Healthcare Team
                    </h5>
                    <button
                      type="button"
                      disabled={isRequestLocked || loadingAssignments}
                      onClick={handleOpenAssignProfModal}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Assign Professional
                    </button>
                  </div>

                  {loadingAssignments ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : assignedProfessionals.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-center">
                      <p className="text-xs text-muted-foreground">
                        No healthcare professionals assigned.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-2.5">
                      {assignedProfessionals.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border bg-card p-3.5 shadow-2xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-xs">
                                {item.professional?.full_name || "Unknown Professional"}
                              </span>
                              <span className="rounded bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal">
                                {item.professional?.profession}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {item.professional?.qualification} • Phone: {item.professional?.phone}{" "}
                              • City: {item.professional?.city}
                            </p>
                            {item.notes && (
                              <p className="text-[11px] text-muted-foreground italic mt-1">
                                Note: {item.notes}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Assigned on {formatDate(item.assigned_at)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setReleaseConfirmItem({
                                type: "professional",
                                assignmentId: item.id,
                                name: item.professional?.full_name || "Professional",
                              })
                            }
                            className="inline-flex shrink-0 items-center gap-1 self-start sm:self-center rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/15 transition-colors"
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                            Release
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-section 2: Assigned Equipment */}
                <div className="mt-5 space-y-3 pt-4 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <h5 className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Boxes className="h-3.5 w-3.5 text-teal" />
                      Assigned Equipment Assets
                    </h5>
                    <button
                      type="button"
                      disabled={isRequestLocked || loadingAssignments}
                      onClick={handleOpenAssignEquipModal}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Assign Equipment
                    </button>
                  </div>

                  {loadingAssignments ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : assignedEquipment.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-center">
                      <p className="text-xs text-muted-foreground">No equipment assigned.</p>
                    </div>
                  ) : (
                    <div className="grid gap-2.5">
                      {assignedEquipment.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border bg-card p-3.5 shadow-2xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-primary text-xs">
                                {item.equipment?.asset_code}
                              </span>
                              <span className="font-semibold text-foreground text-xs">
                                {item.equipment?.equipment_type?.name || "Equipment"}
                              </span>
                              <span className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                                {item.equipment?.equipment_type?.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Serial: {item.equipment?.serial_number || "—"}
                            </p>
                            {item.notes && (
                              <p className="text-[11px] text-muted-foreground italic mt-1">
                                Note: {item.notes}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Assigned on {formatDate(item.assigned_at)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setReleaseConfirmItem({
                                type: "equipment",
                                assignmentId: item.id,
                                name: item.equipment?.asset_code || "Equipment Asset",
                              })
                            }
                            className="inline-flex shrink-0 items-center gap-1 self-start sm:self-center rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/15 transition-colors"
                          >
                            <Package className="h-3.5 w-3.5" />
                            Release Asset
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Management */}
              <div>
                <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal" />
                  Workflow Status Management
                </h4>
                <div className="mt-2 rounded-lg border border-border bg-section p-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Received Date</span>
                      <span className="font-medium text-foreground">
                        {formatDate(selectedRequest.created_at)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        Current Status
                      </span>
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] ${getStatusBadge(
                          selectedRequest.status,
                        )}`}
                      >
                        {selectedRequest.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px] mb-2">
                      Update Status
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((opt) => {
                        const isCurrent = selectedRequest.status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={isCurrent || updatingStatus}
                            onClick={() => handleStatusUpdate(selectedRequest.id, opt.value)}
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

              {/* ================================================================ */}
              {/* ACTIVITY TIMELINE SECTION */}
              {/* ================================================================ */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-xs">
                    <History className="h-3.5 w-3.5 text-teal" />
                    Activity Timeline
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    {activities.length} {activities.length === 1 ? "event" : "events"} recorded
                  </span>
                </div>

                <div className="mt-2 rounded-lg border border-border bg-section p-4">
                  {loadingActivities ? (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : activities.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-2">
                      No activity recorded yet.
                    </p>
                  ) : (
                    <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                      {activities.map((act) => {
                        const {
                          icon: Icon,
                          badgeColor,
                          title,
                        } = getActivityEventMeta(act.event_type);
                        return (
                          <div key={act.id} className="relative group">
                            {/* Dot Icon */}
                            <div
                              className={`absolute -left-6 top-1 grid h-5 w-5 place-items-center rounded-full ${badgeColor} shadow-2xs`}
                            >
                              <Icon className="h-3 w-3" />
                            </div>

                            {/* Event Card */}
                            <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <span className="text-xs font-bold text-foreground">{title}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {formatDate(act.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-foreground mt-1 font-medium">
                                {act.description}
                              </p>
                              <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {act.actor_user_id ? "Admin" : "Submitted via Website"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end border-t border-border pt-4">
              <button
                type="button"
                onClick={handleCloseRequest}
                className="rounded-lg border border-border bg-card px-5 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ASSIGN HEALTHCARE PROFESSIONAL */}
      {/* ==================================================================== */}
      {isAssignProfModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="card-soft max-h-[90vh] w-full max-w-lg overflow-y-auto bg-card p-6 sm:p-7 shadow-lift">
            <div className="flex items-start justify-between border-b border-border pb-3.5">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Assign Healthcare Professional
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select a verified candidate to deploy for {selectedRequest?.patient_name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignProfModalOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAssignProfessional} className="mt-5 space-y-4">
              {profAssignError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{profAssignError}</span>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={profSearch}
                  onChange={(e) => setProfSearch(e.target.value)}
                  placeholder="Filter verified professionals by name, role, city..."
                  className="flex h-9 w-full rounded-md border border-input bg-card pl-8 pr-3 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* Selector List */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Select Verified Professional <span className="text-destructive">*</span>
                </label>

                {loadingEligibleProfs ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredEligibleProfs.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    {eligibleProfessionals.length === 0
                      ? "No verified healthcare professionals are currently available to assign. Please verify candidate registrations first."
                      : "No verified professionals matched your search."}
                  </div>
                ) : (
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {filteredEligibleProfs.map((prof) => {
                      const isSelected = selectedProfId === prof.id;
                      return (
                        <div
                          key={prof.id}
                          onClick={() => setSelectedProfId(prof.id)}
                          className={`cursor-pointer rounded-lg border p-3 text-xs transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-xs"
                              : "border-border bg-card hover:bg-secondary/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{prof.full_name}</span>
                            <span className="rounded bg-teal/15 px-2 py-0.5 text-[10px] font-semibold text-teal">
                              {prof.profession}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {prof.qualification} • {prof.city} ({prof.areas_served})
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                            Phone: {prof.phone}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Assignment Notes */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Assignment Instructions & Role{" "}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <textarea
                  value={profNotes}
                  onChange={(e) => setProfNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g., Primary 12-hour night shift critical care nursing."
                  className="flex w-full rounded-md border border-input bg-card p-2.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsAssignProfModalOpen(false)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedProfId || submittingProfAssign}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy disabled:opacity-50"
                >
                  {submittingProfAssign && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ASSIGN EQUIPMENT ASSET */}
      {/* ==================================================================== */}
      {isAssignEquipModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="card-soft max-h-[90vh] w-full max-w-lg overflow-y-auto bg-card p-6 sm:p-7 shadow-lift">
            <div className="flex items-start justify-between border-b border-border pb-3.5">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Assign Equipment Asset
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select an available physical device to dispatch for{" "}
                  {selectedRequest?.patient_name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignEquipModalOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAssignEquipment} className="mt-5 space-y-4">
              {equipAssignError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{equipAssignError}</span>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={equipSearch}
                  onChange={(e) => setEquipSearch(e.target.value)}
                  placeholder="Search available equipment by asset code, model..."
                  className="flex h-9 w-full rounded-md border border-input bg-card pl-8 pr-3 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* Selector List */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Select Available Asset <span className="text-destructive">*</span>
                </label>

                {loadingEligibleEquip ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredEligibleEquip.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    {eligibleEquipment.length === 0
                      ? "No physical equipment assets are currently available in inventory."
                      : "No available equipment assets matched your search."}
                  </div>
                ) : (
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {filteredEligibleEquip.map((item) => {
                      const isSelected = selectedAssetId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedAssetId(item.id)}
                          className={`cursor-pointer rounded-lg border p-3 text-xs transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-xs"
                              : "border-border bg-card hover:bg-secondary/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-primary">
                              {item.asset_code}
                            </span>
                            <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Available
                            </span>
                          </div>
                          <p className="font-semibold text-foreground mt-0.5">
                            {item.equipment_type?.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Category: {item.equipment_type?.category} • Serial:{" "}
                            {item.serial_number || "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Assignment Notes */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Asset Deployment Notes{" "}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <textarea
                  value={equipNotes}
                  onChange={(e) => setEquipNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g., Includes 1x humidifier bottle, 2x nasal cannula tubing."
                  className="flex w-full rounded-md border border-input bg-card p-2.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsAssignEquipModalOpen(false)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedAssetId || submittingEquipAssign}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy disabled:opacity-50"
                >
                  {submittingEquipAssign && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: RELEASE CONFIRMATION */}
      {/* ==================================================================== */}
      {releaseConfirmItem && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="card-soft w-full max-w-md bg-card p-6 shadow-lift text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-500/15 text-amber-700">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h3 className="mt-4 font-display text-base font-bold text-foreground">
              Release {releaseConfirmItem.type === "professional" ? "Professional" : "Equipment"}?
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to release{" "}
              <strong className="text-foreground">{releaseConfirmItem.name}</strong> from this
              service request?
              {releaseConfirmItem.type === "equipment" &&
                " The equipment asset status will automatically return to 'available' in inventory."}
            </p>

            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                disabled={isReleasing}
                onClick={() => setReleaseConfirmItem(null)}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isReleasing}
                onClick={handleConfirmRelease}
                className="inline-flex items-center gap-2 rounded-lg bg-destructive px-5 py-2 text-xs font-semibold text-destructive-foreground shadow-soft transition-colors hover:bg-destructive/90 disabled:opacity-50"
              >
                {isReleasing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
