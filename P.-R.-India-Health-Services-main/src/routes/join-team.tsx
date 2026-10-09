import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  HeartPulse,
  Home,
  Info,
  Loader2,
  MapPin,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import { PageHero } from "../components/site/PageHero";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export const Route = createFileRoute("/join-team")({
  head: () => ({
    meta: [
      {
        title:
          "Join Our Healthcare Team — Doctors, Nurses, Physiotherapists | P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Connect with a growing network of healthcare professionals supporting patients in home-care environments. Register your professional interest.",
      },
      {
        property: "og:title",
        content: "Join Our Healthcare Team — P. R. India Health Services",
      },
      {
        property: "og:description",
        content:
          "Connect with a growing network of healthcare professionals supporting patients in home-care environments.",
      },
    ],
  }),
  component: JoinTeamPage,
});

const professionalCategories = [
  {
    title: "Doctors",
    icon: Stethoscope,
    description: "MBBS, MD, DM & Specialists for coordinated patient home visits and reviews.",
  },
  {
    title: "Critical Care / ICU Nurses",
    icon: HeartPulse,
    description: "Trained in invasive monitoring, ventilator management and home ICU protocols.",
  },
  {
    title: "Staff Nurses",
    icon: UserCheck,
    description: "Registered nurses for post-operative care, IV therapy and clinical management.",
  },
  {
    title: "Physiotherapists",
    icon: Activity,
    description: "Specialists in neuro, ortho, pulmonary and geriatric home rehabilitation.",
  },
  {
    title: "Trained Attendants / Caretakers",
    icon: Users,
    description: "Assisting patients with daily living, mobility support, hygiene and comfort.",
  },
  {
    title: "Specialized Technicians",
    icon: Wrench,
    description: "Equipment specialists supporting ICU beds, ventilators, and diagnostic monitors.",
  },
] as const;

const professionOptions = [
  "MBBS / MD / DM Doctor",
  "Registered / Staff Nurse",
  "Critical Care / ICU Nurse",
  "Physiotherapist",
  "Attendant / Caretaker",
  "Technician",
  "Other",
] as const;

const experienceOptions = [
  "Less than 1 Year",
  "1 – 3 Years",
  "3 – 5 Years",
  "5 – 10 Years",
  "10+ Years",
] as const;

const availabilityOptions = [
  {
    value: "Full-time",
    label: "Full-time",
    description: "Dedicated 12h / 24h continuous patient shifts or regular assignments.",
  },
  {
    value: "Part-time",
    label: "Part-time",
    description: "Fixed daily or weekly recurring shifts.",
  },
  {
    value: "Visit-based",
    label: "Visit-based",
    description: "Per-visit consultations, evaluations, or procedures.",
  },
  {
    value: "Flexible",
    label: "Flexible / On-call",
    description: "Coordination based on weekly mutual availability.",
  },
] as const;

const serviceCapabilities = [
  "Home ICU Patient Monitoring",
  "Ventilator & BiPAP Care",
  "Medication & IV Infusions",
  "Tracheostomy & Suction Care",
  "Wound Dressing & Bed Sore Care",
  "Doctor Consultations & Reviews",
  "Physiotherapy & Mobility Rehab",
  "Elderly & Palliative Care",
  "Medical Equipment Maintenance",
  "Patient Hygiene & Daily Assistance",
] as const;

interface TeamFormData {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  areasServed: string;
  profession: string;
  qualification: string;
  experience: string;
  licenseNumber: string;
  servicesProvided: string[];
  availability: string;
  additionalInfo: string;
  consentAgreed: boolean;
}

interface TeamFormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  city?: string;
  areasServed?: string;
  profession?: string;
  qualification?: string;
  experience?: string;
  availability?: string;
  consentAgreed?: string;
}

const initialFormData: TeamFormData = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  areasServed: "",
  profession: "Critical Care / ICU Nurse",
  qualification: "",
  experience: "1 – 3 Years",
  licenseNumber: "",
  servicesProvided: ["Home ICU Patient Monitoring"],
  availability: "Flexible",
  additionalInfo: "",
  consentAgreed: false,
};

function JoinTeamPage() {
  const [formData, setFormData] = useState<TeamFormData>(initialFormData);
  const [errors, setErrors] = useState<TeamFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState("");

  const validatePhone = (num: string) => {
    const cleaned = num.replace(/[\s-+]/g, "");
    return cleaned.length >= 10 && /^\d+$/.test(cleaned);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleServiceToggle = (item: string) => {
    setFormData((prev) => {
      const exists = prev.servicesProvided.includes(item);
      return {
        ...prev,
        servicesProvided: exists
          ? prev.servicesProvided.filter((s) => s !== item)
          : [...prev.servicesProvided, item],
      };
    });
  };

  const validate = (): boolean => {
    const newErrors: TeamFormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!formData.areasServed.trim()) {
      newErrors.areasServed = "Preferred areas or localities served are required.";
    }

    if (!formData.profession) {
      newErrors.profession = "Please select your profession.";
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = "Highest qualification / degree is required.";
    }

    if (!formData.experience) {
      newErrors.experience = "Please select your years of experience.";
    }

    if (!formData.availability) {
      newErrors.availability = "Please specify your availability.";
    }

    if (!formData.consentAgreed) {
      newErrors.consentAgreed = "You must agree to the professional registration terms.";
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

    const genId = `PR-PRO-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from("team_registrations").insert({
          application_id: genId,
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          city: formData.city.trim(),
          areas_served: formData.areasServed.trim(),
          profession: formData.profession,
          qualification: formData.qualification.trim(),
          experience: formData.experience,
          license_number: formData.licenseNumber.trim() || null,
          services_provided: formData.servicesProvided,
          availability: formData.availability,
          additional_info: formData.additionalInfo.trim() || null,
          verification_status: "pending",
        });

        if (error) {
          console.error("Supabase insert error:", error.message || "Unknown error");
          setSubmitError(
            "We couldn't submit your registration right now. Please try again or contact our team directly.",
          );
          setIsSubmitting(false);
          return;
        }
      }

      setApplicationId(genId);
      setIsSubmitting(false);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(
        "Registration exception:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setSubmitError(
        "We couldn't submit your registration right now. Please try again or contact our team directly.",
      );
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setSubmitError(null);
    setIsSubmitted(false);
    setApplicationId("");
  };

  return (
    <>
      <PageHero eyebrow="JOIN OUR HEALTHCARE NETWORK" title="Join Our Healthcare Team">
        <p>
          Connect with a growing network of healthcare professionals supporting patients in
          home-care environments.
        </p>
      </PageHero>

      {/* Professional Categories Section */}
      <section className="container-site pt-12 sm:pt-16">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">PROFESSIONAL PROFILES</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
            Who We Collaborate With
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We partner with dedicated clinical and care practitioners across specialties to provide
            coordinated care at home.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professionalCategories.map((cat) => (
            <div key={cat.title} className="card-soft p-5 flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <cat.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">{cat.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="container-site py-12 sm:py-16">
        {isSubmitted ? (
          <div className="card-soft mx-auto max-w-2xl p-8 sm:p-12 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal/15 text-teal">
              <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
            </div>

            <h2 className="mt-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Registration Received
            </h2>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-primary">
              <span>Application ID:</span>
              <span className="font-mono">{applicationId}</span>
            </div>

            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Thank you for your interest in joining our healthcare network. Our team will review
              your information and contact you regarding the next steps.
            </p>

            <div className="mt-6 rounded-xl border border-border bg-section p-4 text-left text-xs text-muted-foreground space-y-1.5">
              <p>
                <strong className="text-foreground">Candidate:</strong> {formData.fullName}
              </p>
              <p>
                <strong className="text-foreground">Profession:</strong> {formData.profession} (
                {formData.qualification})
              </p>
              <p>
                <strong className="text-foreground">Location:</strong> {formData.city} (
                {formData.areasServed})
              </p>
              <p>
                <strong className="text-foreground">Availability:</strong> {formData.availability}
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
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Register another profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-3xl space-y-8">
            {/* 1. Personal Information */}
            <div className="card-soft p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary font-bold text-sm">
                  1
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Personal Information
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Your contact information and location coverage.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    aria-invalid={Boolean(errors.fullName)}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Dr. Priya Sharma / Nurse Anjali Roy"
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {errors.fullName && (
                    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    aria-invalid={Boolean(errors.phone)}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    aria-invalid={Boolean(errors.email)}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-foreground">
                    Primary City <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    aria-invalid={Boolean(errors.city)}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. New Delhi / Gurugram"
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
                  <label
                    htmlFor="areasServed"
                    className="block text-sm font-medium text-foreground"
                  >
                    Location / Areas Served <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="areasServed"
                    type="text"
                    required
                    aria-invalid={Boolean(errors.areasServed)}
                    value={formData.areasServed}
                    onChange={(e) => setFormData({ ...formData, areasServed: e.target.value })}
                    placeholder="e.g. South Delhi, Dwarka, Noida"
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {errors.areasServed && (
                    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.areasServed}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Professional Information */}
            <div className="card-soft p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary font-bold text-sm">
                  2
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Professional Information
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Your clinical discipline, qualifications and experience.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Profession <span className="text-destructive">*</span>
                  </label>
                  <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                    {professionOptions.map((prof) => {
                      const isSelected = formData.profession === prof;
                      return (
                        <label
                          key={prof}
                          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm font-medium transition-all ${
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
                            {prof}
                          </span>
                          <input
                            type="radio"
                            name="profession"
                            value={prof}
                            checked={isSelected}
                            onChange={() => setFormData({ ...formData, profession: prof })}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="qualification"
                      className="block text-sm font-medium text-foreground"
                    >
                      Highest Qualification <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="qualification"
                      type="text"
                      required
                      aria-invalid={Boolean(errors.qualification)}
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g. MBBS, MD, B.Sc Nursing, GNM, BPT"
                      className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    {errors.qualification && (
                      <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.qualification}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="experience"
                      className="block text-sm font-medium text-foreground"
                    >
                      Years of Experience <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {experienceOptions.map((exp) => (
                        <option key={exp} value={exp}>
                          {exp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="licenseNumber"
                      className="block text-sm font-medium text-foreground"
                    >
                      Registration / License Number{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        (Where applicable: State Medical / Nursing / Physiotherapy Council)
                      </span>
                    </label>
                    <input
                      id="licenseNumber"
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      placeholder="e.g. DMC/R/12345 or State Nursing Council ID"
                      className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Services You Can Provide */}
            <div className="card-soft p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary font-bold text-sm">
                  3
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Services You Can Provide
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Select procedures, care domains and clinical skills you have expertise in.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {serviceCapabilities.map((item) => {
                  const isChecked = formData.servicesProvided.includes(item);
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
                        onChange={() => handleServiceToggle(item)}
                        className="h-4 w-4 rounded border-border text-teal focus:ring-teal"
                      />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Availability */}
            <div className="card-soft p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary font-bold text-sm">
                  4
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Availability Preference <span className="text-destructive">*</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Choose the engagement model that best matches your schedule.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {availabilityOptions.map((opt) => {
                  const isSelected = formData.availability === opt.value;
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
                        name="availability"
                        value={opt.value}
                        checked={isSelected}
                        onChange={() => setFormData({ ...formData, availability: opt.value })}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 5. Additional Information */}
            <div className="card-soft p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary font-bold text-sm">
                  5
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Additional Information
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Hospital affiliations, ICU certifications, preferred work shifts or notes.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="additionalInfo"
                  className="block text-sm font-medium text-foreground"
                >
                  Clinical Summary & Experience Notes
                </label>
                <textarea
                  id="additionalInfo"
                  rows={4}
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="e.g. 4 years of ICU nursing experience in tertiary care hospital, certified in ACLS/BLS, available for night shifts..."
                  className="mt-1.5 flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* 6. Professional Consent */}
            <div className="rounded-xl border border-border bg-section p-6 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-teal mt-0.5" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Professional Notice:</strong> Submitting this
                  registration does not guarantee acceptance, employment, work allocation or service
                  engagement. Professional credentials and suitability may be reviewed before
                  participation in the healthcare network.
                </p>
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
                    I agree to the professional registration terms and consent to credential
                    verification. <span className="text-destructive">*</span>
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
                    Submitting Registration...
                  </>
                ) : (
                  <>
                    Submit Registration
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}
