import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BedDouble,
  CheckCircle2,
  Clock,
  HeartPulse,
  Home,
  Info,
  Loader2,
  PhoneCall,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import { PageHero } from "../components/site/PageHero";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export const Route = createFileRoute("/request-service")({
  head: () => ({
    meta: [
      {
        title:
          "Request a Healthcare Service — Home ICU, Nursing, Medical Equipment | P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Submit your healthcare service requirement for home ICU setup, critical care nursing, doctor home visits, attendant care, physiotherapy, or medical equipment.",
      },
      {
        property: "og:title",
        content: "Request a Healthcare Service — P. R. India Health Services",
      },
      {
        property: "og:description",
        content:
          "Tell us what support you need. Our team will review your requirements and contact you regarding availability and next steps.",
      },
    ],
  }),
  component: RequestServicePage,
});

const serviceOptions = [
  "Home ICU Setup",
  "Critical Care Nursing",
  "Nursing Services",
  "Doctor Home Visit",
  "Attendant / Caretaker",
  "Physiotherapy",
  "Medical Equipment",
  "Other",
] as const;

const equipmentOptions = [
  "Motorized ICU Bed",
  "Anti-bedsore Air Mattress",
  "Oxygen Concentrator — 5L",
  "Oxygen Concentrator — 10L",
  "Jumbo Oxygen Cylinder",
  "Ventilator",
  "BiPAP / CPAP",
  "Suction Machine",
  "Nebulizer",
  "Ambu Bag",
  "Multipara Cardiac Monitor",
  "Pulse Oximeter",
  "Infusion Pump",
  "Syringe Pump",
  "Glucometer",
  "Other",
] as const;

const urgencyOptions = [
  {
    value: "Planned",
    label: "Planned",
    description: "Scheduled ahead of hospital discharge or for routine ongoing care.",
  },
  {
    value: "Within 24 Hours",
    label: "Within 24 Hours",
    description: "Setup or service required within the next 24 hours.",
  },
  {
    value: "Urgent",
    label: "Urgent",
    description: "Immediate priority coordination requested based on clinical availability.",
  },
] as const;

interface FormData {
  patientName: string;
  patientAge: string;
  contactNumber: string;
  alternateContactNumber: string;
  address: string;
  city: string;
  pincode: string;
  serviceRequired: string;
  equipmentRequired: string[];
  preferredDate: string;
  preferredTime: string;
  expectedDuration: string;
  urgency: string;
  additionalRequirements: string;
  consentAgreed: boolean;
}

interface FormErrors {
  patientName?: string;
  patientAge?: string;
  contactNumber?: string;
  alternateContactNumber?: string;
  address?: string;
  city?: string;
  pincode?: string;
  serviceRequired?: string;
  urgency?: string;
  consentAgreed?: string;
}

const initialFormData: FormData = {
  patientName: "",
  patientAge: "",
  contactNumber: "",
  alternateContactNumber: "",
  address: "",
  city: "",
  pincode: "",
  serviceRequired: "Home ICU Setup",
  equipmentRequired: [],
  preferredDate: "",
  preferredTime: "Flexible",
  expectedDuration: "1-2 Weeks",
  urgency: "Planned",
  additionalRequirements: "",
  consentAgreed: false,
};

function RequestServicePage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState("");

  const validatePhone = (num: string) => {
    const cleaned = num.replace(/[\s-+]/g, "");
    return cleaned.length >= 10 && /^\d+$/.test(cleaned);
  };

  const validatePincode = (pin: string) => {
    const cleaned = pin.trim();
    return /^\d{6}$/.test(cleaned);
  };

  const handleEquipmentToggle = (item: string) => {
    setFormData((prev) => {
      const exists = prev.equipmentRequired.includes(item);
      return {
        ...prev,
        equipmentRequired: exists
          ? prev.equipmentRequired.filter((eq) => eq !== item)
          : [...prev.equipmentRequired, item],
      };
    });
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = "Patient name is required.";
    }

    if (!formData.patientAge.trim()) {
      newErrors.patientAge = "Age is required.";
    } else {
      const ageNum = parseInt(formData.patientAge, 10);
      if (isNaN(ageNum) || ageNum <= 0 || ageNum > 125) {
        newErrors.patientAge = "Please enter a valid age.";
      }
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required.";
    } else if (!validatePhone(formData.contactNumber)) {
      newErrors.contactNumber = "Please enter a valid 10-digit phone number.";
    }

    if (formData.alternateContactNumber.trim() && !validatePhone(formData.alternateContactNumber)) {
      newErrors.alternateContactNumber = "Please enter a valid 10-digit phone number.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Full address is required.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "PIN code is required.";
    } else if (!validatePincode(formData.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit PIN code.";
    }

    if (!formData.serviceRequired) {
      newErrors.serviceRequired = "Please select the required service.";
    }

    if (!formData.urgency) {
      newErrors.urgency = "Please select the urgency.";
    }

    if (!formData.consentAgreed) {
      newErrors.consentAgreed = "You must acknowledge the medical disclaimer to submit.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      const firstErrorElement = document.querySelector("[aria-invalid='true']");
      firstErrorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const generatedRef = `PR-REQ-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from("service_requests").insert({
          reference_id: generatedRef,
          patient_name: formData.patientName.trim(),
          patient_age: parseInt(formData.patientAge, 10),
          contact_number: formData.contactNumber.trim(),
          alternate_contact_number: formData.alternateContactNumber.trim() || null,
          address: formData.address.trim(),
          city: formData.city.trim(),
          pincode: formData.pincode.trim(),
          service_required: formData.serviceRequired,
          equipment_required: formData.equipmentRequired,
          preferred_date: formData.preferredDate || null,
          preferred_time: formData.preferredTime || null,
          expected_duration: formData.expectedDuration || null,
          urgency: formData.urgency,
          additional_requirements: formData.additionalRequirements.trim() || null,
          status: "pending",
        });

        if (error) {
          console.error("Supabase insert error:", error.message || "Unknown error");
          setSubmitError(
            "We couldn't submit your request right now. Please try again or contact our team directly.",
          );
          setIsSubmitting(false);
          return;
        }
      }

      setReferenceId(generatedRef);
      setIsSubmitting(false);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(
        "Submission exception:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setSubmitError(
        "We couldn't submit your request right now. Please try again or contact our team directly.",
      );
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setSubmitError(null);
    setIsSubmitted(false);
    setReferenceId("");
  };

  return (
    <>
      <PageHero eyebrow="REQUEST HEALTHCARE SUPPORT" title="Request a Healthcare Service">
        <p>
          Tell us what support you need. Our team will review your requirements and contact you
          regarding availability and next steps.
        </p>
      </PageHero>

      <div className="container-site py-12 sm:py-16">
        {isSubmitted ? (
          <div className="card-soft mx-auto max-w-2xl p-8 sm:p-12 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal/15 text-teal">
              <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
            </div>

            <h2 className="mt-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Service Request Submitted
            </h2>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-primary">
              <span>Reference ID:</span>
              <span className="font-mono">{referenceId}</span>
            </div>

            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Thank you. Your service request has been submitted. Our team will review your
              requirements and contact you regarding the next steps.
            </p>

            <div className="mt-6 rounded-xl border border-border bg-section p-4 text-left text-xs text-muted-foreground space-y-1.5">
              <p>
                <strong className="text-foreground">Patient:</strong> {formData.patientName} (Age:{" "}
                {formData.patientAge})
              </p>
              <p>
                <strong className="text-foreground">Primary Service:</strong>{" "}
                {formData.serviceRequired}
              </p>
              <p>
                <strong className="text-foreground">Location:</strong> {formData.city},{" "}
                {formData.pincode}
              </p>
              <p>
                <strong className="text-foreground">Urgency:</strong> {formData.urgency}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <PhoneCall className="h-4 w-4 text-teal" />
                Contact Us
              </Link>
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Submit another request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-3xl space-y-8">
            {/* 1. Patient Information */}
            <div className="card-soft p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary font-bold text-sm">
                  1
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Patient Information
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Primary details of the patient requiring care.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="patientName"
                    className="block text-sm font-medium text-foreground"
                  >
                    Patient Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="patientName"
                    type="text"
                    required
                    aria-invalid={Boolean(errors.patientName)}
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {errors.patientName && (
                    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.patientName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="patientAge" className="block text-sm font-medium text-foreground">
                    Age <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="patientAge"
                    type="number"
                    min="1"
                    max="125"
                    required
                    aria-invalid={Boolean(errors.patientAge)}
                    value={formData.patientAge}
                    onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                    placeholder="e.g. 68"
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {errors.patientAge && (
                    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.patientAge}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contactNumber"
                    className="block text-sm font-medium text-foreground"
                  >
                    Contact Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="contactNumber"
                    type="tel"
                    required
                    aria-invalid={Boolean(errors.contactNumber)}
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {errors.contactNumber && (
                    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.contactNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="alternateContactNumber"
                    className="block text-sm font-medium text-foreground"
                  >
                    Alternate Contact Number{" "}
                    <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <input
                    id="alternateContactNumber"
                    type="tel"
                    aria-invalid={Boolean(errors.alternateContactNumber)}
                    value={formData.alternateContactNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, alternateContactNumber: e.target.value })
                    }
                    placeholder="Secondary contact number"
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {errors.alternateContactNumber && (
                    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.alternateContactNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Location */}
            <div className="card-soft p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary font-bold text-sm">
                  2
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Service Location
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Where the patient care/equipment should be deployed.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-foreground">
                    Full Address (House / Flat / Street / Landmark){" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="address"
                    rows={2}
                    required
                    aria-invalid={Boolean(errors.address)}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter complete residential address..."
                    className="mt-1.5 flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {errors.address && (
                    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-foreground">
                      City <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      aria-invalid={Boolean(errors.city)}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. New Delhi"
                      className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    {errors.city && (
                      <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-foreground">
                      PIN Code <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="pincode"
                      type="text"
                      maxLength={6}
                      required
                      aria-invalid={Boolean(errors.pincode)}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="e.g. 110001"
                      className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    {errors.pincode && (
                      <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Service Required */}
            <div className="card-soft p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary font-bold text-sm">
                  3
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Primary Service Required <span className="text-destructive">*</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Select the main service you are seeking.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {serviceOptions.map((opt) => {
                  const isSelected = formData.serviceRequired === opt;
                  return (
                    <label
                      key={opt}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-3.5 text-sm font-medium transition-all ${
                        isSelected
                          ? "border-primary bg-secondary/80 text-primary font-semibold shadow-xs"
                          : "border-border bg-card text-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`grid h-4 w-4 place-items-center rounded-full border ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/50"
                          }`}
                        >
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        {opt}
                      </span>
                      <input
                        type="radio"
                        name="serviceRequired"
                        value={opt}
                        checked={isSelected}
                        onChange={() => setFormData({ ...formData, serviceRequired: opt })}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
              {errors.serviceRequired && (
                <p className="mt-2 text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.serviceRequired}
                </p>
              )}
            </div>

            {/* 4. Equipment Required */}
            <div className="card-soft p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary font-bold text-sm">
                  4
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Medical Equipment Needed{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Select all that apply)
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Select specific critical-care or monitoring equipment required at home.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {equipmentOptions.map((item) => {
                  const isChecked = formData.equipmentRequired.includes(item);
                  return (
                    <label
                      key={item}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-xs sm:text-sm font-medium transition-all ${
                        isChecked
                          ? "border-teal bg-accent/40 text-foreground font-semibold"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleEquipmentToggle(item)}
                        className="h-4 w-4 rounded border-border text-teal focus:ring-teal"
                      />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 5. Timing & Urgency */}
            <div className="card-soft p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary font-bold text-sm">
                  5
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Timing & Urgency
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Helps our clinical coordination team prioritize deployment.
                  </p>
                </div>
              </div>

              {/* Urgency selection */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-foreground">
                  Urgency Level <span className="text-destructive">*</span>
                </label>
                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                  {urgencyOptions.map((opt) => {
                    const isSelected = formData.urgency === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex cursor-pointer flex-col justify-between rounded-lg border p-3.5 transition-all ${
                          isSelected
                            ? "border-primary bg-secondary/80 text-foreground shadow-xs"
                            : "border-border bg-card text-muted-foreground hover:bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-bold ${
                              isSelected ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span
                            className={`grid h-4 w-4 place-items-center rounded-full border ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/50"
                            }`}
                          >
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {opt.description}
                        </p>
                        <input
                          type="radio"
                          name="urgency"
                          value={opt.value}
                          checked={isSelected}
                          onChange={() => setFormData({ ...formData, urgency: opt.value })}
                          className="sr-only"
                        />
                      </label>
                    );
                  })}
                </div>
                {errors.urgency && (
                  <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.urgency}
                  </p>
                )}
              </div>

              {/* Timing details */}
              <div className="mt-6 grid gap-5 sm:grid-cols-3 border-t border-border pt-6">
                <div>
                  <label
                    htmlFor="preferredDate"
                    className="block text-sm font-medium text-foreground"
                  >
                    Preferred Start Date
                  </label>
                  <input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <label
                    htmlFor="preferredTime"
                    className="block text-sm font-medium text-foreground"
                  >
                    Preferred Time of Day
                  </label>
                  <select
                    id="preferredTime"
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Morning (8 AM – 12 PM)">Morning (8 AM – 12 PM)</option>
                    <option value="Afternoon (12 PM – 4 PM)">Afternoon (12 PM – 4 PM)</option>
                    <option value="Evening (4 PM – 8 PM)">Evening (4 PM – 8 PM)</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="expectedDuration"
                    className="block text-sm font-medium text-foreground"
                  >
                    Expected Duration
                  </label>
                  <select
                    id="expectedDuration"
                    value={formData.expectedDuration}
                    onChange={(e) => setFormData({ ...formData, expectedDuration: e.target.value })}
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="1-3 Days">1 – 3 Days</option>
                    <option value="1-2 Weeks">1 – 2 Weeks</option>
                    <option value="1 Month">1 Month</option>
                    <option value="Ongoing / Long Term">Ongoing / Long Term</option>
                    <option value="As advised by doctor">As advised by doctor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 6. Additional Requirements */}
            <div className="card-soft p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary font-bold text-sm">
                  6
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Additional Clinical Notes & Requirements
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Include medical history, current vitals, doctor’s prescription details or
                    specific care instructions.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="additionalRequirements"
                  className="block text-sm font-medium text-foreground"
                >
                  Clinical Condition & Specific Requirements
                </label>
                <textarea
                  id="additionalRequirements"
                  rows={4}
                  value={formData.additionalRequirements}
                  onChange={(e) =>
                    setFormData({ ...formData, additionalRequirements: e.target.value })
                  }
                  placeholder="e.g. Patient recently discharged after cardiac surgery, requires 24x7 ICU nurse and motorized bed with anti-bedsore mattress..."
                  className="mt-1.5 flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* 7. Consent & Medical Disclaimer */}
            <div className="rounded-xl border border-border bg-section p-6 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-teal mt-0.5" aria-hidden="true" />
                <div className="text-xs leading-relaxed text-muted-foreground space-y-2">
                  <p>
                    <strong className="text-foreground">Medical Disclaimer:</strong> Submitting a
                    service request does not constitute medical advice, diagnosis or treatment and
                    does not guarantee service availability. Clinical suitability and service
                    deployment must be confirmed by qualified healthcare professionals.
                  </p>
                  <p className="text-destructive/90 font-medium">
                    Emergency Advisory: For acute emergency medical situations, please immediately
                    contact your local emergency medical service (e.g. 112 / 108) or visit the
                    nearest hospital emergency room.
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    required
                    aria-invalid={Boolean(errors.consentAgreed)}
                    checked={formData.consentAgreed}
                    onChange={(e) => setFormData({ ...formData, consentAgreed: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-xs sm:text-sm font-medium">
                    I understand that submission of this form is a service inquiry and agree to the
                    medical disclaimer terms above. <span className="text-destructive">*</span>
                  </span>
                </label>
                {errors.consentAgreed && (
                  <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.consentAgreed}
                  </p>
                )}
              </div>
            </div>

            {submitError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <p className="text-xs text-muted-foreground">
                <span className="text-destructive">*</span> Indicates required fields.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy disabled:pointer-events-none disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    Submit Service Request
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
