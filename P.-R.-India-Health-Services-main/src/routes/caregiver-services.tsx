import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HandHeart,
  HeartHandshake,
  ShieldCheck,
  Smile,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

import { PageHero } from "../components/site/PageHero";
import { MedicalNote } from "../components/site/MedicalNote";
import { CTASection } from "../components/site/CTASection";

export const Route = createFileRoute("/caregiver-services")({
  head: () => ({
    meta: [
      {
        title: "Attendant & Caregiver Services at Home | P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Trained patient attendants and elderly caregivers for home care assistance across India. Compassionate daily living, hygiene, mobility, and companionship support.",
      },
      {
        property: "og:title",
        content: "Attendant & Caregiver Services — P. R. India Health Services",
      },
      {
        property: "og:description",
        content:
          "Reliable and trained attendants assisting bedridden patients and elderly family members with daily living, personal hygiene, and nutrition at home.",
      },
    ],
  }),
  component: CaregiverServicesPage,
});

const caregiverFeatures = [
  {
    icon: HandHeart,
    title: "Personal Hygiene & Grooming",
    description:
      "Support with sponge baths, assisted showering, oral hygiene, hair care, changing clothes, and bed linen maintenance with dignity.",
  },
  {
    icon: Users,
    title: "Mobility & Transfer Assistance",
    description:
      "Safe transfer assistance between bed, wheelchair, and chair, alongside gentle walking encouragement to prevent stiffness and falls.",
  },
  {
    icon: Clock,
    title: "12-Hour & 24-Hour Attendants",
    description:
      "Reliable full-time residential live-in or day/night shift caregiver allocation to match family routines and dependency levels.",
  },
  {
    icon: Sparkles,
    title: "Feeding & Nutritional Support",
    description:
      "Assisting patients with meal times, encouraging hydration, and supporting prescribed nutritional diets patiently.",
  },
  {
    icon: Smile,
    title: "Companionship & Emotional Comfort",
    description:
      "Empathetic, attentive presence reducing isolation for elderly seniors through friendly conversation, reading, and routine accompaniment.",
  },
  {
    icon: UserCheck,
    title: "Verified & Background-Checked",
    description:
      "Every attendant undergoes thorough background verification, address checks, and hands-on patient handling etiquette training.",
  },
];

const suitabilityCases = [
  "Elderly seniors living alone or needing day-to-day assistance with daily living activities",
  "Bedridden patients requiring regular position changes to prevent painful bedsores",
  "Post-operative patients requiring temporary mobility support during early recovery",
  "Stroke and neurological patients needing patient transfer assistance and feeding",
  "Dementia or Alzheimer's patients benefiting from structured, patient daily companionship",
  "Families needing trusted relief and support in managing demanding caregiving tasks",
];

function CaregiverServicesPage() {
  return (
    <>
      <PageHero eyebrow="DAILY CARE & ASSISTANCE" title="Trained Attendants & Caregiver Services">
        <p>
          We provide vetted, patient-centric attendants and caregivers who assist your loved ones with daily
          living, hygiene, and mobility with warmth, dignity, and attentiveness.
        </p>
      </PageHero>

      {/* Overview Section */}
      <section className="container-site py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Compassionate Assistance for Every Day
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              While clinical nursing addresses specialized medical treatments, everyday care—like bathing,
              assisted transfers, meal times, and companionship—forms the bedrock of patient comfort and peace
              of mind.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Our caregiver network pairs families with trained male and female patient attendants who provide
              patient, reliable bedside assistance while treating your loved ones like their own family.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/request-service"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
              >
                Request Caregiver
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
              Daily Caregiver Support Includes
            </h3>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Assisting with bathing, oral hygiene, diaper changes, and dressing</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Helping patients sit, stand, and safely walk around living spaces</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Regular 2-hour body repositioning for bedridden patients to prevent ulcers</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Assisting with meal consumption and timely hydration reminders</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Timely medication reminders according to physician schedule</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>Attentive night assistance for bathroom visits and comfort adjustments</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-section py-16 sm:py-20">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">DEDICATED ASSISTANCE</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Reliable Daily Support You Can Trust
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Our attendants are trained in gentle patient handling, emotional empathy, and hygiene standards.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {caregiverFeatures.map((feat) => (
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
            <p className="eyebrow">WHO NEEDS AN ATTENDANT?</p>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Peace of Mind for Families and Seniors
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Having a dependable caregiver at home ensures your loved one receives consistent, caring help
              throughout the day and night without placing unmanageable strain on family members.
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
                  Vetted and Supervised Support
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Attendants focus on non-invasive daily living assistance and patient comfort. For invasive
                procedures, injections, or clinical diagnostics, our registered nurses are coordinated.
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
