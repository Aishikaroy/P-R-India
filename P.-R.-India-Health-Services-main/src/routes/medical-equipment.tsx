import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BedDouble,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  Truck,
  Wind,
  Wrench,
} from "lucide-react";

import homeIcuImage from "../assets/home-icu.jpg";
import { PageHero } from "../components/site/PageHero";
import { MedicalNote } from "../components/site/MedicalNote";
import { CTASection } from "../components/site/CTASection";

export const Route = createFileRoute("/medical-equipment")({
  head: () => ({
    meta: [
      {
        title: "Medical Equipment Rental & Home Setup | P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Rent and setup hospital-grade medical equipment at home across India: motorized ICU beds, oxygen concentrators, ventilators, BiPAP/CPAP, multipara cardiac monitors, and syringe pumps.",
      },
      {
        property: "og:title",
        content: "Medical Equipment Rental & Setup — P. R. India Health Services",
      },
      {
        property: "og:description",
        content:
          "Prompt delivery, biomedical calibration, sanitized handling, and technical support for home healthcare and critical care medical equipment.",
      },
    ],
  }),
  component: MedicalEquipmentPage,
});

const equipmentFeatures = [
  {
    icon: Truck,
    title: "Prompt Delivery & Setup",
    description:
      "Timely dispatch and safe door-to-door delivery with skilled technical technicians managing in-room assembly and electrical safety checks.",
  },
  {
    icon: Wrench,
    title: "Biomedical Calibration & Testing",
    description:
      "All medical devices undergo strict multi-point pre-delivery inspections, sensor calibrations, and performance testing before reaching patients.",
  },
  {
    icon: ShieldCheck,
    title: "Clinical Hospital-Grade Sanitization",
    description:
      "Rigorous medical-grade sterilization and decontamination protocols applied between every equipment deployment to prevent cross-contamination.",
  },
  {
    icon: ClipboardList,
    title: "Flexible Rental & Purchase Plans",
    description:
      "Cost-effective weekly and monthly rental tenures or outright purchase options tailored to patient prognosis and recovery timelines.",
  },
  {
    icon: Activity,
    title: "Caregiver Demonstration & Training",
    description:
      "Our biomedical technicians provide clear, step-by-step demonstrations to family members and attendants on safe daily operation and basic troubleshooting.",
  },
  {
    icon: Wind,
    title: "24/7 Technical Breakdown Support",
    description:
      "Immediate assistance and prompt backup unit replacement in the rare event of equipment alarm triggers or operational faults.",
  },
];

const equipmentCategories = [
  {
    title: "Critical Care ICU Beds & Furniture",
    icon: BedDouble,
    items: [
      "3-Function & 5-Function Motorized Electric ICU Beds",
      "Semi-Fowler & Full-Fowler Manual Medical Beds",
      "Anti-Bedsore Alternating Pressure Ripple Air Mattresses",
      "Adjustable Hospital Overbed Food Tables",
      "Heavy-Duty Stainless Steel Saline / IV Stands",
      "Foldable Commode Chairs & Wheelchairs",
    ],
  },
  {
    title: "Respiratory & Oxygen Therapy Systems",
    icon: Wind,
    items: [
      "5 Litre / 10 Litre High-Flow Oxygen Concentrators",
      "Jumbo Type-D (46.7L) Medical Oxygen Cylinders & Regulators",
      "Invasive / Non-Invasive Portable ICU Ventilators",
      "BiPAP & Auto-CPAP Machines with Humidifiers",
      "Electric Medical Suction Machines (Portable & Heavy Duty)",
      "High-Efficiency Compressor Nebulizers",
    ],
  },
  {
    title: "Multipara Vital Monitors & Infusion Systems",
    icon: HeartPulse,
    items: [
      "5-Para & 7-Para Cardiac Vital Signs Patient Monitors (ECG, SpO2, NIBP, Temp)",
      "Precision Volumetric Infusion Pumps",
      "Micro-Dosing Automated Syringe Drivers",
      "Digital Finger Pulse Oximeters & Blood Pressure Monitors",
      "Point-of-Care Blood Glucose Monitoring Kits",
      "Portable Deep Vein Thrombosis (DVT) Compression Pumps",
    ],
  },
];

function MedicalEquipmentPage() {
  return (
    <>
      <PageHero eyebrow="CRITICAL CARE INFRASTRUCTURE" title="Medical Equipment Rental & Setup">
        <p>
          We coordinate hospital-grade critical care equipment rentals and delivery—including ICU beds,
          oxygen concentrators, ventilators, and vital monitors—fully installed and tested in your home.
        </p>
      </PageHero>

      {/* Overview Section */}
      <section className="container-site py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Reliable, Sanitized Medical Technology at Home
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Transitioning a patient home from an ICU or managing chronic respiratory conditions requires
              specialized medical hardware that functions reliably without compromise.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              P. R. India Health Services provides prompt delivery, meticulous on-site assembly, and clear
              instructional demonstrations on all rented equipment, backed by responsive technical support.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/request-service"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
              >
                Request Equipment Rental
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Explore All Services
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src={homeIcuImage}
              alt="Hospital-grade medical equipment including motorized ICU bed, multipara monitor, and oxygen concentrator"
              width={1600}
              height={1008}
              loading="lazy"
              className="aspect-[8/5] w-full rounded-2xl object-cover shadow-soft"
            />
          </div>
        </div>
      </section>

      {/* Equipment Inventory Catalog */}
      <section className="bg-section py-16 sm:py-20">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">EQUIPMENT INVENTORY</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Available Clinical Devices & Setups
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Every unit is thoroughly sterilized, inspected, and calibrated prior to patient delivery.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {equipmentCategories.map((cat) => (
              <div key={cat.title} className="card-soft flex flex-col p-6 bg-card">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
                  <cat.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                  {cat.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground flex-1">
                  {cat.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-teal shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-border">
                  <Link
                    to="/request-service"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-secondary py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    Inquire Availability
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container-site py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">QUALITY & SAFETY</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Why Rent Medical Equipment From Us?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We ensure patient safety, hygiene, and continuous device reliability.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {equipmentFeatures.map((feat) => (
            <div key={feat.title} className="card-soft flex flex-col p-6 bg-card border border-border">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
                <feat.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                {feat.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Clinical Indications */}
      <section className="bg-section py-16 sm:py-20">
        <div className="container-site">
          <div className="card-soft p-6 sm:p-8 bg-card border-l-4 border-l-primary space-y-5 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-teal" />
              <h3 className="font-display text-lg font-bold text-foreground">
                Clinical Suitability Notice
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Equipment requirements (especially high-flow oxygen, ventilators, and infusion pumps) should
              always be confirmed with your treating doctor's prescription. Our biomedical support team
              coordinates with your attending clinical staff during setup.
            </p>
            <MedicalNote />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
