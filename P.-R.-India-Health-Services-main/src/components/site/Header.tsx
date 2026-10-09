import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BedDouble,
  ChevronDown,
  ClipboardList,
  HandHeart,
  HeartPulse,
  Menu,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const serviceItems = [
  {
    to: "/home-icu" as const,
    label: "Home ICU Setup",
    desc: "Hospital-grade ICU beds, ventilators & monitoring",
    icon: BedDouble,
  },
  {
    to: "/nursing-services" as const,
    label: "Nursing Services",
    desc: "24/7 ICU & skilled nursing care by verified staff",
    icon: HeartPulse,
  },
  {
    to: "/doctor-visits" as const,
    label: "Doctor Visits",
    desc: "Bedside consultations & clinical exams at home",
    icon: Stethoscope,
  },
  {
    to: "/caregiver-services" as const,
    label: "Attendant & Caregiver",
    desc: "Compassionate daily hygiene & patient assistance",
    icon: HandHeart,
  },
  {
    to: "/physiotherapy" as const,
    label: "Physiotherapy",
    desc: "Neuro, ortho & geriatric mobility rehabilitation",
    icon: Activity,
  },
  {
    to: "/medical-equipment" as const,
    label: "Medical Equipment",
    desc: "Certified oxygen concentrators, BiPAP & monitors",
    icon: ClipboardList,
  },
] as const;

const otherNavLinksAfter = [
  { to: "/healthcare-team" as const, label: "Healthcare Team" },
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isServicesActive =
    currentPath === "/services" ||
    currentPath === "/home-icu" ||
    currentPath === "/nursing-services" ||
    currentPath === "/doctor-visits" ||
    currentPath === "/caregiver-services" ||
    currentPath === "/physiotherapy" ||
    currentPath === "/medical-equipment";

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setDesktopDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDesktopDropdownOpen(false);
    }, 180);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDesktopDropdownOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setDesktopDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", onKey);
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="container-site">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5"
            aria-label="P. R. India Health Services — Home"
            onClick={() => setOpen(false)}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulse className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-bold leading-tight text-foreground sm:text-base">
                P. R. India Health Services
              </span>
              <span className="hidden text-[11px] font-medium text-muted-foreground sm:block">
                Professional Critical Care Services at Home
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              Home
            </Link>

            {/* Services Dropdown Trigger */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setDesktopDropdownOpen((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDesktopDropdownOpen((v) => !v);
                  }
                }}
                aria-expanded={desktopDropdownOpen}
                aria-haspopup="true"
                className={`group inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground cursor-pointer ${
                  isServicesActive || desktopDropdownOpen
                    ? "text-primary font-semibold bg-secondary/60"
                    : "text-muted-foreground"
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ease-out ${
                    desktopDropdownOpen
                      ? "rotate-180 text-primary"
                      : "text-muted-foreground/80 group-hover:text-foreground"
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Desktop Animated Dropdown Menu */}
              <div
                className={`absolute left-1/2 top-full -translate-x-1/2 pt-2 z-50 w-[550px] transition-all duration-200 ease-out origin-top ${
                  desktopDropdownOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="rounded-2xl border border-border bg-card/98 backdrop-blur-md p-4 shadow-lift ring-1 ring-black/5">
                  {/* Top Bar Header */}
                  <div className="mb-3 flex items-center justify-between border-b border-border/80 pb-3 px-1">
                    <div>
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Our Healthcare Services
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Coordinated clinical & daily care at home
                      </p>
                    </div>
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-teal"
                      onClick={() => setDesktopDropdownOpen(false)}
                    >
                      All Services
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* 2-Column Grid of All Services */}
                  <div className="grid grid-cols-2 gap-2">
                    {serviceItems.map((service) => (
                      <Link
                        key={service.to}
                        to={service.to}
                        className={`group flex items-start gap-3 rounded-xl p-2.5 transition-all hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          currentPath === service.to ? "bg-secondary text-primary" : "text-foreground"
                        }`}
                        onClick={() => setDesktopDropdownOpen(false)}
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <service.icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="truncate font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {service.label}
                            </span>
                            <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-primary shrink-0" />
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 leading-snug">
                            {service.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Dropdown Bottom Quick Request Bar */}
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-section px-3.5 py-2.5 border border-border/60">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-teal shrink-0" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Need tailored clinical assistance?
                      </span>
                    </div>
                    <Link
                      to="/request-service"
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-navy"
                      onClick={() => setDesktopDropdownOpen(false)}
                    >
                      Request Service
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Remaining Nav Links */}
            {otherNavLinksAfter.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "text-primary font-semibold" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <Link
              to="/join-team"
              className="text-sm font-semibold text-primary underline-offset-4 transition-colors hover:text-teal hover:underline"
            >
              Join Our Team
            </Link>
            <Link
              to="/request-service"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
            >
              Request a Service
            </Link>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border text-foreground lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {open && (
        <div id="mobile-nav" className="border-t border-border bg-background lg:hidden">
          <nav className="container-site flex flex-col gap-1 py-4" aria-label="Mobile">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
              activeProps={{ className: "bg-secondary text-primary font-semibold" }}
              onClick={() => setOpen(false)}
            >
              Home
            </Link>

            {/* Mobile Collapsible Services Accordion */}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setMobileServicesOpen((v) => !v)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium transition-colors hover:bg-secondary text-left ${
                  isServicesActive || mobileServicesOpen
                    ? "text-primary font-semibold bg-secondary/50"
                    : "text-foreground"
                }`}
                aria-expanded={mobileServicesOpen}
              >
                <span>Services</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ease-out ${
                    mobileServicesOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                  }`}
                />
              </button>

              {/* Animated Mobile Submenu */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  mobileServicesOpen ? "max-h-[600px] opacity-100 pt-1 pb-2" : "max-h-0 opacity-0"
                }`}
              >
                <div className="ml-3 border-l-2 border-primary/20 pl-2.5 flex flex-col gap-1">
                  <Link
                    to="/services"
                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors hover:bg-secondary ${
                      currentPath === "/services" ? "bg-secondary text-primary" : "text-primary"
                    }`}
                    onClick={() => {
                      setOpen(false);
                      setMobileServicesOpen(false);
                    }}
                  >
                    <span>All Services Overview</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  {serviceItems.map((service) => (
                    <Link
                      key={service.to}
                      to={service.to}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-secondary ${
                        currentPath === service.to
                          ? "bg-secondary text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground font-medium"
                      }`}
                      onClick={() => {
                        setOpen(false);
                        setMobileServicesOpen(false);
                      }}
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                        <service.icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="truncate">{service.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Remaining Mobile Links */}
            {otherNavLinksAfter.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-primary font-semibold" }}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
              <Link
                to="/request-service"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-base font-semibold text-primary-foreground"
                onClick={() => setOpen(false)}
              >
                Request a Service
              </Link>
              <Link
                to="/join-team"
                className="inline-flex items-center justify-center rounded-lg border border-primary px-4 py-3 text-base font-semibold text-primary"
                onClick={() => setOpen(false)}
              >
                Join Our Team
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
