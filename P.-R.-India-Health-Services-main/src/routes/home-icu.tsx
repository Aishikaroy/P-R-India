import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BedDouble,
  CheckCircle2,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Wind,
  Wrench,
} from "lucide-react";

import homeIcuImage from "../assets/home-icu.jpg";
import { PageHero } from "../components/site/PageHero";
import { MedicalNote } from "../components/site/MedicalNote";
import { CTASection } from "../components/site/CTASection";

export const Route = createFileRoute("/home-icu")({
  head: () => ({
    meta: [
      {
        title: "Home ICU Setup & Critical Care Services at Home | P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Professional Home ICU setup with motorized beds, ventilators, cardiac monitors, oxygen concentrators, and trained critical care nursing support at home.",
      },
      {
        property: "og:title",
        content: "Home ICU Setup & Critical Care at Home — P. R. India Health Services",
      },
      {
        property: "og:description",
        content:
          "Transforming home environments into safe critical-care units with advanced ICU equipment, monitoring, and trained clinical support.",
      },
    ],
  }),
  component: HomeIcuPage,
});

const icuFeatures = [
  {
    icon: BedDouble,
    title: "Motorized ICU Beds & Mattresses",
    description:
      "Multi-function motorized ICU beds with anti-bedsore alternating pressure air mattresses for optimal patient comfort and pressure injury prevention.",
  },
  {
    icon: Wind,
    title: "Advanced Respiratory Support",
    description:
      "ICU ventilators, BiPAP / CPAP machines, high-capacity oxygen concentrators, jumbo oxygen cylinders, and suction machines.",
  },
  {
    icon: Activity,
    title: "Continuous Multipara Monitoring",
    description:
      "Real-time vital sign monitors tracking ECG, SpO2, NIBP, respiration rate, and temperature for vigilant clinical observation.",
  },
  {
    icon: HeartPulse,
    title: "Precision Infusion & Syringe Pumps",
    description:
      "Automated volumetric infusion pumps and syringe drivers for accurate, timely intravenous medication administration.",
  },
  {
    icon: Stethoscope,
    title: "Critical Care Nursing Support",
    description:
      "Experienced ICU/critical-care nurses trained in tracheostomy management, ventilator care, catheterization, and emergency protocols.",
  },
  {
    icon: Wrench,
    title: "Biomedical & Equipment Support",
    description:
      "Prompt delivery, on-site installation, calibration, and technical support to maintain equipment reliability.",
  },
];

const suitabilityCases = [
  "Post-hospitalization recovery requiring continued close vital monitoring",
  "Patients requiring tracheostomy care, regular suctioning, or mechanical ventilation",
  "Elderly or stroke patients with high nursing dependency and mobility limitations",
  "Palliative and end-of-life comfort care in a peaceful, family home environment",
  "Post-operative surgical patients requiring sterile wound management and IV medications",
  "Long-term chronic respiratory or neurological condition management",
];

function HomeIcuPage() {
  return (
    <>
      <PageHero eyebrow="CRITICAL CARE AT HOME" title="Comprehensive Home ICU Setup & Support">
        <p>
          We coordinate hospital-grade ICU equipment, dedicated critical care nurses, and doctor
          visits to establish a safe, comfortable, and responsive intensive care environment at
          home.
        </p>
      </PageHero>

      {/* Main Overview Section */}
      <section className="container-site py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Bringing Intensive Care Capabilities Home
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Transitioning a critically ill or high-dependency patient from hospital to home
              requires precise medical equipment, skilled nursing protocols, and reliable clinical
              coordination. P. R. India Health Services facilitates complete home ICU infrastructure
              tailored to the patient&apos;s specific medical status.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Our team works closely with treating physicians and families to ensure seamless
              discharge planning, immediate room setup, and continuous clinical care monitoring.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/request-service"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
              >
                Request Home ICU Setup
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
              alt="Home ICU setup with motorized ICU bed, cardiac monitor, and oxygen concentrator"
              width={1600}
              height={1008}
              loading="lazy"
              className="aspect-[8/5] w-full rounded-2xl object-cover shadow-soft"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-section py-16 sm:py-20">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">ICU INFRASTRUCTURE</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Key Components of Home ICU Setup
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Every home ICU setup is configured around the patient&apos;s clinical prescription,
              combining monitoring technology with skilled clinical oversight.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {icuFeatures.map((feat) => (
              <div key={feat.title} className="card-soft flex flex-col p-6 bg-card">
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
        </div>
      </section>

      {/* When is Home ICU Recommended? */}
      <section className="container-site py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-4">
            <p className="eyebrow">CLINICAL INDICATIONS</p>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              When Is Home ICU Setup Recommended?
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Home ICU care provides a clinical alternative to prolonged hospital stays, allowing
              patients to recover in familiar surroundings while reducing hospital-acquired
              infection risks.
            </p>

            <ul className="mt-6 space-y-3">
              {suitabilityCases.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal/15 text-teal mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="card-soft p-6 sm:p-8 bg-card border-l-4 border-l-primary space-y-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-teal" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  Clinical Assessment & Quality Assurance
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Before setup, our clinical coordination team reviews the patient&apos;s discharge
                summary, doctor recommendations, and room environment to verify suitability.
              </p>
              <MedicalNote />
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
