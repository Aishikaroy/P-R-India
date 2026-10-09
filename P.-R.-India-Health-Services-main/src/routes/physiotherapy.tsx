import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  HeartPulse,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react";

import { PageHero } from "../components/site/PageHero";
import { MedicalNote } from "../components/site/MedicalNote";
import { CTASection } from "../components/site/CTASection";

export const Route = createFileRoute("/physiotherapy")({
  head: () => ({
    meta: [
      {
        title: "Home Physiotherapy & Rehabilitation | P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Professional home physiotherapy and rehabilitation services across India. Customized physical therapy for stroke recovery, joint replacement, back pain, and geriatric mobility.",
      },
      {
        property: "og:title",
        content: "Home Physiotherapy — P. R. India Health Services",
      },
      {
        property: "og:description",
        content:
          "Certified physical therapists providing customized one-on-one rehabilitation sessions in the comfort of your home.",
      },
    ],
  }),
  component: PhysiotherapyPage,
});

const physioFeatures = [
  {
    icon: Activity,
    title: "Neuro-Rehabilitation",
    description:
      "Targeted therapy protocols for post-stroke recovery, Parkinson's disease, paralysis, spinal injuries, and peripheral neuropathies to regain motor control.",
  },
  {
    icon: Dumbbell,
    title: "Orthopedic Rehabilitation",
    description:
      "Structured recovery plans following total knee replacement (TKR), hip replacement (THR), fractures, frozen shoulder, and sports injuries.",
  },
  {
    icon: HeartPulse,
    title: "Cardiopulmonary Physiotherapy",
    description:
      "Deep breathing retraining, chest percussion, lung volume expansion, and stamina rebuilding for COPD, post-COVID, and cardiac surgery patients.",
  },
  {
    icon: RotateCcw,
    title: "Geriatric Mobility & Fall Prevention",
    description:
      "Gentle balance training, core strength exercises, and gait correction tailored for seniors to prevent dangerous falls and foster confidence.",
  },
  {
    icon: Zap,
    title: "Pain Management & Modalities",
    description:
      "Electrotherapy (TENS / IFT / Ultrasound therapy), manual muscle release, and therapeutic stretching for chronic back, neck, and joint pain.",
  },
  {
    icon: UserCheck,
    title: "Certified Physical Therapists",
    description:
      "Licensed physiotherapists holding BPT/MPT degrees with clinical expertise in guided, evidence-based home rehabilitation.",
  },
];

const suitabilityCases = [
  "Patients recovering from stroke or brain injury seeking neuro-facilitation",
  "Post-operative joint replacement patients requiring early safe mobilization",
  "Elderly individuals experiencing frequent balance loss, stiffness, or fear of falling",
  "Chronic neck, back, or sciatic pain limiting daily functional independence",
  "Post-ICU recovery patients with generalized muscular weakness and deconditioning",
  "Bedridden patients needing passive range-of-motion exercises to prevent joint contractures",
];

function PhysiotherapyPage() {
  return (
    <>
      <PageHero eyebrow="REHABILITATION AT HOME" title="Home Physiotherapy & Recovery Services">
        <p>
          We coordinate certified physical therapists who bring evidence-based rehabilitation protocols,
          portable modalities, and personalized recovery exercises directly to your living room.
        </p>
      </PageHero>

      {/* Overview Section */}
      <section className="container-site py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Regain Independence, Strength, and Mobility
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Recovering physical movement shouldn't require agonizing travel to a distant physiotherapy clinic.
              Our qualified home physiotherapists assess the patient's biomechanics in their real-life home
              environment and tailor a progressive exercise regimen.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Whether you are recovering from orthopedic surgery or rebuilding strength after a neurological
              event, our therapists work patient-by-patient toward tangible mobility milestones.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/request-service"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
              >
                Book Physiotherapist
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
              What Each Home Session Includes
            </h3>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Thorough range-of-motion, strength, and posture evaluation</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Hands-on manual joint mobilization and myofascial release</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Targeted active/passive strengthening and resistance band routines</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Application of pain-relieving electrotherapy modalities if required</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Safe transfer and gait training using walkers, canes, or crutches</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Home exercise program (HEP) guidelines for patient and caregivers</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-section py-16 sm:py-20">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">REHABILITATION SPECIALTIES</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Targeted Physical Therapy Solutions
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Comprehensive clinical protocols structured to safely rebuild strength and range of motion.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {physioFeatures.map((feat) => (
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
            <p className="eyebrow">INDICATIONS & CONDITIONS</p>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Helping You Move Comfortably Again
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Regular guided physiotherapy reduces dependence on pain medications, restores joint kinematics,
              and significantly accelerates return to daily life.
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
                  Physician-Aligned Recovery Plans
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                All therapy exercises are calibrated according to treating surgeon and physician guidelines to
                prevent premature stress on healing tissues or surgical implants.
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
