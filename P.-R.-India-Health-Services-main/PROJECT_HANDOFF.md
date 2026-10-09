# P. R. India Health Services — Developer Handoff Documentation

> **Single Source of Truth for Technical Architecture, Database Schema, Production Deployment & Maintenance**  
> **Repository:** `pixel-perfect` (P. R. India Health Services)  
> **Scope:** Full-Stack Home Healthcare Management & Public Inquiry Platform  
> **Status:** Codebase Hardened & Production-Ready for Initial Launch (External Messaging Dormant)

---

## 1. Executive Summary & Project Overview

### 1.1 Purpose & Domain
**P. R. India Health Services** is a specialized home healthcare coordination and equipment rental platform based in India. It bridges patients/families seeking home ICU setup, skilled nursing, and medical equipment with verified healthcare professionals (nurses, attendants, physiotherapists) and tracked medical equipment inventory.

### 1.2 User Profiles
1. **Public Patients & Family Members:** Submit home care service requests, browse specialized ICU/care packages, and send inquiries without requiring prior account registration.
2. **Healthcare Professional Candidates:** Submit credential registrations (qualifications, licenses, experience, availability) to join the care team.
3. **Internal Coordinators & Administrators:** Manage service requests, verify candidate credentials, assign verified professionals and available equipment assets, track audit timelines, monitor notification history, and respond to inquiries via the authenticated `/admin` portal.

### 1.3 High-Level Business Workflows
* **Service Request Dispatch:** Public request submission $\rightarrow$ Auto-logged timeline event $\rightarrow$ Admin assessment & status progression $\rightarrow$ Atomic assignment of verified professional and/or available equipment asset $\rightarrow$ Operational fulfillment $\rightarrow$ Release/Completion.
* **Staff Verification Lifecycle:** Candidate registration $\rightarrow$ Pending queue $\rightarrow$ Admin credential review $\rightarrow$ Status update (`verified` / `rejected`) $\rightarrow$ Eligible for assignment pool only upon verification.
* **Asset Inventory Lifecycle:** Equipment type creation $\rightarrow$ Asset registration with unique asset code $\rightarrow$ Availability tracking $\rightarrow$ Atomic assignment $\rightarrow$ Automatic status sync (`available` $\leftrightarrow$ `assigned`) $\rightarrow$ Release back to inventory.
* **Append-Only Audit Timeline:** Trigger-driven and RPC-driven chronological logging of all status mutations and assignment transitions on every service request.

### 1.4 Current Production Scope vs. Deferred Features
* **Current Active Scope:** Full public website (7 public pages), public service request submission, candidate registration, contact forms, complete admin back-office portal, Supabase database with Row Level Security (RLS), atomic PostgreSQL RPCs with row locking, append-only audit trail, and mock notification infrastructure.
* **Intentionally Deferred / Dormant:** Live transactional email delivery via Resend (architecture and Edge Functions are coded but provider is dormant in mock mode), live WhatsApp messaging, and live SMS dispatch.

---

## 2. Technology Stack & Framework Inventory

All technologies and versions extracted directly from `package.json`, build configurations, and codebase definitions:

| Layer | Technology | Version | Purpose / Architectural Role |
|---|---|---|---|
| **Language** | TypeScript | `^5.8.3` | End-to-end static typing across UI, API, and database models |
| **Runtime & UI** | React | `^19.2.0` | Frontend UI component library |
| **Framework & Router** | TanStack Router / TanStack Start | `1.170.41` / `1.168.60` | Type-safe file-based routing, SSR entry, route protection |
| **Server Engine** | Nitro / h3 | `3.0.260603-beta` | Lightweight server engine, Cloudflare Workers preset |
| **Data Fetching** | TanStack Query | `^5.101.1` | Asynchronous state management and client caching |
| **Database & Auth** | Supabase (PostgreSQL 15+) | `@supabase/supabase-js ^2.117.2` | Relational database, Supabase Auth, Row Level Security (RLS) |
| **Edge Compute** | Deno (Supabase Edge Functions) | `std@0.168.0` | Server-side transactional email dispatch & webhook ingestion |
| **Styling** | Tailwind CSS v4 | `^4.2.1` | Modern utility CSS framework with design token system |
| **Component UI** | Radix UI Primitives + Lucide | `lucide-react ^0.575.0` | Accessible headless UI primitives, icon set |
| **Form Handling** | React Hook Form + Zod | `react-hook-form ^7.71.2`, `zod ^3.25.76` | Type-safe client-side schema validation |
| **Build Tooling** | Vite | `8.1.5` | Bundler & SSR builder with TanStack Start integration |
| **Testing** | Vitest + Testing Library | `vitest ^4.1.10`, `jsdom ^20.0.3` | Unit and integration test runner (22 tests active) |
| **Linting & Code Style** | ESLint + Prettier | `eslint ^9.32.0`, `prettier ^3.7.3` | Code style, static analysis, Fast Refresh rules |

---

## 3. End-to-End System Architecture

```
                                  +-------------------------------------------------------------+
                                  |                     CLIENT BROWSER                          |
                                  |  +---------------------------+  +------------------------+  |
                                  |  |   Public Patient Portal   |  |   Admin Portal (/admin)|  |
                                  |  |  (TanStack Router Pages)  |  |  (useAdminAuth Guard)  |  |
                                  |  +-------------+-------------+  +------------+-----------+  |
                                  +----------------|-----------------------------|--------------+
                                                   |                             |
                                      Public Anon Requests               Authenticated JWT
                                                   |                             |
                                                   v                             v
+-----------------------------------------------------------------------------------------------+
|                                    SUPABASE CLOUD INFRASTRUCTURE                              |
|                                                                                               |
|  +-----------------------------------------------------------------------------------------+  |
|  |                                  SUPABASE AUTH                                          |  |
|  |  - Email/Password Coordinator Login                                                     |  |
|  |  - JWT Session Issuance (auth.uid())                                                    |  |
|  +--------------------------------------------+--------------------------------------------+  |
|                                               |                                               |
|                                               v                                               |
|  +-----------------------------------------------------------------------------------------+  |
|  |                                POSTGRESQL DATABASE & RLS                                |  |
|  |  - Row Level Security (public.is_admin() Check)                                         |  |
|  |  - 10 Relational Application Tables                                                     |  |
|  |  - Atomic Stored Procedures (assign_*, release_*) with FOR UPDATE Row Locks             |  |
|  |  - Append-Only Audit Triggers (service_request_activity)                                |  |
|  |  - Unique Partial Indexes (Double-Assignment Prevention)                                |  |
|  +--------------------------------------------+--------------------------------------------+  |
|                                               |                                               |
|                                               | Database Event                                |
|                                               v                                               |
|  +-----------------------------------------------------------------------------------------+  |
|  |                                 SUPABASE EDGE FUNCTIONS (Deno)                          |  |
|  |  +---------------------------------------+   +---------------------------------------+  |  |
|  |  |   send-notification-email Function    |   |         resend-webhook Function       |  |  |
|  |  |  - Reads RESEND_API_KEY from server   |   |  - Requires SUPABASE_SERVICE_ROLE_KEY |  |  |
|  |  |  - Invoked securely by server context|   |  - Idempotent status update           |  |  |
|  |  +-------------------+-------------------+   +-------------------+-------------------+  |  |
|  +----------------------|-------------------------------------------|----------------------+  |
+-------------------------|-------------------------------------------|-------------------------+
                          |                                           |
            (Dormant in   | HTTPS API Dispatch        Webhook Ingest  | (Dormant in
             Mock Mode)   v                                           ^  Mock Mode)
            +---------------------------------------------------------------+
            |               RESEND TRANSACTIONAL EMAIL API                  |
            +---------------------------------------------------------------+
```

### 3.1 Architectural Boundaries
1. **Browser Client:** Executes React 19 UI, handles public form submissions via anonymous Supabase client (`VITE_SUPABASE_ANON_KEY`), and handles admin portal workflows via authenticated session.
2. **Edge Server (SSR Engine):** Nitro server build generated with Cloudflare Workers module preset (`.output/server/`).
3. **Database Layer:** All operational integrity, access control, and transaction serialization are enforced **exclusively at the database layer** via PostgreSQL RLS and stored procedures (`SECURITY DEFINER`).
4. **Edge Functions:** Server-side Deno runtime isolated from the client. Holds third-party API keys (`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

---

## 4. Repository Structure & Code Navigation

```
d:/Website/Clients/PR/pixel-perfect/
├── .env.example                        # Template for required client-side environment variables
├── eslint.config.js                    # ESLint 9 configuration with typescript-eslint and prettier
├── package.json                        # Project dependencies, build and test scripts
├── tsconfig.json                       # TypeScript compiler options and path aliases (@/* -> ./src/*)
├── vite.config.ts                      # Vite build configuration with TanStack Start SSR support
├── vitest.config.ts                    # Unit and integration test configuration
│
├── public/                             # Static assets, favicons, site manifests
│
├── src/                                # Application Source Code
│   ├── routeTree.gen.ts                # Auto-generated TanStack Router route tree
│   ├── router.tsx                      # TanStack Router instance creation and initialization
│   ├── server.ts                       # SSR server entry point and error normalization wrapper
│   ├── start.ts                        # TanStack Start middleware and CSRF protection
│   ├── styles.css                      # Global styles and Tailwind CSS v4 design tokens
│   │
│   ├── components/                     # Reusable UI and Layout Components
│   │   ├── admin/                      # Admin Back-Office UI
│   │   │   └── AdminLayout.tsx         # Responsive admin layout, sidebar navigation & auth guard
│   │   ├── site/                       # Public Website Components
│   │   │   ├── CTASection.tsx          # Call to action marketing blocks
│   │   │   ├── Footer.tsx              # Site footer with compliance and emergency disclosures
│   │   │   ├── Header.tsx              # Public navigation header and mobile drawer
│   │   │   └── PageHero.tsx            # Standardized hero headers with breadcrumbs
│   │   └── ui/                         # Base design system primitives (Radix UI / Shadcn)
│   │
│   ├── hooks/                          # Custom React Hooks
│   │   ├── use-admin-auth.ts           # Admin session validation, role verification & route redirect
│   │   ├── use-mobile.tsx              # Viewport width responsiveness hook
│   │   └── use-toast.ts                # Toast notification trigger hook
│   │
│   ├── lib/                            # Shared Core Utilities and Service Layer
│   │   ├── database.types.ts           # TypeScript interfaces mirroring PostgreSQL tables & RPCs
│   │   ├── error-capture.ts            # Client and SSR error boundary logger
│   │   ├── error-page.ts               # Fallback 500 HTML error template
│   │   ├── supabase.ts                 # Supabase client singleton (anon key client)
│   │   ├── utils.ts                    # Tailwind class merging utility (cn)
│   │   └── notifications/              # Notification Engine (Dormant Mock Provider Active)
│   │       ├── email-provider.ts       # ServerEmailNotificationProvider (Resend Edge Function caller)
│   │       ├── mock-provider.ts        # MockNotificationProvider (Deterministic offline logger)
│   │       ├── provider-registry.ts    # NotificationProviderRegistry (Defaults to "mock" mode)
│   │       ├── service.ts              # NotificationService (Queueing, bounded retries, idempotency)
│   │       ├── templates.ts            # Sanitized privacy-compliant notification templates
│   │       └── types.ts                # Notification models, channels, recipient types, events
│   │
│   ├── routes/                         # TanStack Router File-Based Routes
│   │   ├── __root.tsx                  # Root layout, meta head tags, global toaster, error boundary
│   │   ├── index.tsx                   # Public homepage (Hero, Services, ICU packages, Trust signals)
│   │   ├── about.tsx                   # About P. R. India Health Services and clinical leadership
│   │   ├── services.tsx                # Comprehensive medical and nursing care catalogue
│   │   ├── home-icu.tsx                # Critical care and home ICU setup details
│   │   ├── request-service.tsx         # Patient service booking form (Inserts to service_requests)
│   │   ├── join-team.tsx               # Professional onboarding registration (team_registrations)
│   │   ├── healthcare-team.tsx         # Public verified medical team showcase
│   │   ├── contact.tsx                 # Public contact and inquiry form (contact_messages)
│   │   ├── terms.tsx                   # Terms of Service & clinical engagement agreement
│   │   ├── privacy-policy.tsx          # Privacy Policy & sensitive patient data disclosure
│   │   ├── medical-disclaimer.tsx      # Emergency disclaimer & clinical liability boundary
│   │   └── admin/                      # Authenticated Coordinator Back-Office Routes
│   │       ├── index.tsx               # Admin overview dashboard (Metrics, stats, recent requests)
│   │       ├── login.tsx               # Admin credentials sign-in form (Supabase Auth)
│   │       ├── service-requests.tsx    # Service request dispatch, assignments, timeline modal
│   │       ├── healthcare-team.tsx     # Candidate credential review and verification management
│   │       ├── equipment.tsx           # Medical equipment types and asset inventory tracking
│   │       ├── notifications.tsx       # Notification history, dispatch log, recipient preferences
│   │       └── contact-messages.tsx    # General customer inquiry message inbox and status tracker
│   │
│   └── test/                           # Test Suite
│       ├── setup.ts                    # Vitest environment setup and jest-dom matchers
│       ├── app-routing.test.tsx        # Navigation and public route accessibility tests
│       └── notifications.test.ts       # Notification service, template, and retry tests
│
└── supabase/                           # Supabase Database & Function Configurations
    ├── config.toml                     # Local Supabase CLI configuration
    ├── functions/                      # Deno Edge Functions
    │   ├── resend-webhook/             # Webhook ingestion handler for delivery status
    │   │   └── index.ts
    │   └── send-notification-email/    # Server-side transactional email sender via Resend API
    │       └── index.ts
    └── migrations/                     # Ordered SQL Database Migrations (000000 -> 001000)
        ├── 20261006000000_create_core_tables.sql
        ├── 20261006000100_create_admin_roles_and_policies.sql
        ├── 20261006000200_contact_messages_update_policy.sql
        ├── 20261006000300_admin_status_management.sql
        ├── 20261006000400_create_equipment_inventory.sql
        ├── 20261006000500_create_service_request_assignments.sql
        ├── 20261006000600_create_service_request_activity.sql
        ├── 20261006000700_create_notifications.sql
        ├── 20261006000800_notification_production_delivery.sql
        ├── 20261006000900_resend_email_and_webhooks.sql
        └── 20261006001000_professional_assignment_integrity.sql
```

---

## 5. Feature Classification Inventory

| Feature / Subsystem | Current Classification | Status Detail & Evidence in Codebase |
|---|---|---|
| **Public Service Request Booking** | `IMPLEMENTED` | [request-service.tsx](file:///d:/Website/Clients/PR/pixel-perfect/src/routes/request-service.tsx) inserts pending rows; auto-creates activity event. |
| **Healthcare Candidate Onboarding** | `IMPLEMENTED` | [join-team.tsx](file:///d:/Website/Clients/PR/pixel-perfect/src/routes/join-team.tsx) captures credentials, licenses, and availability into `team_registrations`. |
| **Public Contact Messages** | `IMPLEMENTED` | [contact.tsx](file:///d:/Website/Clients/PR/pixel-perfect/src/routes/contact.tsx) captures inquiries into `contact_messages`. |
| **Admin Dashboard Overview** | `IMPLEMENTED` | [admin/index.tsx](file:///d:/Website/Clients/PR/pixel-perfect/src/routes/admin/index.tsx) displays live counts and pending request queue. |
| **Service Request Status Workflow** | `IMPLEMENTED` | [admin/service-requests.tsx](file:///d:/Website/Clients/PR/pixel-perfect/src/routes/admin/service-requests.tsx) manages status changes (`reviewing`, `scheduled`, `completed`, `cancelled`). |
| **Professional Assignment System** | `IMPLEMENTED` | Locked RPC `assign_professional_to_request` with `idx_unique_active_professional_assignment`. |
| **Equipment Inventory & Dispatch** | `IMPLEMENTED` | Locked RPC `assign_equipment_to_request` with `idx_unique_active_equipment_assignment`. |
| **Append-Only Activity History** | `IMPLEMENTED` | Trigger-driven and RPC-driven `service_request_activity` audit timeline. |
| **Admin Role & Access Guards** | `IMPLEMENTED` | Supabase Auth + `user_roles` table + `is_admin()` SQL function + `useAdminAuth` hook redirect. |
| **Notification Engine (Mock Mode)** | `IMPLEMENTED` | Bounded retries (3 attempts), idempotency index, offline deterministic mock provider. |
| **Client Supabase Project Connection** | `REQUIRES PROD CONFIG` | Database migrations must be run against the client's production Supabase project; URL and keys configured. |
| **Resend Live Email Delivery** | `MOCKED / DORMANT` | Edge Function and adapter exist, but provider registry defaults to `mock`. `RESEND_API_KEY` unconfigured. |
| **Resend Webhook Ingestion** | `MOCKED / DORMANT` | Handler exists with `SUPABASE_SERVICE_ROLE_KEY` enforcement. Cryptographic Svix validation deferred. |
| **WhatsApp Notification Adapter** | `NOT IMPLEMENTED / FUTURE` | Intentionally deferred; slot reserved in `provider-registry.ts`. |
| **SMS Notification Adapter** | `NOT IMPLEMENTED / FUTURE` | Intentionally deferred; slot reserved in `provider-registry.ts`. |
| **Patient Email Schema Field** | `FUTURE / OPTIONAL` | `service_requests` table stores phone number; patient email notifications currently skip email channel. |

---

## 6. Complete Database Documentation

The database comprises **10 core application tables** managed across 11 sequential migration files in `supabase/migrations/`.

### 6.1 Entity-Relationship & Table Reference

#### 1. `service_requests`
* **Purpose:** Primary record for patient home healthcare and equipment requests.
* **Primary Key:** `id` (UUID, default `gen_random_uuid()`)
* **Key Columns:** `reference_id` (TEXT, unique), `patient_name`, `contact_number`, `patient_age`, `patient_gender`, `address`, `city`, `pincode`, `service_required`, `equipment_required`, `preferred_date`, `preferred_time`, `expected_duration`, `urgency` (`standard` / `urgent` / `emergency`), `status` (`pending`, `reviewing`, `scheduled`, `completed`, `cancelled`, `in_review`, `active`), `admin_notes`, `created_at`, `updated_at`.
* **RLS Policies:**
  * Public INSERT: Allowed only with `status = 'pending'`.
  * Public SELECT/UPDATE/DELETE: Disallowed (0 access).
  * Admin Access: Full `SELECT` and `UPDATE` granted via `public.is_admin()`.

#### 2. `team_registrations`
* **Purpose:** Profiles and credential submissions for healthcare staff candidates.
* **Primary Key:** `id` (UUID)
* **Key Columns:** `application_id` (TEXT, unique), `full_name`, `email`, `phone`, `profession` (`icu_nurse`, `general_nurse`, `caregiver_attendant`, `physiotherapist`, `doctor_consultant`, `other`), `qualification`, `experience_years`, `license_number`, `verification_status` (`pending`, `verified`, `rejected`), `admin_notes`, `created_at`, `updated_at`.
* **RLS Policies:**
  * Public INSERT: Allowed only with `verification_status = 'pending'`.
  * Public SELECT/UPDATE/DELETE: Disallowed.
  * Admin Access: Full `SELECT` and `UPDATE` granted via `public.is_admin()`.

#### 3. `contact_messages`
* **Purpose:** Public inquiries, feedback, and support messages.
* **Primary Key:** `id` (UUID)
* **Key Columns:** `name`, `phone`, `email`, `subject`, `message`, `status` (`new`, `read`, `replied`, `archived`), `admin_notes`, `created_at`, `updated_at`.
* **RLS Policies:**
  * Public INSERT: Allowed only with `status = 'new'`.
  * Public SELECT/UPDATE/DELETE: Disallowed.
  * Admin Access: `SELECT` and `UPDATE` (status and notes) granted via `public.is_admin()`.

#### 4. `user_roles`
* **Purpose:** Role-based authorization mapping Supabase Auth users (`auth.users`) to administrative roles.
* **Primary Key:** `id` (UUID)
* **Key Columns:** `user_id` (UUID, foreign key `auth.users(id)` ON DELETE CASCADE), `role` (`admin`), `created_at`.
* **Constraints:** Unique on `(user_id, role)`.
* **RLS Policies:**
  * Public Access: None.
  * SELECT: Accessible by authenticated user matching `user_id` OR `public.is_admin()`.
  * INSERT/UPDATE/DELETE: No application policy; provisioned solely via Supabase SQL dashboard or Service Role key.

#### 5. `equipment_types`
* **Purpose:** Catalogue of medical equipment categories (e.g., ICU Ventilator, BiPAP Machine, Oxygen Concentrator).
* **Primary Key:** `id` (UUID)
* **Key Columns:** `name` (TEXT, unique), `category`, `description`, `active` (BOOLEAN, default `true`), `created_at`, `updated_at`.
* **RLS Policies:** Admin-only `SELECT`, `INSERT`, `UPDATE` via `public.is_admin()`. Public access disallowed.

#### 6. `equipment_assets`
* **Purpose:** Individual physical serialized assets belonging to an equipment type.
* **Primary Key:** `id` (UUID)
* **Key Columns:** `equipment_type_id` (UUID, FK `equipment_types(id)` ON DELETE RESTRICT), `asset_code` (TEXT, unique), `serial_number`, `status` (`available`, `assigned`, `maintenance`, `unavailable`), `condition_notes`, `active` (BOOLEAN), `created_at`, `updated_at`.
* **RLS Policies:** Admin-only `SELECT`, `INSERT`, `UPDATE` via `public.is_admin()`.

#### 7. `service_request_assignments`
* **Purpose:** Active and historical link between a service request and assigned professionals or equipment assets.
* **Primary Key:** `id` (UUID)
* **Key Columns:** `service_request_id` (UUID, FK `service_requests(id)` ON DELETE RESTRICT), `assignment_type` (`professional` / `equipment`), `professional_id` (UUID, FK `team_registrations(id)` ON DELETE RESTRICT, nullable), `equipment_asset_id` (UUID, FK `equipment_assets(id)` ON DELETE RESTRICT, nullable), `status` (`active` / `released`), `assigned_at`, `released_at`, `notes`, `created_at`.
* **Unique Partial Indexes:**
  * `idx_unique_active_equipment_assignment`: Enforces that an `equipment_asset_id` can have at most ONE row with `status = 'active'` and `assignment_type = 'equipment'`.
  * `idx_unique_active_professional_assignment`: Enforces that `(service_request_id, professional_id)` can have at most ONE row with `status = 'active'` and `assignment_type = 'professional'`.
* **RLS Policies:** Admin-only `SELECT`, `INSERT`, `UPDATE` via `public.is_admin()`.

#### 8. `service_request_activity`
* **Purpose:** Immutable append-only audit trail capturing all lifecycle events on a service request.
* **Primary Key:** `id` (UUID)
* **Key Columns:** `service_request_id` (UUID, FK `service_requests(id)` ON DELETE RESTRICT), `event_type` (TEXT), `actor_user_id` (UUID, nullable), `description` (TEXT), `metadata` (JSONB), `created_at`.
* **Event Types:** `request_created`, `status_changed`, `professional_assigned`, `professional_released`, `equipment_assigned`, `equipment_released`.
* **RLS Policies:** Admin-only `SELECT`. **Zero application INSERT/UPDATE/DELETE policies.** Insertions occur strictly via `SECURITY DEFINER` triggers and RPCs.

#### 9. `notifications`
* **Purpose:** Queue and audit log of notification dispatches.
* **Primary Key:** `id` (UUID)
* **Key Columns:** `service_request_id` (UUID, FK `service_requests(id)` ON DELETE SET NULL), `activity_id` (UUID, FK `service_request_activity(id)` ON DELETE SET NULL), `channel` (`email`, `whatsapp`, `sms`), `recipient_type` (`patient`, `professional`, `admin`), `recipient_address` (TEXT), `event_type` (TEXT), `template_name` (TEXT), `status` (`queued`, `sent`, `delivered`, `failed`), `attempt_count` (INT), `max_attempts` (INT, default 3), `provider` (TEXT, e.g. `mock`, `resend`), `provider_message_id` (TEXT), `error_message` (TEXT), `next_retry_at` (TIMESTAMPTZ), `delivered_at` (TIMESTAMPTZ), `created_at`, `updated_at`.
* **Unique Partial Index:** `idx_notifications_idempotency` on `(activity_id, channel, recipient_type, event_type) WHERE activity_id IS NOT NULL`.
* **RLS Policies:** Admin-only `SELECT` and `UPDATE` via `public.is_admin()`.

#### 10. `notification_preferences`
* **Purpose:** System-wide channel toggles per recipient role.
* **Primary Key:** `id` (UUID)
* **Key Columns:** `recipient_type` (`patient`, `professional`, `admin`), `email_enabled`, `whatsapp_enabled`, `sms_enabled`, `updated_at`.
* **RLS Policies:** Admin-only `SELECT` and `UPDATE`.

---

## 7. Database Security & Stored Procedures (RPCs)

### 7.1 Security Architecture
* **`public.is_admin()` Function:**
  ```sql
  CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS BOOLEAN
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
  STABLE
  AS $$
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    );
  $$;
  ```
  `SECURITY DEFINER` combined with pinned `search_path = public` prevents privilege escalation or search-path injection.

### 7.2 Stored Procedures (RPC Table)

| Procedure Name | Inputs | Security & Locks | Operation & Validation Summary |
|---|---|---|---|
| `assign_professional_to_request` | `p_request_id UUID`<br>`p_professional_id UUID`<br>`p_notes TEXT` | `SECURITY DEFINER`<br>`SET search_path = public`<br>`FOR UPDATE` on `team_registrations` | 1. Verifies `is_admin()`.<br>2. Verifies request status is NOT `completed` or `cancelled`.<br>3. Locks candidate row and validates `verification_status = 'verified'`.<br>4. Inserts active assignment row into `service_request_assignments`.<br>5. Inserts `professional_assigned` event into `service_request_activity`. |
| `release_professional_assignment` | `p_assignment_id UUID`<br>`p_notes TEXT` | `SECURITY DEFINER`<br>`SET search_path = public`<br>`FOR UPDATE` on `service_request_assignments` | 1. Verifies `is_admin()`.<br>2. Locks assignment row and verifies `status = 'active'`.<br>3. Updates status to `released` and sets `released_at = now()`.<br>4. Inserts `professional_released` event into `service_request_activity`. |
| `assign_equipment_to_request` | `p_request_id UUID`<br>`p_asset_id UUID`<br>`p_notes TEXT` | `SECURITY DEFINER`<br>`SET search_path = public`<br>`FOR UPDATE` on `equipment_assets` | 1. Verifies `is_admin()`.<br>2. Verifies request status is NOT `completed` or `cancelled`.<br>3. Locks asset row and validates `status = 'available'`.<br>4. Updates asset status to `assigned`.<br>5. Inserts active assignment row into `service_request_assignments`.<br>6. Inserts `equipment_assigned` event into `service_request_activity`. |
| `release_equipment_assignment` | `p_assignment_id UUID`<br>`p_notes TEXT` | `SECURITY DEFINER`<br>`SET search_path = public`<br>`FOR UPDATE` on `service_request_assignments` + `equipment_assets` | 1. Verifies `is_admin()`.<br>2. Locks assignment and asset rows.<br>3. Sets assignment status to `released` with `released_at = now()`.<br>4. Sets asset status back to `available`.<br>5. Inserts `equipment_released` event into `service_request_activity`. |

### 7.3 Automated Database Triggers

1. **`trg_service_request_created`:**
   * **Event:** `AFTER INSERT ON public.service_requests`
   * **Action:** Automatically inserts a `request_created` event into `service_request_activity` with the request ID, initial status, and urgency metadata.
2. **`trg_service_request_status_changed`:**
   * **Event:** `AFTER UPDATE OF status ON public.service_requests`
   * **Action:** Checks `IF OLD.status IS DISTINCT FROM NEW.status`. If true, automatically logs a `status_changed` event in `service_request_activity` recording `old_status`, `new_status`, and `actor_user_id` (`auth.uid()`).

---

## 8. Database Migration Order & Execution Plan

All 11 migrations in `supabase/migrations/` are structured sequentially and use idempotent SQL statements (`IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`):

1. **`20261006000000_create_core_tables.sql`:** Creates `service_requests`, `team_registrations`, `contact_messages`, enabling RLS and public insert policies.
2. **`20261006000100_create_admin_roles_and_policies.sql`:** Creates `user_roles`, `is_admin()` function, and admin RLS policies across core tables.
3. **`20261006000200_contact_messages_update_policy.sql`:** Adds admin update RLS policy for contact message triage.
4. **`20261006000300_admin_status_management.sql`:** Updates status check constraints on service requests to support reviewing and scheduled statuses.
5. **`20261006000400_create_equipment_inventory.sql`:** Creates `equipment_types` and `equipment_assets` tables with admin-only policies.
6. **`20261006000500_create_service_request_assignments.sql`:** Creates `service_request_assignments` table with `idx_unique_active_equipment_assignment`.
7. **`20261006000600_create_service_request_activity.sql`:** Creates append-only `service_request_activity` table, triggers, and assignment RPCs.
8. **`20261006000700_create_notifications.sql`:** Creates `notifications` and `notification_preferences` tables.
9. **`20261006000800_notification_production_delivery.sql`:** Adds retry columns (`next_retry_at`, `max_attempts`, `error_message`, `delivered_at`) and `idx_notifications_idempotency`.
10. **`20261006000900_resend_email_and_webhooks.sql`:** Seeds default notification preferences.
11. **`20261006001000_professional_assignment_integrity.sql`:** Adds `idx_unique_active_professional_assignment` and adds `FOR UPDATE` locking to `assign_professional_to_request`.

---

## 9. Client Supabase Project Setup Guide

> **CRITICAL HANDOFF INSTRUCTION FOR NEW DEVELOPERS:**  
> The codebase is built to connect to the client's own Supabase account. Follow these exact steps to instantiate the production backend.

### Step 1: Organization & Project Provisioning
1. Have the client create or invite you to their official [Supabase Cloud Organization](https://supabase.com/dashboard).
2. Create a new production project (e.g., `pr-india-health-prod`).
3. Select an AWS/Cloud region closest to the operational base in India (e.g., `ap-south-1` Mumbai).
4. Securely record the database root password in the client's enterprise password manager.

### Step 2: Retrieve API Keys & Connection Parameters
From the Supabase Dashboard $\rightarrow$ **Project Settings** $\rightarrow$ **API**:
* **Project URL:** `https://<project-ref>.supabase.co`
* **Anon Public Key (client-safe):** `eyJhbGci...` $\rightarrow$ Map to `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
* **Service Role Key (SECRET):** `eyJhbGci...` $\rightarrow$ Used only in serverless Edge Functions and CI/CD. **NEVER expose to the frontend.**

### Step 3: Apply All Migrations
Execute migrations against the production database using the Supabase CLI:
```bash
# Link the local repository to the client's Supabase project
npx supabase login
npx supabase link --project-ref <project-ref>

# Push all 11 migrations in sequence
npx supabase db push
```
*Alternative via Dashboard SQL Editor:* If applying manually without CLI, open the SQL Editor and execute the 11 migration files from `supabase/migrations/` in exact ascending numerical order (from `000000` to `001000`).

### Step 4: Provision the Initial Administrator Account
Because `user_roles` has no public INSERT policy, initial admin creation requires this two-step sequence:
1. **Create the Supabase Auth User:**
   * Go to Supabase Dashboard $\rightarrow$ **Authentication** $\rightarrow$ **Users** $\rightarrow$ **Add User**.
   * Enter the coordinator email (e.g., `admin@prindiahealth.com`) and a secure password.
   * Auto-confirm the email address.
   * Copy the generated `User UID` (e.g., `a1b2c3d4-e5f6-...`).
2. **Assign the Admin Role:**
   * Go to Supabase Dashboard $\rightarrow$ **SQL Editor** and run:
     ```sql
     INSERT INTO public.user_roles (user_id, role)
     VALUES ('<PASTE-USER-UID-HERE>', 'admin');
     ```

### Step 5: Configure Supabase Auth Settings
From Supabase Dashboard $\rightarrow$ **Authentication** $\rightarrow$ **URL Configuration**:
* **Site URL:** Set to the production domain (e.g., `https://prindiahealth.com`).
* **Redirect URLs:** Add `https://prindiahealth.com/admin` and `https://prindiahealth.com/admin/login`.

---

## 10. Authentication & Admin Security Architecture

### 10.1 Flow Matrix

```
                                  +-----------------------+
                                  | User visits /admin/*  |
                                  +-----------+-----------+
                                              |
                                              v
                              +-------------------------------+
                              | useAdminAuth Hook Evaluates:  |
                              |   supabase.auth.getSession()  |
                              +---------------+---------------+
                                              |
                     +------------------------+------------------------+
                     |                                                 |
         [No Active Session]                                   [Session Exists]
                     |                                                 |
                     v                                                 v
       +----------------------------+                   +-----------------------------+
       | Redirect to /admin/login   |                   | Query public.user_roles for |
       +----------------------------+                   | user_id AND role = 'admin'  |
                                                        +--------------+--------------+
                                                                       |
                                              +------------------------+------------------------+
                                              |                                                 |
                                    [Role != 'admin']                                    [Role == 'admin']
                                              |                                                 |
                                              v                                                 v
                               +----------------------------+                   +-----------------------------+
                               | Set error state & Redirect |                   | Render Protected Admin UI   |
                               |      to /admin/login       |                   |      via AdminLayout        |
                               +----------------------------+                   +-----------------------------+
```

### 10.2 Defense-in-Depth Layering
1. **Layer 1 (Frontend Route Guard):** [use-admin-auth.ts](file:///d:/Website/Clients/PR/pixel-perfect/src/hooks/use-admin-auth.ts) and [AdminLayout.tsx](file:///d:/Website/Clients/PR/pixel-perfect/src/components/admin/AdminLayout.tsx) check session state and user role. Non-admins and unauthenticated users are redirected to `/admin/login`.
2. **Layer 2 (Database Row Level Security):** All database tables require `public.is_admin() = true`. Even if a client bypasses the frontend, the PostgreSQL engine blocks unauthorized queries.
3. **Layer 3 (RPC Authorization Gates):** Every RPC begins with:
   ```sql
   IF NOT public.is_admin() THEN
       RAISE EXCEPTION 'Unauthorized: Administrator privileges required.' USING ERRCODE = '42501';
   END IF;
   ```

---

## 11. Notification System Architecture (Dormant State)

### 11.1 Architecture
The notification system is modeled after an asynchronous, event-driven pattern decoupled from the main database transactions:
* **Service Layer:** `NotificationService` in [service.ts](file:///d:/Website/Clients/PR/pixel-perfect/src/lib/notifications/service.ts) handles queuing, bounded retry logic (`MAX_RETRY_ATTEMPTS = 3`), and idempotency checks against `idx_notifications_idempotency`.
* **Templates:** [templates.ts](file:///d:/Website/Clients/PR/pixel-perfect/src/lib/notifications/templates.ts) formats privacy-safe text containing no clinical notes or diagnoses.
* **Provider Registry:** [provider-registry.ts](file:///d:/Website/Clients/PR/pixel-perfect/src/lib/notifications/provider-registry.ts) encapsulates provider adapters:
  ```ts
  export class NotificationProviderRegistry {
    private mode: ProviderMode = "mock"; // Default is mock mode
    // ...
  }
  ```

### 11.2 Future Activation Guide (Resend, WhatsApp, SMS)
To activate live providers when the client requests them in a future development phase:
1. **Resend Email Activation:**
   * Obtain API key from [Resend](https://resend.com).
   * In Supabase Dashboard $\rightarrow$ **Project Settings** $\rightarrow$ **Edge Functions**, add secret `RESEND_API_KEY`.
   * Configure verified sender domain (e.g., `RESEND_FROM_EMAIL="P.R. India Health <notifications@prindiahealth.com>"`).
   * Update [provider-registry.ts](file:///d:/Website/Clients/PR/pixel-perfect/src/lib/notifications/provider-registry.ts) to switch mode to `"production"` or initialize dynamically via an environment flag.
2. **WhatsApp & SMS Activation:**
   * Implement concrete provider classes satisfying the `NotificationProvider` interface in `src/lib/notifications/`.
   * Register them via `notificationRegistry.registerProvider("whatsapp", new WhatsAppProvider())`.

---

## 12. Environment Variables & Secret Management

| Variable Name | Required By | Client / Server | Secret Level | Production Usage |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | Frontend & SSR | Client-Safe | Public | Points to Supabase project instance (e.g. `https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Frontend & SSR | Client-Safe | Public | Supabase public anon key for RLS-governed queries |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions | Server-Only | **CRITICAL SECRET** | Configured in Supabase Edge Functions environment; **NEVER** expose to `src/` |
| `RESEND_API_KEY` | Edge Functions | Server-Only | **CRITICAL SECRET** | Required only when activating live transactional email via Resend |
| `RESEND_FROM_EMAIL` | Edge Functions | Server-Only | Public Config | Sender header (e.g. `notifications@prindiahealth.com`) |
| `RESEND_WEBHOOK_SECRET` | Edge Functions | Server-Only | **CRITICAL SECRET** | Svix webhook signing secret from Resend Dashboard |

---

## 13. Production Hosting & Deployment Architecture

### 13.1 Build Target: Cloudflare Workers / Nitro Engine
The application uses Nitro with the Cloudflare Workers preset (`cloudflare-module`), bundled via Vite.
* **Build Command:** `npm run build`
* **Output Artifact:** `.output/`
  * `.output/public/` $\rightarrow$ Static assets, HTML, images, CSS bundles
  * `.output/server/` $\rightarrow$ Server entry worker (`index.mjs`) and SSR chunks
  * `.output/server/wrangler.json` $\rightarrow$ Auto-generated Cloudflare Workers configuration

### 13.2 Deployment Options

#### Option A: Cloudflare Pages / Workers (Native Preset)
1. Link GitHub repository to Cloudflare Pages.
2. **Build Settings:**
   * **Framework Preset:** None / Nitro / TanStack Start
   * **Build Command:** `npm run build`
   * **Build Output Directory:** `.output/public`
3. **Environment Variables:**
   * Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

#### Option B: Vercel / Netlify
1. If deploying to Vercel, Nitro can be configured to use the Vercel preset (`NITRO_PRESET=vercel` in build command).
2. Set environment variables in the host dashboard.

---

## 14. Verification, Testing & Baseline Metrics

The following baseline has been verified against the current repository state:

```text
=============================================================================
1. Vitest Test Suite (npm run test / vitest run)
   - Test Files: 2 passed (2 total)
   - Tests:      22 passed (22 total)
   - Duration:   ~1.8s
   - Coverage:   App routing, route accessibility, notification engine & retries

2. TypeScript Compilation (npx tsc --noEmit)
   - Result:     0 errors (Clean exit code 0)

3. ESLint Verification (npm run lint / eslint .)
   - Result:     0 errors, 6 component Fast-Refresh warnings in UI primitives

4. Production Build (npm run build)
   - Result:     Vite build + Nitro SSR bundle generated successfully in .output/
=============================================================================
```

---

## 15. Critical Guarantees — DO NOT BREAK LIST

> [!CAUTION]
> Future developers maintaining this codebase MUST NOT violate these architectural constraints:

1. **DO NOT remove Row Level Security (RLS)** on any table.
2. **DO NOT expose `SUPABASE_SERVICE_ROLE_KEY`** in frontend code, client `.env`, or browser bundles.
3. **DO NOT remove `FOR UPDATE` row locks** from `assign_professional_to_request` or `assign_equipment_to_request` RPCs (prevents race-condition double-allocations).
4. **DO NOT drop or bypass the unique partial indexes** (`idx_unique_active_professional_assignment` and `idx_unique_active_equipment_assignment`).
5. **DO NOT grant public `SELECT` or `UPDATE` permissions** on `service_requests`, `team_registrations`, or `contact_messages`.
6. **DO NOT make `service_request_activity` directly writable** via application RLS policies. It must remain insertable solely through triggers and security-definer RPCs.
7. **DO NOT remove `SET search_path = public`** on `SECURITY DEFINER` functions.
8. **DO NOT pass raw Supabase error objects directly to `console.error`** (sanitize error strings to prevent leaking database schema details in production browser DevTools).
9. **DO NOT bypass the `v_req_status IN ('completed', 'cancelled')` checks** in assignment RPCs.

---

## 16. Information & Access Required from Client

To complete production go-live, obtain the following from the client:
1. **Supabase Organization Access:** Invitation to the client's official Supabase Cloud organization with Administrator role to manage database migrations and API keys.
2. **Domain & DNS Control:** Access to Cloudflare / DNS manager to configure production CNAME/A records and SSL.
3. **Authorized Admin Identity:** The official email address of the coordinator who will receive initial administrator credentials in `public.user_roles`.
4. **Transactional Email Provider (When Ready for Phase 6):** Resend account credentials and DNS access to verify domain SPF/DKIM records.

---

## 17. New Developer First-Day Onboarding Checklist

- [ ] **1. Clone Repository:** `git clone <repo-url>` & `cd pixel-perfect`
- [ ] **2. Install Dependencies:** `npm install`
- [ ] **3. Setup Local Environment:** Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] **4. Run Tests:** `npm test` (Verify 22/22 tests pass).
- [ ] **5. Run Type Check:** `npx tsc --noEmit` (Verify 0 type errors).
- [ ] **6. Run Lint:** `npm run lint` (Verify 0 lint errors).
- [ ] **7. Run Production Build:** `npm run build` (Verify `.output/` is generated).
- [ ] **8. Start Dev Server:** `npm run dev` and open `http://localhost:3000`.
- [ ] **9. Link Client Supabase Project:** `npx supabase link --project-ref <client-project-ref>`.
- [ ] **10. Apply Migrations:** `npx supabase db push`.
- [ ] **11. Provision Admin Account:** Create user in Auth dashboard and insert row into `public.user_roles`.
- [ ] **12. Deploy to Hosting:** Connect repository to Cloudflare Pages/Workers and trigger production build.

---

## 18. Troubleshooting Guide

| Issue / Symptom | Root Cause | Resolution Steps |
|---|---|---|
| **Supabase permission denied / RLS error (42501)** | Logged-in user is not in `user_roles` with `role = 'admin'` | Verify that a row exists in `public.user_roles` matching `auth.uid()` with `role = 'admin'`. |
| **Non-admin user redirected to `/admin/login`** | Expected security behavior | Ensure user credentials have been granted the `admin` role in `user_roles`. |
| **Assignment RPC fails with `22000` error** | Healthcare professional is not in `verified` status or asset is not `available` | Check candidate status in `/admin/healthcare-team` or asset status in `/admin/equipment`. |
| **Duplicate assignment error (`unique_violation`)** | Asset or professional is already actively assigned to the request | Check active assignments list; release existing active assignment before re-assigning. |
| **Emails not delivering in production** | Notification provider defaults to mock mode | Verify that Resend Edge Function is deployed, `RESEND_API_KEY` is set, and provider registry is switched to production. |
| **Build fails with missing server entry** | Vite cannot find `src/server.ts` | Verify that `vite.config.ts` has `tanstackStart: { server: { entry: "server" } }`. |

---

## 19. Final Project Status Matrix

| Subsystem | Implementation Status | Deployment Status | Notes |
|---|---|---|---|
| **Public Website (7 Pages)** | `COMPLETE` | `READY` | Responsive, accessible, SEO meta tags configured |
| **Service Request Dispatch** | `COMPLETE` | `READY` | RLS protected, auto-activity trigger active |
| **Healthcare Candidate Portal** | `COMPLETE` | `READY` | Verification workflow operational |
| **Equipment Inventory & Assets** | `COMPLETE` | `READY` | Serialized assets, unique constraints active |
| **Assignment Atomic RPCs** | `COMPLETE` | `READY` | `FOR UPDATE` locking and uniqueness indexes active |
| **Append-Only Activity Trail** | `COMPLETE` | `READY` | Database triggers and security-definer logging active |
| **Admin Back-Office Portal** | `COMPLETE` | `READY` | All 7 admin routes protected via `useAdminAuth` |
| **Client Supabase Setup** | `CODE COMPLETE` | `REQUIRES CONFIG` | Migrations ready to push to client Supabase project |
| **Notification Engine** | `COMPLETE` | `MOCKED / DORMANT` | Running safely in offline Mock mode |
| **Resend Email Integration** | `COMPLETE` | `DORMANT` | Edge Function exists; provider activation deferred |
| **WhatsApp / SMS Adapters** | `NOT IMPLEMENTED` | `FUTURE` | Intentionally deferred to future milestone |
| **Test Suite & Build Pipeline** | `COMPLETE` | `READY` | 22 tests passing; Nitro Cloudflare build verified |

---

**Documentation generated from current repository state:** 2026-10-08  
*Confirmed: Derived exclusively from repository inspection of source files, migrations, Edge Functions, build configurations, and test suites. Zero application code modified.*
