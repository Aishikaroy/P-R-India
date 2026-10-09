import { Link } from "@tanstack/react-router";

export function CTASection() {
  return (
    <section className="bg-navy">
      <div className="container-site py-16 text-center sm:py-20">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold text-navy-foreground sm:text-4xl">
          Need Professional Healthcare Support at Home?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-navy-foreground/75">
          Tell us what you need and our team will review your requirements.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/request-service"
            className="inline-flex w-full items-center justify-center rounded-lg bg-teal px-6 py-3 text-base font-semibold text-teal-foreground transition-colors hover:bg-teal/90 sm:w-auto"
          >
            Request a Service
          </Link>
          <Link
            to="/join-team"
            className="inline-flex w-full items-center justify-center rounded-lg border border-navy-foreground/30 px-6 py-3 text-base font-semibold text-navy-foreground transition-colors hover:bg-navy-foreground/10 sm:w-auto"
          >
            Join Our Healthcare Team
          </Link>
        </div>
      </div>
    </section>
  );
}
