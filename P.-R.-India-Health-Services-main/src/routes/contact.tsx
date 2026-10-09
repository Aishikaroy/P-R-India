import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  UserCheck,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import { PageHero } from "../components/site/PageHero";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      {
        title: "Contact Us — P. R. India Health Services",
      },
      {
        name: "description",
        content:
          "Have a question about our services or need help understanding your healthcare options? Get in touch with our team at P. R. India Health Services.",
      },
      {
        property: "og:title",
        content: "Contact P. R. India Health Services",
      },
      {
        property: "og:description",
        content:
          "Have a question about our services or need help understanding your healthcare options? Get in touch with our team.",
      },
    ],
  }),
  component: ContactPage,
});

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactFormErrors {
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const initialContactFormData: ContactFormData = {
  name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
};

function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>(initialContactFormData);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validatePhone = (num: string) => {
    const cleaned = num.replace(/[\s-+]/g, "");
    return cleaned.length >= 10 && /^\d+$/.test(cleaned);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const validate = (): boolean => {
    const newErrors: ContactFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Your name is required.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from("contact_messages").insert({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          status: "new",
        });

        if (error) {
          console.error("Supabase insert error:", error.message || "Unknown error");
          setSubmitError(
            "We couldn't send your message right now. Please try again or reach out to us directly.",
          );
          setIsSubmitting(false);
          return;
        }
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(
        "Contact submit exception:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setSubmitError(
        "We couldn't send your message right now. Please try again or reach out to us directly.",
      );
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialContactFormData);
    setErrors({});
    setSubmitError(null);
    setIsSubmitted(false);
  };

  return (
    <>
      <PageHero eyebrow="GET IN TOUCH" title="Contact P. R. India Health Services">
        <p>
          Have a question about our services or need help understanding your healthcare options? Get
          in touch with our team.
        </p>
      </PageHero>

      {/* Quick Access Actions */}
      <section className="container-site pt-12 sm:pt-16">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="card-soft flex flex-col justify-between p-6 sm:p-8 bg-card border-l-4 border-l-primary">
            <div>
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-primary">
                <HeartPulse className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold text-foreground">
                Looking for Patient Care at Home?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Submit your clinical care or ICU equipment requirements directly to our coordination
                desk for prompt assessment.
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/request-service"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
              >
                Request a Service
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="card-soft flex flex-col justify-between p-6 sm:p-8 bg-card border-l-4 border-l-teal">
            <div>
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                <UserCheck className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold text-foreground">
                Are You a Healthcare Professional?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Doctors, nurses, physiotherapists, attendants and technicians can register their
                interest to join our healthcare network.
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/join-team"
                className="inline-flex items-center gap-2 rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-teal-foreground shadow-soft transition-colors hover:bg-teal/90"
              >
                Join Our Healthcare Team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="container-site py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card-soft p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-foreground">
                Contact Information
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Reach out to us through our direct coordination channels or leave a message using
                the form.
              </p>

              <div className="mt-6 space-y-5 text-sm">
                <div className="flex items-start gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <Phone className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-medium text-foreground">Phone</h3>
                    <p className="text-muted-foreground font-mono text-xs mt-0.5">[To be added]</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-medium text-foreground">Email</h3>
                    <p className="text-muted-foreground font-mono text-xs mt-0.5">[To be added]</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-medium text-foreground">Address</h3>
                    <p className="text-muted-foreground font-mono text-xs mt-0.5">[To be added]</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-medium text-foreground">Service Locations</h3>
                    <p className="text-muted-foreground font-mono text-xs mt-0.5">[To be added]</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-lg border border-border bg-section p-4 text-xs leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Medical Emergency Notice:</strong> For immediate
                life-threatening emergencies, please dial your local emergency medical service (112
                / 108) or go to the nearest emergency hospital.
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            {isSubmitted ? (
              <div className="card-soft p-8 sm:p-12 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal/15 text-teal">
                  <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
                </div>
                <h2 className="mt-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
                  Message Sent Successfully
                </h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  Thank you for contacting P. R. India Health Services. Our team has received your
                  message and will get back to you promptly.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
                  >
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Link>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-soft p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Send Us a Message
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fill out the form below and our team will respond as soon as possible.
                </p>

                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground">
                      Your Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      aria-invalid={Boolean(errors.name)}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Amit Verma"
                      className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                        Phone Number <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        aria-invalid={Boolean(errors.phone)}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      {errors.phone && (
                        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        aria-invalid={Boolean(errors.email)}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@example.com"
                        className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground">
                      Subject <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="subject"
                      type="text"
                      required
                      aria-invalid={Boolean(errors.subject)}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Inquiry regarding Home ICU Setup in South Delhi"
                      className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    {errors.subject && (
                      <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground">
                      Message <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      required
                      aria-invalid={Boolean(errors.message)}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please write your questions or details here..."
                      className="mt-1.5 flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {submitError && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
