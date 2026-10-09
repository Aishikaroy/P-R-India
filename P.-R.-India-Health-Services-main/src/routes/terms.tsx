import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, FileText, Info } from "lucide-react";

import { PageHero } from "../components/site/PageHero";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      {
        title: "Terms & Conditions — P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Read the terms and conditions for using P. R. India Health Services website, submitting home healthcare requests, and registering as healthcare professionals.",
      },
      {
        property: "og:title",
        content: "Terms & Conditions — P. R. India Health Services",
      },
      {
        property: "og:description",
        content:
          "Operational guidelines, terms of service requests, equipment rentals, and website usage for P. R. India Health Services.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHero eyebrow="LEGAL & POLICIES" title="Terms & Conditions">
        <p>
          Please review the following terms and conditions governing the use of the P. R. India
          Health Services website, service inquiry submissions, and professional registrations.
        </p>
      </PageHero>

      <div className="container-site py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Advisory Notice */}
          <div className="rounded-xl border border-border bg-section p-5 flex items-start gap-3.5">
            <Info className="h-5 w-5 shrink-0 text-teal mt-0.5" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Terms Notice:</strong> These terms govern the
              informational and inquiry usage of this website. Formal service agreements, clinical
              consents, and professional engagement agreements are finalized separately prior to
              service deployment.
            </p>
          </div>

          {/* Section 1: Website Use */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              1. Website Use
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              By accessing and using this website, you agree to comply with these terms, all
              applicable local regulations, and standard acceptable use practices. The website is
              intended for individuals seeking home healthcare support and healthcare professionals
              exploring collaboration.
            </p>
          </section>

          {/* Section 2: Service Requests & Non-Guarantee */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              2. Service Requests & Availability
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Submitting a request through the{" "}
              <Link
                to="/request-service"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Request a Service
              </Link>{" "}
              form constitutes a preliminary inquiry and does not create a binding service contract
              or guarantee service availability. All home healthcare deployments, including nursing,
              attendant care, and doctor visits, are subject to clinical evaluation, qualified staff
              availability, and geographic coverage.
            </p>
          </section>

          {/* Section 3: Medical Equipment Availability & Suitability */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              3. Medical Equipment & ICU Setup
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Medical equipment listed on this website (such as ICU beds, ventilators, oxygen
              concentrators, BiPAP/CPAP machines, and multipara monitors) is supplied based on stock
              availability and clinical suitability as prescribed by the patient’s treating
              physician. The organization does not provide medical prescriptions.
            </p>
          </section>

          {/* Section 4: Accuracy of Submitted Information */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              4. Accuracy of Submitted Information & User Responsibilities
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Users are responsible for ensuring that all information provided regarding the
              patient's condition, medical history, location, and emergency contacts is accurate,
              complete, and truthful. Inaccurate medical details may affect service appropriateness
              and patient safety.
            </p>
          </section>

          {/* Section 5: Healthcare Professional Registration */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              5. Healthcare Professional Registration
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Submitting a professional registration via the{" "}
              <Link
                to="/join-team"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Join Our Team
              </Link>{" "}
              page does not establish employment, guaranteed shift allocation, or partnership. All
              participating doctors, nurses, and allied healthcare practitioners undergo credentials
              verification and onboarding reviews before engagement.
            </p>
          </section>

          {/* Section 6: Third-Party Healthcare Practitioners */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              6. Independent Healthcare Professionals
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Doctors, specialized nurses, and physiotherapists collaborating through our network
              operate within their respective scopes of professional practice and clinical judgment.
              Clinical decisions remain the professional responsibility of the treating and
              attending healthcare providers.
            </p>
          </section>

          {/* Section 7: Cancellations & Scheduling Modifications */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              7. Cancellations and Rescheduling
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Requested service schedules, nurse shift adjustments, or equipment returns should be
              communicated in advance to the coordination team to facilitate orderly transitions and
              support patient continuity of care.
            </p>
          </section>

          {/* Section 8: Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              8. Limitation of Liability
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              To the fullest extent permitted by applicable law, P. R. India Health Services and its
              coordinators shall not be liable for any indirect, incidental, or consequential
              damages arising from the use of this website, temporary service unavailability, or
              reliance on general website information.
            </p>
          </section>

          {/* Section 9: Intellectual Property */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              9. Intellectual Property
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              All branding, text, graphics, logos, and UI components on this website are the
              property of P. R. India Health Services and are protected by applicable copyright and
              trademark principles. Unauthorized reproduction is prohibited.
            </p>
          </section>

          {/* Section 10: Governing Law */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              10. Governing Law & Jurisdiction
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              These terms and operational guidelines shall be governed by and construed in
              accordance with the laws of India. Any disputes arising in connection with website
              usage shall be subject to the jurisdiction of competent courts in India.
            </p>
          </section>

          {/* Section 11: Changes to Terms */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              11. Changes to Terms
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We reserve the right to update or modify these Terms & Conditions at any time. Changes
              will become effective upon posting to this page.
            </p>
          </section>

          {/* Footer Back Action */}
          <div className="border-t border-border pt-8 flex justify-between items-center">
            <Link
              to="/privacy-policy"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              ← Privacy Policy
            </Link>
            <Link
              to="/medical-disclaimer"
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Medical Disclaimer →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
