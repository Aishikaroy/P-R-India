import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Syringe,
  UserCheck,
} from "lucide-react";

import { PageHero } from "../components/site/PageHero";
import { MedicalNote } from "../components/site/MedicalNote";
import { CTASection } from "../components/site/CTASection";

export const Route = createFileRoute("/nursing-services")({
  head: () => ({
    meta: [
      {
        title: "Home Nursing Services — ICU & Skilled Nurses | P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Professional home nursing services across India: 12-hour and 24-hour critical care ICU nurses, injection administration, wound dressings, and post-operative home care.",
      },
      {
        property: "og:title",
        content: "Home Nursing Services — P. R. India Health Services",
      },
      {
        property: "og:description",
        content:
          "Verified ICU and general duty nursing professionals for continuous bedside care, post-surgical recovery, and palliative support at home.",
      },
    ],
  }),
  component: NursingServicesPage,
});

const nursingFeatures = [
  {
    icon: HeartPulse,
    title: "Critical Care (ICU) Nursing",
    description:
      "Specially trained ICU nurses experienced in tracheostomy care, mechanical ventilator management, invasive line monitoring, and continuous vital signs surveillance.",
  },
  {
    icon: Clock,
    title: "12-Hour & 24-Hour Shifts",
    description:
      "Flexible daytime, overnight, or round-the-clock 24/7 nursing schedules structured according to patient dependency and clinical requirements.",
  },
  {
    icon: Syringe,
    title: "Medication & Infusion Therapy",
    description:
      "Safe intravenous (IV), intramuscular (IM), and subcutaneous medication administration, fluid hydration, and automated syringe pump monitoring.",
  },
  {
    icon: Activity,
    title: "Post-Operative Surgical Care",
    description:
      "Sterile dressing changes, surgical drain monitoring, pain assessment, suture care, and early mobility assistance following discharge.",
  },
  {
    icon: Stethoscope,
    title: "Catheter & Tube Management",
    description:
      "Expert management and maintenance of Foley catheters, Ryle's tube / PEG feeding, central venous lines, and colostomy bags.",
  },
  {
    icon: UserCheck,
    title: "Licensed & Verified Professionals",
    description:
      "All nursing staff undergo comprehensive background checks, verification of state nursing council credentials, and skill assessments.",
  },
];

const suitabilityCases = [
  "Patients requiring close monitoring following intensive care discharge",
  "Post-surgical recovery requiring daily sterile wound care and IV medications",
  "Elderly patients with multi-organ comorbidities and complex medication routines",
  "Tracheostomy or gastrostomy feeding dependency requiring sterile protocols",
  "Cancer and palliative care patients requiring dignified pain and comfort support",
  "Rehabilitation and bedridden patients at risk for bedsores and infections",
];

function NursingServicesPage() {
  return (
    <>
      <PageHero eyebrow="CLINICAL CARE AT HOME" title="Professional Home Nursing Services">
        <p>
          We coordinate verified, experienced critical care and general nurses to provide compassionate,
          hospital-standard clinical care in the privacy and comfort of your home.
        </p>
      </PageHero>

      {/* Overview Section */}
      <section className="container-site py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Skilled Clinical Nursing Around the Clock
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Recovering from major surgery, managing chronic illnesses, or caring for a high-dependency
              family member can be overwhelming. Our home nursing services connect you with verified,
              compassionate nurses who follow doctor-prescribed clinical protocols closely.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              From continuous 24/7 ICU bedside monitoring to dedicated daily shifts for medication and
              wound care, we tailor every nursing assignment to your family's exact needs.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/request-service"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
              >
                Request Nursing Care
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
              What Our Nurses Assist With
            </h3>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Vital signs recording (Blood pressure, pulse, SpO2, respiratory rate, temperature)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>IV infusion management and doctor-prescribed medication administration</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Sterile surgical wound dressings, bed-sore prevention, and skin care</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Ryle's tube / PEG feeding, Foley catheter insertion and maintenance</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Oxygen administration, BiPAP/CPAP monitoring, and suctioning protocols</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Daily clinical documentation and progress updates to treating physicians</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-section py-16 sm:py-20">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">CARE CAPABILITIES</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Specialized Home Nursing Solutions
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Every patient receives dedicated attention from registered nurses trained in hospital protocols.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {nursingFeatures.map((feat) => (
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
            <p className="eyebrow">WHEN IS NURSING RECOMMENDED?</p>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Appropriate Care When Your Family Needs It Most
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Our clinical nursing team ensures continuous monitoring, decreasing hospital readmission rates
              and providing comfort to families.
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
                  Credentialed & Supervised Nursing
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                All assigned nurses are verified against professional council registries and work under
                physician guidance. Clinical care plans are maintained and updated on every shift.
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
