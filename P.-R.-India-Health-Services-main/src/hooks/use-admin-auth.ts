import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabase } from "../lib/supabase";

export interface AdminAuthState {
  isLoading: boolean;
  user: User | null;
  isAdmin: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

export function useAdminAuth(requireAuth = true): AdminAuthState {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAdminRole = async (currentUser: User | null): Promise<boolean> => {
    if (!currentUser || !isSupabaseConfigured) {
      return false;
    }

    try {
      const { data, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError) {
        console.error("Error verifying admin authorization:", roleError.message || "Unknown error");
        return false;
      }

      return Boolean(data && data.role === "admin");
    } catch (err) {
      console.error(
        "Authorization check exception:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setIsLoading(false);
          setError("Supabase credentials not configured in environment.");
        }
        return;
      }

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        const currentUser = session?.user ?? null;
        if (isMounted) {
          setUser(currentUser);
        }

        if (currentUser) {
          const authorized = await checkAdminRole(currentUser);
          if (isMounted) {
            setIsAdmin(authorized);
            setIsLoading(false);
          }

          if (requireAuth && !authorized) {
            setError("Access restricted: You do not have administrator privileges.");
            navigate({ to: "/admin/login" });
          }
        } else {
          if (isMounted) {
            setIsAdmin(false);
            setIsLoading(false);
          }
          if (requireAuth) {
            navigate({ to: "/admin/login" });
          }
        }
      } catch (err) {
        console.error(
          "Auth init exception:",
          err instanceof Error
            ? err.message
            : (err as { message?: string })?.message || "Unknown error",
        );
        if (isMounted) {
          setIsLoading(false);
          setError("Failed to initialize authentication.");
        }
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      if (!isMounted) return;

      setUser(currentUser);

      if (currentUser) {
        const authorized = await checkAdminRole(currentUser);
        if (isMounted) {
          setIsAdmin(authorized);
          setIsLoading(false);
        }
        if (requireAuth && !authorized) {
          setError("Access restricted: You do not have administrator privileges.");
          navigate({ to: "/admin/login" });
        }
      } else {
        if (isMounted) {
          setIsAdmin(false);
          setIsLoading(false);
        }
        if (requireAuth) {
          navigate({ to: "/admin/login" });
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, requireAuth]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(
        "Sign out error:",
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Unknown error",
      );
    }
    navigate({ to: "/admin/login" });
  };

  return { isLoading, user, isAdmin, error, signOut };
}
