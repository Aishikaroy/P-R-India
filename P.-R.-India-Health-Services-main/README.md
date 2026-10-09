# P. R. India Health Services

> **Enterprise Home Healthcare Coordination & Critical Care Management Platform**  
> Coordinated home ICU setup, skilled nursing care, medical equipment rentals, and healthcare professional management across India.

---

## Overview

**P. R. India Health Services** is a full-stack digital platform designed to bridge patients and families with verified healthcare professionals and tracked medical equipment inventory. It provides an intuitive public portal for booking specialized healthcare services and an authenticated administrative back-office for dispatch, staff credential verification, asset tracking, and audit logging.

---

## Features

### Public Healthcare Portal
* **Service Request Dispatch:** Direct online booking for Home ICU, 24/7 skilled nursing, doctor visits, physiotherapy, and medical equipment with urgency classification.
* **Healthcare Staff Onboarding:** Professional credential submission portal for ICU nurses, general nurses, attendants, and physiotherapists with license validation.
* **Inquiry & Contact System:** Direct contact and consultation inquiry pipeline.
* **Compliance & Transparency:** Full medical disclaimers, emergency response guidelines, terms of clinical engagement, and patient data privacy policies.

### Administrative Management Console (`/admin`)
* **Live Overview Dashboard:** Operational statistics, urgent request tracking, and real-time candidate queue metrics.
* **Service Request Coordination:** End-to-end status lifecycle management (`pending` $\rightarrow$ `reviewing` $\rightarrow$ `scheduled` $\rightarrow$ `completed` / `cancelled`).
* **Atomic Professional Assignment:** Concurrency-locked assignment of verified medical staff to service requests with automatic timeline auditing.
* **Serialized Equipment Inventory:** Asset registry, availability tracking, and atomic assignment/release workflows.
* **Candidate Verification Workflow:** Credential review and verification management for healthcare providers.
* **Append-Only Activity History:** Immutable chronological audit logs for all request mutations.
* **Notification Engine:** Event-driven notification infrastructure with bounded retries and idempotency protection (runs in offline Mock mode by default).

---

## Technology Stack

* **Frontend:** React 19, TypeScript, TanStack Router, TanStack Query, Tailwind CSS v4, Radix UI Primitives, Lucide Icons
* **Server & Routing:** TanStack Start, Nitro Engine (Cloudflare Workers module preset), Vite
* **Database & Auth:** Supabase (PostgreSQL 15+), Supabase Auth, Row Level Security (RLS), Atomic Stored Procedures (PL/pgSQL)
* **Testing:** Vitest, Testing Library, JSDOM
* **Tooling & Standards:** ESLint 9, Prettier, TypeScript strict mode

---

## Getting Started

### Prerequisites
* **Node.js:** `v20.x` or `v22.x` (LTS recommended)
* **npm:** `v10.x+` (or Bun / pnpm)
* **Supabase Project:** A Supabase account with PostgreSQL database

### 1. Clone & Install
```bash
git clone <repository-url>
cd pixel-perfect
npm install
```

### 2. Configure Environment Variables
Copy the environment template and configure your Supabase connection parameters:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Database Migrations
Apply the 11 ordered database migrations to your Supabase instance:
```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### 4. Start Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts local development server with HMR |
| `npm run build` | Compiles production bundle and Nitro server worker in `.output/` |
| `npm run preview` | Previews production build locally |
| `npm test` | Runs all Vitest test suites |
| `npm run lint` | Runs ESLint validation across codebase |
| `npm run format` | Formats all files using Prettier |

---

## Security Architecture

1. **Row Level Security (RLS):** Enabled across all 10 application tables. Public access is strictly constrained to `INSERT` with initial pending statuses.
2. **Atomic Stored Procedures:** Assignment operations execute via `SECURITY DEFINER` RPCs with `FOR UPDATE` row locking to eliminate race conditions.
3. **Double-Assignment Prevention:** Partial unique indexes (`idx_unique_active_professional_assignment` and `idx_unique_active_equipment_assignment`) enforce database-level uniqueness.
4. **Credential Isolation:** Service-role keys and third-party secrets are confined strictly to serverless Edge Functions and never exposed to the client bundle.
5. **Sanitized Error Logging:** Production client error handling avoids exposing internal database schemas, query strings, or raw error objects in browser consoles.

---

## Documentation

For full architectural blueprints, database schema references, and client handoff instructions, refer to:
* [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md) — Comprehensive technical handoff & production setup guide.

---

## License

Copyright © 2026 P. R. India Health Services. All rights reserved.
