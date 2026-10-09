# P. R. India Health Services — Repository Guidelines

> Operational guidelines and core conventions for developers and AI coding agents.

## Core Rules

1. **Database & Migrations:** Never modify existing SQL migrations directly. Always append a new sequential migration in `supabase/migrations/`.
2. **Database Security:**
   - Preserve Row Level Security (RLS) on all application tables.
   - Enforce `public.is_admin()` on admin routes and tables.
   - Use `SECURITY DEFINER` with `SET search_path = public` on all database RPC functions.
   - Retain `FOR UPDATE` row locks and unique partial indexes on assignment RPCs.
3. **Client-Side Security:**
   - Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend client code or `.env`.
   - Always sanitize errors passed to `console.error` (never dump raw Supabase error objects or SQL queries).
4. **Validation:**
   - After any change, run `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
