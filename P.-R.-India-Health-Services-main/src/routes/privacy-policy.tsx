import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, Lock, ShieldCheck } from "lucide-react";

import { PageHero } from "../components/site/PageHero";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      {
        title: "Privacy Policy — P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Read the privacy policy of P. R. India Health Services. Learn how we collect, use, and protect information submitted for home healthcare services and professional registrations.",
      },
      {
        property: "og:title",
        content: "Privacy Policy — P. R. India Health Services",
      },
      {
        property: "og:description",
        content:
          "Learn how P. R. India Health Services handles data protection, patient inquiries, and healthcare professional information.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <>
      <PageHero eyebrow="LEGAL & POLICIES" title="Privacy Policy">
        <p>
          This Privacy Policy outlines how P. R. India Health Services handles personal information
          collected through this website for service inquiries and professional network
          registrations.
        </p>
      </PageHero>

      <div className="container-site py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Advisory Notice */}
          <div className="rounded-xl border border-border bg-section p-5 flex items-start gap-3.5">
            <Info className="h-5 w-5 shrink-0 text-teal mt-0.5" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Policy Notice:</strong> This document represents
              the general privacy and operational data guidelines for the P. R. India Health
              Services website. Actual clinical data management and professional records are subject
              to applicable Indian healthcare regulations and periodic legal review.
            </p>
          </div>

          {/* Section 1: Information Collected */}
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              1. Information We Collect
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We collect information that you voluntarily provide when interacting with our website,
              submitting service requests, or registering as a healthcare professional. This
              includes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Patient & Service Inquiries:</strong> Patient
                name, age, contact telephone numbers, residential address, city, PIN code, requested
                medical services, required medical equipment, scheduling preferences, and any
                voluntary health condition notes provided.
              </li>
              <li>
                <strong className="text-foreground">Healthcare Professional Registrations:</strong>{" "}
                Full name, phone number, email address, city, service areas, medical/nursing
                qualifications, clinical discipline, council registration numbers, availability, and
                clinical experience details.
              </li>
              <li>
                <strong className="text-foreground">General Contact Submissions:</strong> Name,
                phone number, email address, message subjects, and specific inquiry text.
              </li>
            </ul>
          </section>

          {/* Section 2: How Information is Used */}
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              2. How We Use Your Information
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The information collected is used strictly for operational, clinical coordination, and
              communication purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>To evaluate patient requirements and determine service suitability.</li>
              <li>
                To contact you regarding service feasibility, equipment availability, and
                scheduling.
              </li>
              <li>
                To evaluate and review credentials of doctors, nurses, physiotherapists, attendants,
                and technicians seeking collaboration.
              </li>
              <li>To respond to customer support inquiries and general questions.</li>
              <li>To improve website performance, reliability, and service workflows.</li>
            </ul>
          </section>

          {/* Section 3: Data Protection & Security */}
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              3. Data Protection & Security
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We employ reasonable technical and administrative precautions to protect your personal
              and contact information against unauthorized access, loss, misuse, or alteration.
              Access to submitted patient requests and professional details is restricted to
              authorized coordination personnel.
            </p>
          </section>

          {/* Section 4: Third-Party Services & Healthcare Providers */}
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              4. Third-Party Healthcare Providers & Services
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              In order to fulfill home healthcare requests, relevant details (such as address,
              required procedures, and contact numbers) may be shared with qualified independent
              healthcare professionals (e.g., attending nurses, visiting doctors, equipment delivery
              technicians) assigned to your service request. We do not sell, rent, or trade your
              personal data to third-party advertisers.
            </p>
          </section>

          {/* Section 5: Data Retention */}
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              5. Data Retention
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Personal information submitted through this website is retained only for as long as
              necessary to fulfill the legitimate purposes of coordination, ongoing care
              communication, record-keeping, and compliance with applicable legal obligations.
            </p>
          </section>

          {/* Section 6: Cookies & Technical Identifiers */}
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              6. Cookies and Technical Data
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Our website may utilize essential cookies or standard browser technical storage to
              maintain navigation performance, session security, and basic user preferences. You can
              manage cookie settings through your browser configuration.
            </p>
          </section>

          {/* Section 7: User Rights */}
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              7. Your Rights
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You may request review, correction, or deletion of your voluntarily submitted contact
              details by reaching out to our coordination desk. We will make reasonable efforts to
              honor verifiable requests in accordance with operational feasibility and legal
              requirements.
            </p>
          </section>

          {/* Section 8: Policy Updates & Contact */}
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              8. Updates and Contact Information
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We reserve the right to revise this Privacy Policy periodically. Continued use of our
              website after updates are posted signifies acceptance of the revised terms.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you have any questions regarding this Privacy Policy or how your information is
              handled, please{" "}
              <Link
                to="/contact"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                contact us
              </Link>
              .
            </p>
          </section>

          {/* Footer Back Action */}
          <div className="border-t border-border pt-8 flex justify-between items-center">
            <Link
              to="/"
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              ← Back to Homepage
            </Link>
            <Link
              to="/terms"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Terms & Conditions →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
