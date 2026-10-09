import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Boxes,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { useAdminAuth } from "../../hooks/use-admin-auth";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/service-requests", label: "Service Requests", icon: ClipboardList, exact: false },
  { to: "/admin/healthcare-team", label: "Healthcare Team", icon: Users, exact: false },
  { to: "/admin/equipment", label: "Equipment", icon: Boxes, exact: false },
  { to: "/admin/notifications", label: "Notifications", icon: Bell, exact: false },
  { to: "/admin/contact-messages", label: "Contact Messages", icon: MessageSquare, exact: false },
] as const;

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isLoading, user, isAdmin, error, signOut } = useAdminAuth(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-section px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Verifying administrator authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-section px-4">
        <div className="card-soft mx-auto max-w-md p-8 text-center bg-card">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/15 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-display text-xl font-bold text-foreground">
            Unauthorized Access
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {error || "Your account does not have administrator privileges to access this portal."}
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => signOut()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Return to Public Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-section text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        {/* Branding */}
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulse className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <span className="block truncate font-display text-sm font-bold text-foreground">
              P. R. India Health
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-teal">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4" aria-label="Admin">
          {navItems.map((item) => {
            const isActive = item.exact ? currentPath === item.to : currentPath.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User & Sign Out Footer */}
        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-2.5 px-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">Administrator</p>
              <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border text-foreground lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="font-display text-lg font-bold text-foreground sm:text-xl">
              {title || "Overview"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
              View Public Site ↗
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-card p-4 lg:hidden">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? currentPath === item.to
                  : currentPath.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
