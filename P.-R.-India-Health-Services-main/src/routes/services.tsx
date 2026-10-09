import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BedDouble,
  ClipboardList,
  HandHeart,
  HeartPulse,
  Stethoscope,
  Wind,
} from "lucide-react";

import homeIcuImage from "../assets/home-icu.jpg";
import { PageHero } from "../components/site/PageHero";
import { CTASection } from "../components/site/CTASection";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      {
        title:
          "Home Healthcare Services — Home ICU, Nursing, Doctor Visits | P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Explore our home healthcare services: home ICU setup, home nursing services, doctor home visits, attendant care, home physiotherapy and critical care medical equipment.",
      },
      { property: "og:title", content: "Home Healthcare Services — P. R. India Health Services" },
      {
        property: "og:description",
        content:
          "Home ICU setup, home nursing, doctor home visits, attendants, physiotherapy and critical care equipment coordinated around your needs.",
      },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: BedDouble,
    title: "Home ICU Setup",
    href: "/home-icu" as const,
    description:
      "Support for creating an appropriate critical-care environment at home, including ICU equipment and coordination of trained professionals based on individual requirements.",
  },
  {
    icon: HeartPulse,
    title: "Nursing Services",
    href: "/nursing-services" as const,
    description:
      "Professional nursing support for home-based patient care, from routine assistance to more intensive home nursing services.",
  },
  {
    icon: Stethoscope,
    title: "Doctor Visits",
    href: "/doctor-visits" as const,
    description:
      "Coordination of doctor home visits based on patient requirements and professional availability.",
  },
  {
    icon: HandHeart,
    title: "Attendant & Caregiver Services",
    href: "/caregiver-services" as const,
    description:
      "Trained attendants and caretakers for day-to-day patient support, comfort and assistance at home.",
  },
  {
    icon: Activity,
    title: "Physiotherapy",
    href: "/physiotherapy" as const,
    description:
      "Home-based physiotherapy support where appropriate, coordinated around the patient's condition and recovery needs.",
  },
  {
    icon: ClipboardList,
    title: "Medical Equipment",
    href: "/medical-equipment" as const,
    description:
      "Critical-care and monitoring equipment available based on requirement and availability, including oxygen concentrators, ventilators and cardiac monitors.",
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

function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Healthcare Services at Home, Coordinated Around Your Needs"
      >
        <p>
          Healthcare services and critical-care support designed around the needs of patients and
          families — from home nursing services to complete home ICU setup.
        </p>
      </PageHero>

      <section className="container-site py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="card-soft flex flex-col p-6">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
                <service.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-foreground">
                <Link
                  to={service.href}
                  className="transition-colors hover:text-teal"
                >
                  {service.title}
                </Link>
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
                <Link
                  to={service.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-teal"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/request-service"
                  className="inline-flex items-center justify-center rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Request Service
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-section">
        <div className="container-site py-16 sm:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                Home ICU Support & Medical Equipment
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                When home-based critical-care support is required, we help coordinate essential
                equipment and professional services based on individual requirements and
                availability.
              </p>
              <img
                src={homeIcuImage}
                alt="Home ICU setup with motorized ICU bed, cardiac monitor and oxygen concentrator at home"
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
        </div>
      </section>

      <CTASection />
    </>
  );
}
