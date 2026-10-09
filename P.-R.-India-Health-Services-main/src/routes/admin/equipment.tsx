import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  Boxes,
  CheckCircle2,
  Edit2,
  Eye,
  Filter,
  Layers,
  Loader2,
  Package,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminLayout } from "../../components/admin/AdminLayout";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import type { Database } from "../../lib/database.types";

type EquipmentType = Database["public"]["Tables"]["equipment_types"]["Row"];
type EquipmentAsset = Database["public"]["Tables"]["equipment_assets"]["Row"];
type AssetStatus = "available" | "assigned" | "maintenance" | "unavailable";

const STANDARD_CATEGORIES = [
  "ICU Setup",
  "Respiratory & Airway Support",
  "Monitoring & Clinical Equipment",
  "Mobility & Patient Care",
  "Diagnostics & General",
];

const ASSET_STATUS_OPTIONS: { value: AssetStatus; label: string; description: string }[] = [
  { value: "available", label: "Available", description: "Ready for assignment" },
  { value: "assigned", label: "Assigned", description: "Currently deployed in service" },
  { value: "maintenance", label: "Maintenance", description: "Under servicing or calibration" },
  { value: "unavailable", label: "Unavailable", description: "Decommissioned or retired" },
];

export const Route = createFileRoute("/admin/equipment")({
  head: () => ({
    meta: [
      {
        title: "Equipment Inventory — Admin Portal | P. R. India Health Services",
      },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
  component: AdminEquipmentPage,
});

function AdminEquipmentPage() {
  const [activeTab, setActiveTab] = useState<"assets" | "types">("assets");

  // Data states
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [assets, setAssets] = useState<EquipmentAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Asset Filters & Search
  const [assetSearch, setAssetSearch] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState("all");
  const [assetStatusFilter, setAssetStatusFilter] = useState("all");
  const [assetCategoryFilter, setAssetCategoryFilter] = useState("all");

  // Type Filters & Search
  const [typeSearch, setTypeSearch] = useState("");
  const [typeCategoryFilter, setTypeCategoryFilter] = useState("all");
  const [typeActiveFilter, setTypeActiveFilter] = useState("all");

  // Asset Modal States
  const [isCreateAssetOpen, setIsCreateAssetOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<EquipmentAsset | null>(null);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);
  const [assetFormError, setAssetFormError] = useState<string | null>(null);
  const [assetFormSuccess, setAssetFormSuccess] = useState<string | null>(null);

  // Asset Form fields
  const [assetTypeId, setAssetTypeId] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [assetSerial, setAssetSerial] = useState("");
  const [assetStatus, setAssetStatus] = useState<AssetStatus>("available");
  const [assetNotes, setAssetNotes] = useState("");

  // Type Modal States
  const [isCreateTypeOpen, setIsCreateTypeOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EquipmentType | null>(null);
  const [isSubmittingType, setIsSubmittingType] = useState(false);
  const [typeFormError, setTypeFormError] = useState<string | null>(null);
  const [typeFormSuccess, setTypeFormSuccess] = useState<string | null>(null);

  // Type Form fields
  const [typeName, setTypeName] = useState("");
  const [typeCategory, setTypeCategory] = useState("ICU Setup");
  const [typeCustomCategory, setTypeCustomCategory] = useState("");
  const [typeDescription, setTypeDescription] = useState("");
  const [typeActive, setTypeActive] = useState(true);

  const fetchData = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [typesRes, assetsRes] = await Promise.all([
        supabase.from("equipment_types").select("*").order("name", { ascending: true }),
        supabase.from("equipment_assets").select("*").order("created_at", { ascending: false }),
      ]);

      if (typesRes.error) throw typesRes.error;
      if (assetsRes.error) throw assetsRes.error;

      setTypes(typesRes.data || []);
      setAssets(assetsRes.data || []);
    } catch (err) {
      console.error(
        "Error loading equipment data:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setError("Failed to fetch equipment records. Please check permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lookup map for Equipment Types
  const typeMap = useMemo(() => {
    const map = new Map<string, EquipmentType>();
    types.forEach((t) => map.set(t.id, t));
    return map;
  }, [types]);

  // Asset counts per type
  const assetCountPerType = useMemo(() => {
    const counts = new Map<string, number>();
    assets.forEach((a) => {
      counts.set(a.equipment_type_id, (counts.get(a.equipment_type_id) || 0) + 1);
    });
    return counts;
  }, [assets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    let list = [...assets];

    if (assetTypeFilter !== "all") {
      list = list.filter((a) => a.equipment_type_id === assetTypeFilter);
    }

    if (assetStatusFilter !== "all") {
      list = list.filter((a) => a.status === assetStatusFilter);
    }

    if (assetCategoryFilter !== "all") {
      list = list.filter((a) => {
        const t = typeMap.get(a.equipment_type_id);
        return t?.category === assetCategoryFilter;
      });
    }

    if (assetSearch.trim()) {
      const q = assetSearch.toLowerCase().trim();
      list = list.filter((a) => {
        const t = typeMap.get(a.equipment_type_id);
        return (
          a.asset_code.toLowerCase().includes(q) ||
          (a.serial_number && a.serial_number.toLowerCase().includes(q)) ||
          (a.notes && a.notes.toLowerCase().includes(q)) ||
          (t?.name && t.name.toLowerCase().includes(q)) ||
          (t?.category && t.category.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [assets, assetTypeFilter, assetStatusFilter, assetCategoryFilter, assetSearch, typeMap]);

  // Filtered Types
  const filteredTypes = useMemo(() => {
    let list = [...types];

    if (typeCategoryFilter !== "all") {
      list = list.filter((t) => t.category === typeCategoryFilter);
    }

    if (typeActiveFilter !== "all") {
      const isActive = typeActiveFilter === "active";
      list = list.filter((t) => t.active === isActive);
    }

    if (typeSearch.trim()) {
      const q = typeSearch.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q),
      );
    }

    return list;
  }, [types, typeCategoryFilter, typeActiveFilter, typeSearch]);

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

  const getAssetStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case "available":
        return "bg-emerald-500/15 text-emerald-700 font-semibold";
      case "assigned":
        return "bg-indigo-500/15 text-indigo-700 font-semibold";
      case "maintenance":
        return "bg-amber-500/15 text-amber-700 font-semibold";
      case "unavailable":
        return "bg-destructive/15 text-destructive font-semibold";
      default:
        return "bg-secondary text-foreground";
    }
  };

  // ----------------------------------------------------------------------------
  // Asset Modal Handlers
  // ----------------------------------------------------------------------------
  const handleOpenCreateAsset = () => {
    const defaultType = types.find((t) => t.active)?.id || types[0]?.id || "";
    setAssetTypeId(defaultType);
    setAssetCode("");
    setAssetSerial("");
    setAssetStatus("available");
    setAssetNotes("");
    setAssetFormError(null);
    setAssetFormSuccess(null);
    setIsCreateAssetOpen(true);
  };

  const handleOpenEditAsset = (asset: EquipmentAsset) => {
    setSelectedAsset(asset);
    setAssetTypeId(asset.equipment_type_id);
    setAssetCode(asset.asset_code);
    setAssetSerial(asset.serial_number || "");
    setAssetStatus(asset.status);
    setAssetNotes(asset.notes || "");
    setAssetFormError(null);
    setAssetFormSuccess(null);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return;

    const trimmedCode = assetCode.trim().toUpperCase();
    if (!trimmedCode) {
      setAssetFormError("Asset Code is required.");
      return;
    }

    if (!assetTypeId) {
      setAssetFormError("Please select an Equipment Type.");
      return;
    }

    setIsSubmittingAsset(true);
    setAssetFormError(null);
    setAssetFormSuccess(null);

    try {
      if (selectedAsset) {
        // Update existing asset
        const { error: updateErr } = await supabase
          .from("equipment_assets")
          .update({
            equipment_type_id: assetTypeId,
            asset_code: trimmedCode,
            serial_number: assetSerial.trim() || null,
            status: assetStatus,
            notes: assetNotes.trim() || null,
            updated_at: new Date().toISOString(),
          } as Database["public"]["Tables"]["equipment_assets"]["Update"])
          .eq("id", selectedAsset.id);

        if (updateErr) {
          if (updateErr.code === "23505") {
            throw new Error(
              "An asset with this Asset Code already exists. Please choose a unique code.",
            );
          }
          throw updateErr;
        }

        const updated: EquipmentAsset = {
          ...selectedAsset,
          equipment_type_id: assetTypeId,
          asset_code: trimmedCode,
          serial_number: assetSerial.trim() || null,
          status: assetStatus,
          notes: assetNotes.trim() || null,
          updated_at: new Date().toISOString(),
        };

        setAssets((prev) => prev.map((a) => (a.id === selectedAsset.id ? updated : a)));
        setSelectedAsset(updated);
        setAssetFormSuccess("Asset updated successfully.");
        setTimeout(() => setAssetFormSuccess(null), 3000);
      } else {
        // Create new asset
        const { data: newRow, error: insertErr } = await supabase
          .from("equipment_assets")
          .insert({
            equipment_type_id: assetTypeId,
            asset_code: trimmedCode,
            serial_number: assetSerial.trim() || null,
            status: assetStatus,
            notes: assetNotes.trim() || null,
          } as Database["public"]["Tables"]["equipment_assets"]["Insert"])
          .select()
          .single();

        if (insertErr) {
          if (insertErr.code === "23505") {
            throw new Error(
              "An asset with this Asset Code already exists. Please choose a unique code.",
            );
          }
          throw insertErr;
        }

        if (newRow) {
          setAssets((prev) => [newRow, ...prev]);
        }
        setIsCreateAssetOpen(false);
      }
    } catch (err: unknown) {
      console.error(
        "Error saving asset:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      const message =
        err instanceof Error ? err.message : "Failed to save asset. Please try again.";
      setAssetFormError(message);
    } finally {
      setIsSubmittingAsset(false);
    }
  };

  // ----------------------------------------------------------------------------
  // Type Modal Handlers
  // ----------------------------------------------------------------------------
  const handleOpenCreateType = () => {
    setTypeName("");
    setTypeCategory("ICU Setup");
    setTypeCustomCategory("");
    setTypeDescription("");
    setTypeActive(true);
    setTypeFormError(null);
    setTypeFormSuccess(null);
    setIsCreateTypeOpen(true);
  };

  const handleOpenEditType = (t: EquipmentType) => {
    setSelectedType(t);
    setTypeName(t.name);
    if (STANDARD_CATEGORIES.includes(t.category)) {
      setTypeCategory(t.category);
      setTypeCustomCategory("");
    } else {
      setTypeCategory("Other");
      setTypeCustomCategory(t.category);
    }
    setTypeDescription(t.description || "");
    setTypeActive(t.active);
    setTypeFormError(null);
    setTypeFormSuccess(null);
  };

  const handleToggleTypeActive = async (t: EquipmentType) => {
    if (!isSupabaseConfigured) return;
    const nextState = !t.active;

    try {
      const { error: updateErr } = await supabase
        .from("equipment_types")
        .update({
          active: nextState,
          updated_at: new Date().toISOString(),
        } as Database["public"]["Tables"]["equipment_types"]["Update"])
        .eq("id", t.id);

      if (updateErr) throw updateErr;

      setTypes((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, active: nextState } : item)),
      );
    } catch (err) {
      console.error(
        "Error toggling active state:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setError("Unable to update equipment status. Please try again.");
    }
  };

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return;

    const trimmedName = typeName.trim();
    if (!trimmedName) {
      setTypeFormError("Equipment Type Name is required.");
      return;
    }

    const finalCategory =
      typeCategory === "Other" ? typeCustomCategory.trim() : typeCategory.trim();

    if (!finalCategory) {
      setTypeFormError("Please specify a category.");
      return;
    }

    setIsSubmittingType(true);
    setTypeFormError(null);
    setTypeFormSuccess(null);

    try {
      if (selectedType) {
        // Update type
        const { error: updateErr } = await supabase
          .from("equipment_types")
          .update({
            name: trimmedName,
            category: finalCategory,
            description: typeDescription.trim() || null,
            active: typeActive,
            updated_at: new Date().toISOString(),
          } as Database["public"]["Tables"]["equipment_types"]["Update"])
          .eq("id", selectedType.id);

        if (updateErr) throw updateErr;

        const updated: EquipmentType = {
          ...selectedType,
          name: trimmedName,
          category: finalCategory,
          description: typeDescription.trim() || null,
          active: typeActive,
          updated_at: new Date().toISOString(),
        };

        setTypes((prev) => prev.map((t) => (t.id === selectedType.id ? updated : t)));
        setSelectedType(updated);
        setTypeFormSuccess("Equipment type updated successfully.");
        setTimeout(() => setTypeFormSuccess(null), 3000);
      } else {
        // Create new type
        const { data: newRow, error: insertErr } = await supabase
          .from("equipment_types")
          .insert({
            name: trimmedName,
            category: finalCategory,
            description: typeDescription.trim() || null,
            active: typeActive,
          } as Database["public"]["Tables"]["equipment_types"]["Insert"])
          .select()
          .single();

        if (insertErr) throw insertErr;

        if (newRow) {
          setTypes((prev) => [...prev, newRow]);
        }
        setIsCreateTypeOpen(false);
      }
    } catch (err: unknown) {
      console.error(
        "Error saving equipment type:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      const message =
        err instanceof Error ? err.message : "Failed to save equipment type. Please try again.";
      setTypeFormError(message);
    } finally {
      setIsSubmittingType(false);
    }
  };

  // Summary Metrics
  const assetMetrics = useMemo(() => {
    return {
      total: assets.length,
      available: assets.filter((a) => a.status === "available").length,
      assigned: assets.filter((a) => a.status === "assigned").length,
      maintenance: assets.filter((a) => a.status === "maintenance").length,
      unavailable: assets.filter((a) => a.status === "unavailable").length,
    };
  }, [assets]);

  const typeMetrics = useMemo(() => {
    return {
      total: types.length,
      active: types.filter((t) => t.active).length,
      inactive: types.filter((t) => !t.active).length,
    };
  }, [types]);

  return (
    <AdminLayout title="Equipment Inventory">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Equipment & Resource Inventory
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage medical equipment catalog and track physical asset availability for home-care
              deployments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            {activeTab === "assets" ? (
              <button
                type="button"
                onClick={handleOpenCreateAsset}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Physical Asset
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenCreateType}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Equipment Type
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("assets")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors ${
              activeTab === "assets"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Boxes className="h-4 w-4" />
            Equipment Assets ({assets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("types")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors ${
              activeTab === "types"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            Equipment Types ({types.length})
          </button>
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: EQUIPMENT ASSETS VIEW */}
        {/* ==================================================================== */}
        {activeTab === "assets" && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="card-soft bg-card p-3.5">
                <span className="text-[11px] font-medium text-muted-foreground">Total Assets</span>
                <p className="text-xl font-bold text-foreground">{assetMetrics.total}</p>
              </div>
              <div className="card-soft bg-card p-3.5">
                <span className="text-[11px] font-medium text-emerald-700">Available</span>
                <p className="text-xl font-bold text-emerald-600">{assetMetrics.available}</p>
              </div>
              <div className="card-soft bg-card p-3.5">
                <span className="text-[11px] font-medium text-indigo-700">Assigned</span>
                <p className="text-xl font-bold text-indigo-600">{assetMetrics.assigned}</p>
              </div>
              <div className="card-soft bg-card p-3.5">
                <span className="text-[11px] font-medium text-amber-700">Maintenance</span>
                <p className="text-xl font-bold text-amber-600">{assetMetrics.maintenance}</p>
              </div>
              <div className="card-soft bg-card p-3.5 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-medium text-destructive">Unavailable</span>
                <p className="text-xl font-bold text-destructive">{assetMetrics.unavailable}</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="card-soft p-4 bg-card grid gap-3 sm:grid-cols-12">
              <div className="sm:col-span-5 relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  placeholder="Search asset code, serial no, equipment name..."
                  className="flex h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={assetTypeFilter}
                  onChange={(e) => setAssetTypeFilter(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">All Equipment Types</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <select
                  value={assetStatusFilter}
                  onChange={(e) => setAssetStatusFilter(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <select
                  value={assetCategoryFilter}
                  onChange={(e) => setAssetCategoryFilter(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">All Categories</option>
                  {STANDARD_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assets Table */}
            <div className="card-soft bg-card overflow-hidden shadow-soft">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-16 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-3 text-xs text-muted-foreground">Loading equipment assets...</p>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="p-16 text-center">
                  <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    No equipment assets found
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {assets.length === 0
                      ? "Get started by registering your physical medical devices and equipment assets."
                      : "Try clearing search filters to see other assets."}
                  </p>
                  {assets.length === 0 ? (
                    <button
                      onClick={handleOpenCreateAsset}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add First Asset
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setAssetSearch("");
                        setAssetTypeFilter("all");
                        setAssetStatusFilter("all");
                        setAssetCategoryFilter("all");
                      }}
                      className="mt-3 text-xs text-primary underline-offset-4 hover:underline"
                    >
                      Clear search filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-section text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-5 py-3.5">Asset Code</th>
                        <th className="px-5 py-3.5">Equipment Type</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Serial Number</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Notes</th>
                        <th className="px-5 py-3.5">Registered</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredAssets.map((asset) => {
                        const eqType = typeMap.get(asset.equipment_type_id);
                        return (
                          <tr key={asset.id} className="hover:bg-secondary/40 transition-colors">
                            <td className="px-5 py-3.5 font-mono font-bold text-primary">
                              {asset.asset_code}
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-foreground">
                              {eqType?.name || "Unknown Type"}
                            </td>
                            <td className="px-5 py-3.5 text-muted-foreground">
                              <span className="rounded bg-secondary px-2 py-0.5 text-[10px]">
                                {eqType?.category || "General"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-muted-foreground">
                              {asset.serial_number || "—"}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-block rounded-md px-2 py-0.5 text-[10px] ${getAssetStatusBadge(
                                  asset.status,
                                )}`}
                              >
                                {asset.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-muted-foreground max-w-xs truncate">
                              {asset.notes || "—"}
                            </td>
                            <td className="px-5 py-3.5 text-muted-foreground">
                              {formatDate(asset.created_at)}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenEditAsset(asset)}
                                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-primary hover:bg-secondary"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: EQUIPMENT TYPES VIEW */}
        {/* ==================================================================== */}
        {activeTab === "types" && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card-soft bg-card p-3.5">
                <span className="text-[11px] font-medium text-muted-foreground">Total Types</span>
                <p className="text-xl font-bold text-foreground">{typeMetrics.total}</p>
              </div>
              <div className="card-soft bg-card p-3.5">
                <span className="text-[11px] font-medium text-emerald-700">Active</span>
                <p className="text-xl font-bold text-emerald-600">{typeMetrics.active}</p>
              </div>
              <div className="card-soft bg-card p-3.5">
                <span className="text-[11px] font-medium text-muted-foreground">Inactive</span>
                <p className="text-xl font-bold text-muted-foreground">{typeMetrics.inactive}</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="card-soft p-4 bg-card grid gap-3 sm:grid-cols-12">
              <div className="sm:col-span-6 relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={typeSearch}
                  onChange={(e) => setTypeSearch(e.target.value)}
                  placeholder="Search equipment type name, category, description..."
                  className="flex h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={typeCategoryFilter}
                  onChange={(e) => setTypeCategoryFilter(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">All Categories</option>
                  {STANDARD_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={typeActiveFilter}
                  onChange={(e) => setTypeActiveFilter(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">All Active Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Types Table */}
            <div className="card-soft bg-card overflow-hidden shadow-soft">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-16 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-3 text-xs text-muted-foreground">Loading equipment types...</p>
                </div>
              ) : filteredTypes.length === 0 ? (
                <div className="p-16 text-center">
                  <Layers className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    No equipment types found
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {types.length === 0
                      ? "Create your first equipment type category to classify assets."
                      : "Try clearing search filters."}
                  </p>
                  {types.length === 0 && (
                    <button
                      onClick={handleOpenCreateType}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Equipment Type
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-section text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-5 py-3.5">Name</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Description</th>
                        <th className="px-5 py-3.5">Active</th>
                        <th className="px-5 py-3.5">Total Assets</th>
                        <th className="px-5 py-3.5">Created</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredTypes.map((t) => {
                        const count = assetCountPerType.get(t.id) || 0;
                        return (
                          <tr key={t.id} className="hover:bg-secondary/40 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-foreground">{t.name}</td>
                            <td className="px-5 py-3.5">
                              <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">
                                {t.category}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-muted-foreground max-w-sm truncate">
                              {t.description || "—"}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                  t.active
                                    ? "bg-emerald-500/15 text-emerald-700"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {t.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-primary">
                              {count} {count === 1 ? "asset" : "assets"}
                            </td>
                            <td className="px-5 py-3.5 text-muted-foreground">
                              {formatDate(t.created_at)}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleTypeActive(t)}
                                  title={t.active ? "Deactivate type" : "Activate type"}
                                  className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                                    t.active
                                      ? "border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                      : "border-border text-emerald-700 hover:bg-emerald-500/10"
                                  }`}
                                >
                                  {t.active ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditType(t)}
                                  className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-primary hover:bg-secondary"
                                >
                                  <Edit2 className="h-3 w-3" />
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: CREATE / EDIT PHYSICAL ASSET */}
      {/* ==================================================================== */}
      {(isCreateAssetOpen || selectedAsset) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="card-soft max-h-[90vh] w-full max-w-lg overflow-y-auto bg-card p-6 sm:p-8 shadow-lift">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {selectedAsset ? "Manage Physical Asset" : "Register New Equipment Asset"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedAsset
                    ? `Updating details for asset ${selectedAsset.asset_code}`
                    : "Add an individual medical device to track location and availability."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateAssetOpen(false);
                  setSelectedAsset(null);
                }}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="mt-6 space-y-4">
              {assetFormError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{assetFormError}</span>
                </div>
              )}

              {assetFormSuccess && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{assetFormSuccess}</span>
                </div>
              )}

              {/* Equipment Type */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Equipment Type <span className="text-destructive">*</span>
                </label>
                <select
                  value={assetTypeId}
                  onChange={(e) => setAssetTypeId(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="" disabled>
                    Select equipment model/type
                  </option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category}) {!t.active ? "[Inactive]" : ""}
                    </option>
                  ))}
                </select>
                {types.length === 0 && (
                  <p className="mt-1 text-[11px] text-amber-600">
                    No equipment types created yet. Please create an Equipment Type first.
                  </p>
                )}
              </div>

              {/* Asset Code */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Unique Asset Code <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  placeholder="e.g. OXY-10L-001, VENT-ICU-004"
                  required
                  className="flex h-9 w-full font-mono uppercase rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Internal identifier labeled on the device.
                </p>
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Serial Number{" "}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={assetSerial}
                  onChange={(e) => setAssetSerial(e.target.value)}
                  placeholder="Manufacturer serial no."
                  className="flex h-9 w-full font-mono rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Asset Status <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ASSET_STATUS_OPTIONS.map((opt) => {
                    const isSelected = assetStatus === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAssetStatus(opt.value)}
                        className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                            : "border-border bg-card text-foreground hover:bg-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                          <span className="text-xs font-semibold">{opt.label}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {opt.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Internal Notes & Servicing Info{" "}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <textarea
                  value={assetNotes}
                  onChange={(e) => setAssetNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g., Serviced on 15 Aug, calibrated for pediatric use, includes backup battery pack."
                  className="flex w-full rounded-md border border-input bg-card p-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateAssetOpen(false);
                    setSelectedAsset(null);
                  }}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAsset}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy disabled:opacity-50"
                >
                  {isSubmittingAsset && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {selectedAsset ? "Save Changes" : "Register Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CREATE / EDIT EQUIPMENT TYPE */}
      {/* ==================================================================== */}
      {(isCreateTypeOpen || selectedType) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="card-soft max-h-[90vh] w-full max-w-lg overflow-y-auto bg-card p-6 sm:p-8 shadow-lift">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {selectedType ? "Edit Equipment Type" : "Add Equipment Type Category"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Define equipment models/categories supported by P. R. India Health Services.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateTypeOpen(false);
                  setSelectedType(null);
                }}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveType} className="mt-6 space-y-4">
              {typeFormError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{typeFormError}</span>
                </div>
              )}

              {typeFormSuccess && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{typeFormSuccess}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Equipment Type Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="e.g. Oxygen Concentrator — 10L, ICU Ventilator, Multipara Monitor"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  value={typeCategory}
                  onChange={(e) => setTypeCategory(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {STANDARD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Other">Other / Custom Category</option>
                </select>
              </div>

              {typeCategory === "Other" && (
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Custom Category Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={typeCustomCategory}
                    onChange={(e) => setTypeCustomCategory(e.target.value)}
                    placeholder="e.g. Diagnostic Equipment"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Description & Clinical Specs{" "}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <textarea
                  value={typeDescription}
                  onChange={(e) => setTypeDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief specifications, intended use, accessories required..."
                  className="flex w-full rounded-md border border-input bg-card p-3 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="typeActiveCheck"
                  checked={typeActive}
                  onChange={(e) => setTypeActive(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="typeActiveCheck" className="text-xs font-medium text-foreground">
                  Active (Available for catalog selection and asset registration)
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateTypeOpen(false);
                    setSelectedType(null);
                  }}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingType}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy disabled:opacity-50"
                >
                  {isSubmittingType && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {selectedType ? "Save Changes" : "Create Equipment Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
