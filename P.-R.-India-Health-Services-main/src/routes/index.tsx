import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BedDouble,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  HandHeart,
  HeartPulse,
  Home,
  Phone,
  PhoneCall,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  UsersRound,
  Wind,
  Zap,
} from "lucide-react";
import { useState } from "react";

import heroImage from "../assets/hero-home-care.jpg";
import homeIcuImage from "../assets/home-icu.jpg";
import teamImage from "../assets/healthcare-team.jpg";
import aboutImage from "../assets/about-care.jpg";
import { CTASection } from "../components/site/CTASection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "P. R. India Health Services — Professional Critical Care Services at Home" },
      {
        name: "description",
        content:
          "Coordinated home healthcare services in India: home ICU setup, home nursing services, doctor home visits, physiotherapy and critical care equipment — care coordinated around your needs.",
      },
      {
        property: "og:title",
        content: "P. R. India Health Services — Professional Critical Care Services at Home",
      },
      {
        property: "og:description",
        content:
          "Home ICU setup, home nursing services, doctor home visits and critical care equipment, coordinated around your needs.",
      },
    ],
  }),
  component: Index,
});

const heroServices = [
  {
    id: "home-icu",
    label: "Home ICU Setup",
    icon: BedDouble,
    badge: "Most Requested",
    highlight: "Complete Hospital-Grade ICU Setup at Home",
    description:
      "Motorized 5-function ICU bed, multipara cardiac monitor, ventilator/BiPAP, suction apparatus, syringe pumps & dedicated ICU nurse.",
    eta: "Rapid 2–4 Hours Setup",
    points: [
      "Motorized ICU Bed & Anti-Bedsore Mattress",
      "Ventilator / BiPAP & Oxygen Support",
      "24/7 Certified ICU Critical Care Nurse",
    ],
    serviceValue: "Home ICU Setup",
  },
  {
    id: "nursing",
    label: "24/7 Nursing Care",
    icon: HeartPulse,
    badge: "12h / 24h Shifts",
    highlight: "Certified Critical-Care & Post-Surgical Nurses",
    description:
      "Skilled bedside care for tracheostomy, catheter management, IV infusions, wound dressing, and continuous vital signs charting.",
    eta: "Same-Day Deployment",
    points: [
      "IV Cannulation & Medication Infusion",
      "Tracheostomy & Ryle's Tube Care",
      "Post-Operative & Elderly Bedside Care",
    ],
    serviceValue: "Nursing Services",
  },
  {
    id: "equipment",
    label: "Medical Equipment",
    icon: Wind,
    badge: "Rent / Purchase",
    highlight: "Calibrated & Sanitized Critical-Care Equipment",
    description:
      "Oxygen concentrators (5L/10L), BiPAP/CPAP machines, cardiac monitors, DVT pumps, suction machines delivered with free home installation.",
    eta: "Immediate Dispatch Available",
    points: [
      "Hospital-Grade Sterilization Protocol",
      "Doorstep Delivery & Biomedical Calibration",
      "24/7 Technical On-Call Support",
    ],
    serviceValue: "Medical Equipment",
  },
  {
    id: "doctor",
    label: "Doctor Home Visit",
    icon: Stethoscope,
    badge: "Physician Review",
    highlight: "Comprehensive Clinical Consultation at Home",
    description:
      "Experienced MBBS/MD physicians conduct in-depth clinical evaluations, treatment adjustments, ECG reviews, and eldercare visits.",
    eta: "Scheduled within 24h",
    points: [
      "Detailed Physical Examination & Diagnosis",
      "Treatment & Prescription Adjustments",
      "Diagnostic Lab Test Coordination",
    ],
    serviceValue: "Doctor Visits",
  },
  {
    id: "physio",
    label: "Physiotherapy",
    icon: Activity,
    badge: "Rehabilitation",
    highlight: "Neuro, Ortho & Cardiopulmonary Recovery",
    description:
      "Targeted rehabilitation therapy for stroke recovery, post-joint replacement mobility, chest physiotherapy, and chronic pain management.",
    eta: "Daily / Alternate Sessions",
    points: [
      "Post-Surgery & Fracture Mobility",
      "Neuro & Paralysis Rehabilitation",
      "Chest Physiotherapy for ICU Patients",
    ],
    serviceValue: "Physiotherapy",
  },
];

const services = [
  {
    icon: BedDouble,
    title: "Home ICU Setup",
    description: "Support for creating an appropriate critical-care environment at home.",
  },
  {
    icon: HeartPulse,
    title: "Nursing Services",
    description: "Professional nursing support for home-based patient care.",
  },
  {
    icon: Stethoscope,
    title: "Doctor Visits",
    description:
      "Coordination of doctor visits based on patient requirements and professional availability.",
  },
  {
    icon: HandHeart,
    title: "Attendant & Caregiver Services",
    description: "Trained attendants and caretakers for patient support.",
  },
  {
    icon: Activity,
    title: "Physiotherapy",
    description: "Home-based physiotherapy support where appropriate.",
  },
  {
    icon: ClipboardList,
    title: "Medical Equipment",
    description:
      "Critical-care and monitoring equipment available based on requirement and availability.",
  },
];

const equipmentCategories = [
  {
    title: "ICU Setup",
    items: ["Motorized ICU Bed", "Anti-bedsore Air Mattress", "Saline / IV Stand"],
  },
  {
    title: "Respiratory & Airway Support",
    items: [
      "Oxygen Concentrator — 5L / 10L",
      "Jumbo Oxygen Cylinder",
      "Ventilator",
      "BiPAP / CPAP",
      "Suction Machine",
      "Nebulizer",
      "Ambu Bag",
    ],
  },
  {
    title: "Monitoring & Clinical Equipment",
    items: [
      "Multipara Cardiac Monitor",
      "Pulse Oximeter",
      "Infusion & Syringe Pumps",
      "Glucometer",
      "Stethoscope & BP Apparatus",
      "ABG Machine",
      "Portable X-Ray Machine",
      "Holter Machine",
    ],
  },
];

const professionalRoles = [
  "Registered / Staff Nurses",
  "Trained Attendants / Caretakers",
  "Physiotherapists",
  "MBBS / MD / DM Doctors",
  "Specialized Technicians",
];

const steps = [
  {
    number: "01",
    title: "Tell Us What You Need",
    description: "Submit your healthcare requirement.",
  },
  {
    number: "02",
    title: "We Review Your Request",
    description: "Our team reviews the requirement.",
  },
  {
    number: "03",
    title: "Support Is Coordinated",
    description:
      "Appropriate professionals and/or equipment can be coordinated based on availability and suitability.",
  },
  {
    number: "04",
    title: "Care Begins",
    description: "The agreed service is arranged.",
  },
];

const whyCards = [
  { icon: UsersRound, title: "Professional Healthcare Network" },
  { icon: Home, title: "Home-Based Care Support" },
  { icon: BedDouble, title: "Critical-Care Equipment" },
  { icon: Stethoscope, title: "Multiple Healthcare Disciplines" },
  { icon: HandHeart, title: "Patient & Family Focus" },
  { icon: ClipboardList, title: "Coordinated Service Requests" },
];

function Index() {
  const [activeServiceId, setActiveServiceId] = useState<string>("home-icu");
  const currentService = heroServices.find((s) => s.id === activeServiceId) || heroServices[0]!;

  return (
    <>
      {/* 1. Enhanced Interactive Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-section via-section/80 to-background pt-10 pb-20 sm:pt-16 sm:pb-28">
        {/* Layered Animated Background Orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-teal/20 via-primary/12 to-transparent blur-3xl animate-hero-orb-drift"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/4 -right-32 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-accent/35 via-teal/10 to-transparent blur-3xl animate-hero-orb-drift"
          style={{ animationDelay: "7s" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-20 -z-10 h-[350px] w-[350px] rounded-full bg-gradient-to-tr from-primary/10 via-teal/8 to-transparent blur-3xl animate-hero-orb-drift"
          style={{ animationDelay: "13s" }}
        />

        {/* Decorative Dot Grid Pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="container-site">
          {/* Top Live Emergency Beacon Banner */}
          <div className="animate-hero-fade-in-up hero-delay-1 mb-8 flex flex-wrap items-center justify-between gap-3 rounded-full border border-teal/20 bg-card/70 px-5 py-2.5 text-xs backdrop-blur-xl shadow-soft sm:px-6 sm:py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-teal animate-hero-pulse-ring" />
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal" />
              </span>
              <span className="font-semibold text-foreground">
                24/7 Emergency ICU & Critical Care Coordination Active Across India
              </span>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1 font-bold text-teal transition-all duration-200 hover:text-primary hover:gap-2"
            >
              <span>Instant Coordinator Hotline</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Column: Heading, Interactive Explorer & CTAs */}
            <div className="lg:col-span-7">
              <div className="animate-hero-fade-in-up hero-delay-1 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-secondary/90 to-accent/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-xs backdrop-blur-sm">
                <HeartPulse className="h-3.5 w-3.5 text-teal" />
                <span>Hospital-Grade Home Critical Care</span>
              </div>

              <h1 className="animate-hero-fade-in-up hero-delay-2 mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl sm:leading-[1.12] lg:text-[3.4rem]">
                Professional Critical Care &{" "}
                <span className="bg-gradient-to-r from-primary via-teal to-primary bg-clip-text text-transparent animate-hero-gradient-shift">
                  ICU Support at Home
                </span>
              </h1>

              <p className="animate-hero-fade-in-up hero-delay-3 mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed">
                Bringing hospital-grade medical ICU setups, 24/7 certified critical care nurses, and
                specialized monitoring directly to your home — professionally coordinated around
                your patient's needs.
              </p>

              {/* Interactive Service Selector Pills */}
              <div className="animate-hero-fade-in-up hero-delay-4 mt-8">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select a Care Requirement:
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {heroServices.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeServiceId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveServiceId(item.id)}
                        className={`group relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-300 cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lift scale-[1.04] ring-2 ring-teal/50 ring-offset-2 ring-offset-background"
                            : "border border-border/80 bg-card/80 text-foreground backdrop-blur-sm hover:bg-secondary hover:border-teal/30 hover:shadow-soft"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                            isActive
                              ? "text-teal-foreground"
                              : "text-teal group-hover:text-primary group-hover:scale-110"
                          }`}
                        />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Interactive Service Feature Panel */}
              <div className="animate-hero-fade-in-up hero-delay-5 mt-5 rounded-2xl border border-border/60 bg-gradient-to-br from-card/95 to-card/80 p-5 shadow-soft backdrop-blur-md transition-all duration-500 relative overflow-hidden">
                {/* Gradient accent line on left */}
                <div aria-hidden="true" className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-teal via-primary to-teal" />

                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3 pl-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-teal/20 to-primary/10 text-teal shadow-xs">
                      <currentService.icon className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-sm font-bold text-foreground">
                      {currentService.highlight}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent to-secondary px-3 py-1 text-[11px] font-semibold text-accent-foreground shadow-xs">
                    <Clock className="h-3 w-3 text-teal" />
                    {currentService.eta}
                  </span>
                </div>

                <p className="mt-3 pl-3 text-xs leading-relaxed text-muted-foreground">
                  {currentService.description}
                </p>

                <div className="mt-3.5 grid gap-2.5 pl-3 sm:grid-cols-3">
                  {currentService.points.map((pt) => (
                    <div
                      key={pt}
                      className="flex items-start gap-2 text-xs text-foreground font-medium"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal mt-0.5" />
                      <span className="leading-tight">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="animate-hero-fade-in-up hero-delay-6 mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <Link
                  to="/request-service"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lift transition-all duration-300 hover:bg-navy hover:shadow-lift hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* Shimmer overlay */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-hero-shimmer"
                  />
                  <span className="relative">Request {currentService.label}</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/join-team"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary/80 bg-card/80 px-7 py-3.5 text-base font-semibold text-primary shadow-xs backdrop-blur-sm transition-all duration-300 hover:bg-secondary hover:border-primary hover:shadow-soft"
                >
                  <UsersRound className="h-4 w-4 text-teal transition-transform duration-300 group-hover:scale-110" />
                  <span>Join Healthcare Team</span>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-teal" />
                  No Upfront Registration Fee
                </span>
                <span className="flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-teal" />
                  Immediate Dispatch Available
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-teal" />
                  Dedicated Case Coordinator
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="overflow-hidden rounded-3xl border-2 border-border/80 bg-card p-2 shadow-lift">
                  <img
                    src={heroImage}
                    alt="A compassionate critical care nurse providing specialized home care to an elderly patient"
                    width={1600}
                    height={1104}
                    className="aspect-[4/3] w-full rounded-2xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4 Interactive Trust Indicators Under Hero Grid */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card-soft flex items-center gap-3.5 p-4.5 transition-all duration-200 hover:shadow-soft hover:border-teal/40">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <BedDouble className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-foreground">Hospital-Grade Equipment</h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  Sterilized ventilators, BiPAP & monitors
                </p>
              </div>
            </div>

            <div className="card-soft flex items-center gap-3.5 p-4.5 transition-all duration-200 hover:shadow-soft hover:border-teal/40">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-foreground">Verified Healthcare Staff</h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  License & background-verified clinicians
                </p>
              </div>
            </div>

            <div className="card-soft flex items-center gap-3.5 p-4.5 transition-all duration-200 hover:shadow-soft hover:border-teal/40">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-foreground">Rapid Emergency Setup</h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  Same-day home ICU deployment
                </p>
              </div>
            </div>

            <div className="card-soft flex items-center gap-3.5 p-4.5 transition-all duration-200 hover:shadow-soft hover:border-teal/40">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-foreground">24/7 Clinical Support</h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  Dedicated case manager on call
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Two-audience section */}
      <section className="container-site py-16 sm:py-20">
        <h2 className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl">
          How Can We Help You?
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="card-soft flex flex-col p-8 sm:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
              <UserRound className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Patient / Family
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
              Need Healthcare Support at Home?
            </h3>
            <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">
              Request nursing, doctor visits, attendants, physiotherapy, home ICU support or medical
              equipment.
            </p>
            <Link
              to="/request-service"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-navy"
            >
              Request a Service
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="card-soft flex flex-col p-8 sm:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Stethoscope className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Healthcare Professional
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
              Want to Join Our Healthcare Network?
            </h3>
            <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">
              Doctors, nurses, physiotherapists, attendants and specialized technicians can register
              their professional interest.
            </p>
            <Link
              to="/join-team"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg border border-primary px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
            >
              Join Our Team
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Services */}
      <section className="bg-section">
        <div className="container-site py-16 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Comprehensive Home Healthcare Support
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Healthcare services and critical-care support designed around the needs of patients
              and families.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="card-soft flex flex-col p-6">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
                  <service.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                <Link
                  to="/services"
                  className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-teal"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Home ICU / Equipment */}
      <section className="container-site py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Home ICU Support & Medical Equipment
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              When home-based critical-care support is required, we help coordinate essential
              equipment and professional services based on individual requirements and availability.
            </p>
            <img
              src={homeIcuImage}
              alt="Home ICU setup with motorized hospital bed, cardiac monitor and oxygen equipment"
              width={1600}
              height={1008}
              loading="lazy"
              className="mt-8 aspect-[8/5] w-full rounded-2xl object-cover shadow-soft"
            />
          </div>
          <div className="space-y-6">
            {equipmentCategories.map((category) => (
              <div key={category.title} className="card-soft p-6">
                <h3 className="flex items-center gap-2.5 font-display text-base font-bold text-foreground">
                  <Wind className="h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                  {category.title}
                </h3>
                <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                  {category.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <Link
                to="/request-service"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-navy"
              >
                Request Equipment
              </Link>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Availability and clinical suitability should be confirmed by qualified healthcare
                professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Healthcare team */}
      <section className="bg-section">
        <div className="container-site grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-14">
          <img
            src={teamImage}
            alt="Healthcare team of doctors, nurses and physiotherapists"
            width={1600}
            height={1008}
            loading="lazy"
            className="aspect-[8/5] w-full rounded-2xl object-cover shadow-soft"
          />
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Join Our Healthcare Team
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We work with qualified healthcare professionals to support patients requiring care at
              home.
            </p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {professionalRoles.map((role) => (
                <li
                  key={role}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
                >
                  <HeartPulse className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  {role}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-lg border border-border bg-card p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                Flexible Opportunities
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <li>Flexible coverage</li>
                <li>Part-time / visit-based work</li>
                <li>Doctor visit coordination</li>
              </ul>
            </div>
            <Link
              to="/join-team"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-navy"
            >
              Join Our Healthcare Team
            </Link>
          </div>
        </div>
      </section>

      {/* 6. How it works */}
      <section className="container-site py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            How It Works
          </h2>
        </div>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.number} className="card-soft relative p-6">
              <span className="font-display text-3xl font-bold text-teal">{step.number}</span>
              <h3 className="mt-3 font-display text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          Service availability and clinical suitability are subject to assessment and confirmation.
        </p>
      </section>

      {/* 7. Why choose us */}
      <section className="bg-section">
        <div className="container-site py-16 sm:py-20">
          <h2 className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl">
            Care Coordinated Around Your Needs
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyCards.map((card) => (
              <div key={card.title} className="card-soft flex items-center gap-4 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <card.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="font-display text-base font-bold text-foreground">{card.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. About preview */}
      <section className="container-site py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Healthcare Support With a Human Approach
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              P. R. India Health Services focuses on connecting patients and families with
              appropriate home healthcare support, qualified professionals and medical equipment —
              coordinated with professionalism, responsiveness and a genuinely human approach to
              care.
            </p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-primary px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
            >
              About P. R. India Health Services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <img
            src={aboutImage}
            alt="Doctor on a home visit reviewing notes with an elderly patient"
            width={1600}
            height={1008}
            loading="lazy"
            className="aspect-[8/5] w-full rounded-2xl object-cover shadow-soft"
          />
        </div>
      </section>

      {/* 9. Final CTA */}
      <CTASection />
    </>
  );
}
