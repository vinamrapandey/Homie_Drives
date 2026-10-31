# Homie Drives — Master Engineering Roadmap

* **Architecture Invariant**: Foundational agent fleet and booking operations must be ready before live customer bookings are accepted. Do not start a milestone until prerequisites are verified.

---

## Roadmap Milestones

### 🟢 PHASE 0: Recovery & Stabilization (Current Milestone)
* Freeze codebase and isolate deployment failure root causes.
* Verify GitHub repository alignment on branch `main`.
* Author the 14 mandatory architecture and technical specifications in `docs/` and root `AGENTS.md`.
* Ensure zero TypeScript compilation and lint errors.

### 🟢 PHASE 1: Customer Website & Design System (Completed)
* Mobile-first responsive website following Mobbin automotive reference.
* Expanded domestic Indian fleet (Mahindra Thar Roxx, Nexon EV, Scorpio-N, Innova HyCross).
* Zero-dependency multi-angle vehicle touch carousel (`CarImageCarousel.tsx`).
* Interactive 3-tier condition pricing engine with dynamic recalculation (`CarConditionSelector.tsx`).
* 4-Step checkout drawer with damage protection plans and simulated DigiLocker KYC (`ReservationModal.tsx`).
* Interactive road trip getaway planner with real-time highway toll and fuel calculations (`TripsTab.tsx`).
* Live digital pass with interactive keyless smart remote fob simulator (`PassTab.tsx`).

### 🟡 PHASE 2: Supabase Database, Authentication & Permissions (Next Milestone)
* Provision Supabase PostgreSQL instance.
* Run initial schema migration: `profiles`, `user_roles`, `vehicles`, `pickup_locations`, `bookings`.
* Configure Supabase Auth (Email OTP and Phone SMS).
* Enforce Row Level Security (RLS) policies for customers, agents, and administrators.
* Integrate server-side role validation in Next.js Server Actions.

### ⚪ PHASE 3: Trip Planning & Production Routing
* Replace static road trip data with dynamic routing using Leaflet/Mappls/Google Maps API.
* Real-time NHAI FASTag toll plaza fee retrieval.
* Dynamic fuel price lookup across Delhi, Haryana, and Uttar Pradesh.

### ⚪ PHASE 4: Concurrency-Safe Booking & Availability Engine
* Implement PostgreSQL `btree_gist` exclusion constraints.
* Real-time availability blocks preventing simultaneous double reservations.
* Server-side booking validation and cancellation handling.

### ⚪ PHASE 5: Agent & Master Administration Operations
* Implement `/agent` field portal for hub staff.
* Implement `/admin` company executive portal for fleet assignment, rate tuning, and audit logs.
* Role-protected server middleware and layouts.

### ⚪ PHASE 6: Pickup OTP, Inspections, Agreements & Returns
* SMS-based pickup OTP verification on customer vehicle handover.
* Compulsory 360° return inspection video upload to Supabase Private Storage.
* Digital rental agreement generation with e-signature.

### ⚪ PHASE 7: Long-Term Rentals & Advanced Pricing
* Multi-month subscription billing (1–6 months).
* Dynamic seasonal demand surge and weekend pricing rules.

### ⚪ PHASE 8: Telematics Integration, PWA & Expansion
* Real OBD-II IoT telematics integration (moving beyond "GPS NOT CONNECTED").
* Installable Progressive Web App (PWA) with push notifications.
* Expansion to Mumbai, Bengaluru, and Chandigarh hubs.

