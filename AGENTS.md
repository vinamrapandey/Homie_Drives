<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# HOMIE DRIVES — PERMANENT AGENT OPERATING DIRECTIVE

This file defines mandatory behavioral, architectural, and development rules for all AI coding assistants working in the Homie Drives codebase.

---

## 1. Product Identity & Business Model
* **Product Name**: Homie Drives
* **Core Service**: Car rental and flexible vehicle access platform in Delhi NCR, India (expanding to other tier-1/tier-2 Indian cities).
* **Initial Release Constraints**:
  * Same-hub pickup and return across all initial reservations.
  * Pay at pickup for initial operational rollouts.
  * Fleet is presented to customers as Homie Drives' unified managed fleet.
  * Internally, vehicles are assigned to specific operational agents, governed by a Master Administrator.
* **Pricing Rules**: Configurable daily base rates (provisional range: ₹2,499–₹24,999/day). **Never hardcode business prices** throughout UI components; all rates, deposits, and fee percentages must be driven by data models and pricing configuration engines.

---

## 2. The Three Connected Application Areas
1. **Customer Website** (`/`, `/plan`, `/ride`, `/profile`, `/cars/[slug]`):
   * Follow the authentic soft sage-green luxury design system (`#50644E`, `#F3F6F1`, rounded-3xl cards, touch-native multi-angle car carousel, floating summary sheets, bottom nav pill bar).
   * **Do not replace with generic templates**.
2. **Agent Portal** (`/agent`):
   * Operational dashboard, assigned fleet, availability toggle (offline/maintenance), booking queue, customer pickup OTP verification, mandatory check-in/return inspection video uploads, handover records, fleet status.
   * Scoped strictly to the authenticated agent's assigned vehicles.
3. **Master Administration Portal** (`/admin`):
   * System-wide dashboard, agent management, master vehicle inventory, agent assignments/reassignments, booking oversight, pricing controls, hub locations, audit logs, platform configuration.
   * **Security Rule**: Never rely on frontend route hiding for authorization. Enforce all permissions server-side and via database Row Level Security (RLS).

---

## 3. Technology Stack & Coding Standards
* **Framework**: Next.js (App Router), React 19, TypeScript (strict mode).
* **Styling**: Tailwind CSS, custom design tokens in `globals.css`, Lucide icons.
* **Database & Auth**: Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS), Supabase Storage for private media (inspections, documents).
* **Validation**: Zod validation on all server action payloads and endpoints.
* **Deployment**: Vercel for hosting; GitHub as the single source of truth (`main` branch for production).
* **Maps / Telematics Boundary**:
  * Leaflet/Mappls for interactive regional map visualizations.
  * **Telematics Rule**: Until real OBD-II / IoT hardware is integrated, **never display simulated fake live GPS coordinates** or claim live satellite tracking. Display explicit "GPS NOT CONNECTED" status.

---

## 4. Architectural Invariants & Safety Guardrails
1. **Concurrency Protection**: Prevent overlapping vehicle bookings using database-level locking and exclusion constraints (`btree_gist` / `tsrange`).
2. **Operational Status vs. Calendar Availability**: Keep vehicle maintenance/decommission status separate from date-specific reservation blocks.
3. **Credential Isolation**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to client-side bundles or `NEXT_PUBLIC_*` environment variables.
4. **Auditability**: All critical lifecycle transitions (booking creation, OTP verification, inspection uploads, vehicle assignment changes) must generate immutable audit log records.
5. **Documentation Integrity**: Keep all specifications in `docs/` accurate to what is **actually implemented** vs. **planned**. Never mark future roadmap milestones as completed.
