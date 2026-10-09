import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  HeartPulse,
  Info,
  PhoneCall,
  ShieldAlert,
} from "lucide-react";

import { PageHero } from "../components/site/PageHero";

export const Route = createFileRoute("/medical-disclaimer")({
  head: () => ({
    meta: [
      {
        title: "Medical Disclaimer — P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Important medical disclaimer regarding healthcare services, home ICU setups, clinical suitability, and emergency protocols at P. R. India Health Services.",
      },
      {
        property: "og:title",
        content: "Medical Disclaimer — P. R. India Health Services",
      },
      {
        property: "og:description",
        content:
          "Information on this website is for general informational purposes and does not constitute medical advice, diagnosis or treatment.",
      },
    ],
  }),
  component: MedicalDisclaimerPage,
});

function MedicalDisclaimerPage() {
  return (
    <>
      <PageHero eyebrow="CRITICAL HEALTHCARE NOTICE" title="Medical Disclaimer">
        <p>
          Important information regarding the scope of our website content, home healthcare
          coordination, clinical suitability, and medical emergencies.
        </p>
      </PageHero>

      <div className="container-site py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Prominent High-Visibility Callout Box */}
          <div className="rounded-2xl border-2 border-primary/30 bg-secondary/50 p-6 sm:p-8 space-y-4 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <ShieldAlert className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
                Important Healthcare Notice
              </h2>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-foreground/90 font-medium">
              <p className="rounded-lg bg-background p-4 border border-border">
                <strong>
                  &ldquo;Information provided on this website is for general informational purposes
                  and does not constitute medical advice, diagnosis or treatment.&rdquo;
                </strong>
              </p>
              <p className="rounded-lg bg-background p-4 border border-border">
                <strong>
                  &ldquo;Submitting a service request does not guarantee service availability or
                  clinical suitability.&rdquo;
                </strong>
              </p>
            </div>
          </div>

          {/* Emergency Alert Box */}
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
            <div className="flex items-start gap-3">
              <AlertOctagon
                className="h-6 w-6 shrink-0 text-destructive mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-base font-bold text-destructive">
                  Medical Emergencies
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  This website and our home healthcare coordination desk are not intended for acute,
                  life-threatening medical emergencies. If the patient is experiencing a sudden
                  critical emergency (such as severe chest pain, loss of consciousness, acute
                  respiratory failure, or major trauma), immediately call your local emergency
                  medical service (e.g. <strong>112 / 108 / 102</strong>) or proceed immediately to
                  the nearest hospital emergency department.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Points */}
          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            {/* Point 1 */}
            <section className="space-y-3">
              <h3 className="font-display text-lg font-bold text-foreground">
                1. No Doctor-Patient Relationship
              </h3>
              <p>
                Browsing this website, submitting an inquiry, or reviewing service descriptions does
                not create a doctor-patient relationship between you and P. R. India Health
                Services. A formal clinical relationship is established only upon direct clinical
                consultation with licensed medical practitioners.
              </p>
            </section>

            {/* Point 2 */}
            <section className="space-y-3">
              <h3 className="font-display text-lg font-bold text-foreground">
                2. No Medical Diagnosis or Self-Treatment
              </h3>
              <p>
                The information provided on this website—including details about home ICU care,
                nursing services, respiratory support, and monitoring equipment—is designed for
                general awareness. You should never disregard professional medical advice or delay
                seeking clinical attention because of something you have read on this website.
              </p>
            </section>

            {/* Point 3 */}
            <section className="space-y-3">
              <h3 className="font-display text-lg font-bold text-foreground">
                3. Equipment Suitability & Prescription Requirements
              </h3>
              <p>
                The deployment of critical-care equipment (such as ventilators, BiPAP machines,
                oxygen concentrators, suction devices, and cardiac monitors) requires clinical
                evaluation and formal medical prescription by a qualified physician. Equipment
                settings, oxygen flow rates, and therapy parameters must be determined by the
                patient&apos;s treating doctor.
              </p>
            </section>

            {/* Point 4 */}
            <section className="space-y-3">
              <h3 className="font-display text-lg font-bold text-foreground">
                4. Independent Clinical Judgment of Practitioners
              </h3>
              <p>
                Healthcare professionals in our network (including doctors, registered nurses, and
                physiotherapists) exercise their own independent clinical judgment and practice in
                accordance with their applicable medical council standards and regulatory
                guidelines.
              </p>
            </section>

            {/* Point 5 */}
            <section className="space-y-3">
              <h3 className="font-display text-lg font-bold text-foreground">
                5. Service Confirmation & Assessment
              </h3>
              <p>
                All service requests are subject to professional clinical review, location
                feasibility, and resource availability. We reserve the right to recommend hospital
                care or decline home deployment if home-based care is determined to be clinically
                unsafe or inappropriate for the patient&apos;s condition.
              </p>
            </section>
          </div>

          {/* Action Links */}
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-display text-base font-bold text-foreground">
                Have questions about patient suitability?
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Our coordination team is available to discuss your care requirements.
              </p>
            </div>
            <Link
              to="/request-service"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
            >
              Request a Service
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Footer Back Action */}
          <div className="border-t border-border pt-8 flex justify-between items-center">
            <Link
              to="/"
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              ← Back to Homepage
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Contact Us →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
