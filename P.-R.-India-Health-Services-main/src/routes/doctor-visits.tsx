import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileText,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  UserCheck,
} from "lucide-react";

import { PageHero } from "../components/site/PageHero";
import { MedicalNote } from "../components/site/MedicalNote";
import { CTASection } from "../components/site/CTASection";

export const Route = createFileRoute("/doctor-visits")({
  head: () => ({
    meta: [
      {
        title: "Doctor Home Visits & Consultations | P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Doctor home visits and bedside consultations for seniors, bedridden patients, and chronic disease management across India. Comprehensive physical evaluations at home.",
      },
      {
        property: "og:title",
        content: "Doctor Home Visits — P. R. India Health Services",
      },
      {
        property: "og:description",
        content:
          "Experienced general physicians and medical specialists visiting patients at home for thorough clinical assessment and prescription management.",
      },
    ],
  }),
  component: DoctorVisitsPage,
});

const doctorFeatures = [
  {
    icon: Stethoscope,
    title: "Comprehensive Bedside Evaluation",
    description:
      "Detailed clinical examinations including cardiovascular, respiratory, and neurological checks conducted in the relaxed environment of home.",
  },
  {
    icon: FileText,
    title: "Prescription Review & Optimization",
    description:
      "Thorough reconciliation of multiple medications, dosage adjustments, and new electronic prescriptions tailored to current clinical status.",
  },
  {
    icon: Calendar,
    title: "Routine & Follow-Up Visits",
    description:
      "Structured periodic check-ups for chronic illness monitoring, preventing medical complications and avoidable hospital admissions.",
  },
  {
    icon: HeartPulse,
    title: "Post-Hospitalization Review",
    description:
      "Careful evaluation following hospital discharge to check wound healing, monitor recovery trajectory, and adjust recovery plans.",
  },
  {
    icon: Activity,
    title: "Diagnostic Investigation Advice",
    description:
      "Recommending relevant laboratory blood tests, ECG, portable imaging, or specialist referrals based on exam findings.",
  },
  {
    icon: UserCheck,
    title: "Licensed Medical Practitioners",
    description:
      "Verified MBBS and MD doctors registered with state medical councils and experienced in geriatric and home healthcare practice.",
  },
];

const suitabilityCases = [
  "Elderly patients with limited mobility or difficulty traveling to clinics",
  "Post-discharge patients requiring close clinical review during early recovery",
  "Bedridden patients needing routine medical examination and prescription updates",
  "Patients with chronic conditions like Hypertension, Diabetes, COPD, or Stroke",
  "Palliative care patients requiring compassionate symptom relief at home",
  "Families seeking personalized, non-rushed clinical consultations for loved ones",
];

function DoctorVisitsPage() {
  return (
    <>
      <PageHero eyebrow="MEDICAL CONSULTATION AT HOME" title="Doctor Home Visits & Clinical Reviews">
        <p>
          We coordinate qualified, empathetic physicians for home visits, delivering thorough medical
          assessments, medication reviews, and ongoing health guidance without the stress of clinic commutes.
        </p>
      </PageHero>

      {/* Overview Section */}
      <section className="container-site py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Quality Physician Care in the Comfort of Home
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Traveling to hospitals and waiting in crowded clinics can be exhausting and stressful—especially
              for elderly, mobility-impaired, or recovering patients. Our doctor home visit service bridges this
              gap by bringing experienced medical doctors directly to your doorstep.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Our visiting doctors take unhurried time to review complete medical records, examine the patient,
              answer family queries, and coordinate with ongoing nursing care.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/request-service"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
              >
                Schedule Doctor Visit
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

          <div className="card-soft p-8 bg-card border border-border space-y-6">
            <h3 className="font-display text-xl font-bold text-foreground">
              Scope of Doctor Home Visit
            </h3>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Physical examination and vital sign verification at the bedside</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Assessment of acute symptoms or chronic disease stability</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Reviewing and adjusting pharmaceutical regimens and dosages</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Ordering home blood samples, urinalysis, or portable diagnostics</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Guiding family caregivers on nutritional and mobility precautions</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Providing a written clinical consultation report and prescription</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-section py-16 sm:py-20">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">CLINICAL SERVICES</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Comprehensive In-Home Medical Support
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Bridging professional medical attention with personal, compassionate patient care.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctorFeatures.map((feat) => (
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

      {/* Clinical Indications */}
      <section className="container-site py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-4">
            <p className="eyebrow">WHO BENEFITS MOST?</p>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Tailored For Those Who Need Care at Home
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Doctor home visits eliminate the physical barrier to regular medical oversight, ensuring that
              patients receive prompt, uncompromised attention.
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
                  Verified Medical Governance
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                All visiting physicians are thoroughly credentialed. In cases of acute life-threatening emergencies,
                emergency medical transport is promptly advised.
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
