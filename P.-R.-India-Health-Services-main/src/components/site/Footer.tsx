import { Link } from "@tanstack/react-router";
import { HeartPulse, Mail, MapPin, Phone } from "lucide-react";

const siteLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/healthcare-team", label: "Healthcare Team" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/request-service", label: "Request a Service" },
  { to: "/join-team", label: "Join Our Team" },
] as const;

const legalLinks = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/medical-disclaimer", label: "Medical Disclaimer" },
] as const;

export function Footer() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="container-site py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal text-teal-foreground">
                <HeartPulse className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-display text-base font-bold">P. R. India Health Services</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-navy-foreground/75">
              Professional Critical Care Services at Home. Coordinated home healthcare,
              critical-care equipment and trained healthcare professionals around your needs.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-navy-foreground/60">
              Explore
            </h2>
            <ul className="mt-4 space-y-2.5">
              {siteLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-navy-foreground/85 transition-colors hover:text-teal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-navy-foreground/60">
              Legal
            </h2>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-navy-foreground/85 transition-colors hover:text-teal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-navy-foreground/60">
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-navy-foreground/85">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                <span>Phone: [To be added]</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                <span>Email: [To be added]</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                <span>Address: [To be added]</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                <span>Service Locations: [To be added]</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-navy-foreground/15 pt-6">
          <p className="text-xs leading-relaxed text-navy-foreground/60">
            Submission of a service request does not constitute medical advice, diagnosis or
            treatment, and does not guarantee service availability. Healthcare services and
            equipment are subject to professional assessment, suitability and availability. For
            medical emergencies, contact your local emergency medical service or visit the nearest
            emergency department.
          </p>
          <p className="mt-4 text-xs text-navy-foreground/60">
            © {new Date().getFullYear()} P. R. India Health Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
