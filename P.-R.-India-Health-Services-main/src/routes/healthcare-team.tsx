import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  HandHeart,
  HeartPulse,
  Stethoscope,
  Wrench,
} from "lucide-react";

import teamImage from "../assets/healthcare-team.jpg";
import { PageHero } from "../components/site/PageHero";
import { CTASection } from "../components/site/CTASection";

export const Route = createFileRoute("/healthcare-team")({
  head: () => ({
    meta: [
      {
        title:
          "Join Our Healthcare Team — Doctors, Nurses, Physiotherapists | P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Healthcare professionals — doctors, nurses, physiotherapists, attendants and specialized technicians — can register their interest in joining our home healthcare network.",
      },
      { property: "og:title", content: "Join Our Healthcare Team — P. R. India Health Services" },
      {
        property: "og:description",
        content:
          "Flexible opportunities for doctors, nurses, physiotherapists, attendants and technicians in home-based healthcare.",
      },
    ],
  }),
  component: HealthcareTeamPage,
});

const roles = [
  {
    icon: HeartPulse,
    title: "Registered / Staff Nurses",
    description: "Qualified nurses supporting home-based patient care and home ICU environments.",
  },
  {
    icon: HandHeart,
    title: "Trained Attendants / Caretakers",
    description: "Trained attendants providing day-to-day patient support and assistance at home.",
  },
  {
    icon: Activity,
    title: "Physiotherapists",
    description: "Physiotherapists providing home-based rehabilitation and mobility support.",
  },
  {
    icon: Stethoscope,
    title: "MBBS / MD / DM Doctors",
    description: "Doctors available for coordinated home visits based on patient requirements.",
  },
  {
    icon: Wrench,
    title: "Specialized Technicians",
    description: "Technicians supporting critical-care and monitoring equipment in home settings.",
  },
];

const opportunities = [
  "Flexible coverage",
  "Part-time / visit-based work",
  "Doctor visit coordination",
];

function HealthcareTeamPage() {
  return (
    <>
      <PageHero eyebrow="Healthcare Professionals" title="Join Our Healthcare Team">
        <p>
          We work with qualified healthcare professionals to support patients requiring care at
          home. Register your professional interest and become part of a coordinated home healthcare
          network.
        </p>
      </PageHero>

      <section className="container-site py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div key={role.title} className="card-soft flex flex-col p-6">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
                <role.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-foreground">{role.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {role.description}
              </p>
            </div>
          ))}
          <div className="card-soft flex flex-col justify-between bg-primary p-6 text-primary-foreground">
            <div>
              <h2 className="font-display text-lg font-bold">Ready to Register?</h2>
              <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">
                Share your professional details and our team will review your registration.
              </p>
            </div>
            <Link
              to="/join-team"
              className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-teal-foreground transition-colors hover:bg-teal/90"
            >
              Join Our Team
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-section">
        <div className="container-site grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-14">
          <img
            src={teamImage}
            alt="Healthcare professionals — doctors, nurses and physiotherapists — in a care facility"
            width={1600}
            height={1008}
            loading="lazy"
            className="aspect-[8/5] w-full rounded-2xl object-cover shadow-soft"
          />
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Flexible Opportunities
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We understand that healthcare professionals have varied schedules. Opportunities are
              structured to accommodate different availability patterns.
            </p>
            <ul className="mt-6 space-y-3">
              {opportunities.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <CalendarClock className="h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/join-team"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-navy"
            >
              Join Our Healthcare Team
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
