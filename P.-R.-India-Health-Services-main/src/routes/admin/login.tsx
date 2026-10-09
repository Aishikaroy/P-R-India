import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AlertCircle, HeartPulse, Loader2, Lock, Mail, Shield } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { isSupabaseConfigured, supabase } from "../../lib/supabase";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      {
        title: "Admin Login — P. R. India Health Services",
      },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkExistingSession() {
      if (!isSupabaseConfigured) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if admin
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (data && data.role === "admin") {
          navigate({ to: "/admin" });
        }
      }
    }
    checkExistingSession();
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!isSupabaseConfigured) {
        setErrorMessage(
          "Supabase configuration missing in environment. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
        );
        setIsSubmitting(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setErrorMessage(authError.message || "Invalid login credentials.");
        setIsSubmitting(false);
        return;
      }

      if (!authData.user) {
        setErrorMessage("Authentication failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Verify admin role authorization
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError || !roleData || roleData.role !== "admin") {
        await supabase.auth.signOut();
        setErrorMessage("Access denied: Your account does not have administrator privileges.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      navigate({ to: "/admin" });
    } catch (err) {
      console.error(
        "Login exception:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      setErrorMessage("An unexpected error occurred during login. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-section px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <HeartPulse className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
            P. R. India Health Services
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-teal">
            Internal Management Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="card-soft mt-8 p-6 sm:p-8 bg-card shadow-soft">
          <div className="mb-6 border-b border-border pb-4">
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Administrator Sign In
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter your authorized staff credentials to continue.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="adminEmail" className="block text-xs font-semibold text-foreground">
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="adminEmail"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@prindiahealth.com"
                  className="flex h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="adminPassword"
                className="block text-xs font-semibold text-foreground"
              >
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="adminPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="flex h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-navy disabled:pointer-events-none disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-border pt-4 text-center">
            <p className="text-[11px] text-muted-foreground">
              Restricted system for authorized coordinators only.
            </p>
          </div>
        </div>

        {/* Back to public link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
