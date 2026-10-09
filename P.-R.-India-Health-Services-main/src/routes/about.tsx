import { createFileRoute } from "@tanstack/react-router";
import { Compass, Focus, UsersRound } from "lucide-react";

import aboutImage from "../assets/about-care.jpg";
import { PageHero } from "../components/site/PageHero";
import { CTASection } from "../components/site/CTASection";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — P. R. India Health Services" },
      {
        name: "description",
        content:
          "P. R. India Health Services connects patients and families with coordinated home healthcare support, critical-care services at home, qualified professionals and medical equipment.",
      },
      { property: "og:title", content: "About P. R. India Health Services" },
      {
        property: "og:description",
        content:
          "Coordinated home healthcare and critical-care support with a professional network and a patient- and family-focused approach.",
      },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  {
    icon: Compass,
    title: "Our Approach",
    description:
      "Professional and coordinated healthcare support at home. Every request is reviewed so that the right combination of services, professionals and equipment can be arranged around the patient's needs.",
  },
  {
    icon: Focus,
    title: "Our Focus",
    description:
      "Quality, professionalism, responsiveness and patient-centered care guide how we coordinate every service — from a single doctor home visit to a complete home ICU setup.",
  },
  {
    icon: UsersRound,
    title: "Our Network",
    description:
      "We work with doctors, nurses, physiotherapists, attendants and specialized technicians to bring appropriate healthcare professionals to patients at home.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About Us" title="About P. R. India Health Services">
        <p>
          P. R. India Health Services provides coordinated home healthcare and critical-care support
          — connecting patients and families with appropriate home healthcare services, qualified
          professionals and medical equipment.
        </p>
      </PageHero>

      <section className="container-site py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Healthcare Support With a Human Approach
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              When care is needed at home, families often have to coordinate many moving parts —
              professionals, equipment, schedules and clinical requirements. P. R. India Health
              Services exists to bring those pieces together.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Our focus is home healthcare and critical-care support: home nursing services, doctor
              home visits, attendant care, home physiotherapy, home ICU setup and critical care
              equipment — coordinated around each patient's individual requirements and delivered
              with a genuinely human approach.
            </p>
          </div>
          <img
            src={aboutImage}
            alt="Doctor on a home visit discussing care with an elderly patient"
            width={1600}
            height={1008}
            loading="lazy"
            className="aspect-[8/5] w-full rounded-2xl object-cover shadow-soft"
          />
        </div>
      </section>

      <section className="bg-section">
        <div className="container-site py-16 sm:py-20">
          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="card-soft p-6">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
                  <pillar.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-lg font-bold text-foreground">
                  {pillar.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
