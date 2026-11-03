# Homie Drives — Backend Features & Technical Parameters Inventory

This document provides a comprehensive inventory of all **backend, architectural, algorithmic, and infrastructure capabilities** currently implemented and verified in the Homie Drives platform, as well as upcoming purely technical features. 

These capabilities are system-level, non-configurable by standard customers, and serve as candidates for selective exposure and monitoring inside the **Master Admin Portal (`/admin`)**.

---

## 1. Implemented & Verified Backend Systems

### A. Concurrency & Temporal Exclusion Engine
* **Technology**: PostgreSQL `btree_gist` extension, `TSTZRANGE` temporal range exclusion.
* **Mechanism**: 
  - Prevents overlapping reservations for the same vehicle at the database level.
  - Generates deterministic PostgreSQL `23P01` exclusion constraint traps and emits human-readable conflict errors.
  - Automatically locks the vehicle upon reservation creation and releases the lock only when transitioning to `closed` or `cancelled`.
* **Verification Status**: Verified via Automated Test Suite (`scripts/verify-e2e-lifecycle.mjs` - Suite 3).
* **Admin Portal Candidate**:
  - [x] **Live Exclusion Range Inspector**: Implemented & Live in `/admin` with visual `TSTZRANGE` temporal lock inspector, real-time lock engagement badges, and emergency release overrides.

---

### B. Dynamic Pricing & Multiplier Engine
* **Technology**: Server actions (`src/actions/pricing.ts`), strict Zod validation schema.
* **Mechanism**:
  - Base daily rental calculation with automatic tier multipliers:
    - **Showroom Pristine**: `+15%` ($1.15\times$)
    - **Executive Mint**: `1.0\times` (Baseline)
    - **Touring / Value**: `-15%` ($0.85\times$)
  - Statutory Indian GST breakdown: CGST $9\%$ + SGST $9\%$ ($18\%$ total GST under SAC 996601).
  - Platform facilitation fee ($5\%$).
  - Fastag buffer preload (₹1,000 standard).
* **Verification Status**: Verified via Automated Test Suite (Suite 1).
* **Admin Portal Candidate**:
  - [x] Base Daily Rate and Security Deposit modifier currently live in `/admin`.
  - [x] **Global Fee Multiplier Tuner**: Dynamic sliders and inputs for GST percentage, platform fee %, FASTag preloads, seasonal condition tier multipliers ($1.15\times$, $0.85\times$), and high-demand surge pricing toggle live in `/admin`.

---

### C. Deposit Settlement & Zero-Floor Financial Reconciliation
* **Technology**: Server actions (`src/actions/settlement.ts`), PostgreSQL audit logging.
* **Mechanism**:
  - Compares pre-handover vs return odometer readings ($\Delta\text{ km}$).
  - Automatically itemizes deductions: FASTag toll plaza usage, excess kilometers beyond trip quota, sanitization/damage penalties.
  - Computes net refund = $\max(0, \text{Deposit Held} - \text{Total Deductions})$ (**Zero Floor Invariant**: customer refund can never result in a negative debit).
* **Verification Status**: Verified via Automated Test Suite (Suite 2).
* **Admin Portal Candidate**:
  - [x] **Financial Escrow & Deposit Ledger**: Live in `/admin` with master overview of all active deposits held in escrow, automated FASTag toll deductions, excess km penalties, dispute adjudication, and zero-floor bank refund dispatch statuses.

---

### D. Booking Lifecycle State Machine
* **Technology**: PostgreSQL enum states, transition validator (`src/lib/bookingStateMachine.ts` & actions).
* **Mechanism**:
  - Strict forward-only lifecycle transitions:
    $$\text{pending\_pickup} \longrightarrow \text{verified\_handover} \longrightarrow \text{returned\_inspected} \longrightarrow \text{closed}$$
  - Enforces invariant: `closed` or `cancelled` bookings can never transition back to any active state.
  - Re-triggers Next.js cache revalidation (`revalidatePath`) on state change.
* **Verification Status**: Verified via Automated Test Suite (Suite 3).
* **Admin Portal Candidate**:
  - [x] **State Machine Override Terminal**: Implemented & Live in `/admin` with visual 4-step lifecycle tracker, manual transition controls, and emergency cancellation with lock release.

---

### E. Immutable Cryptographic Audit Logging
* **Technology**: PostgreSQL `public.audit_logs`, SHA-256 payload hashing.
* **Mechanism**:
  - Generates immutable records on all state mutations (`BOOKING_CREATED`, `OTP_VERIFIED`, `INSPECTION_RECORDED`, `DEPOSIT_SETTLED`, `VEHICLE_HUB_REASSIGNED`, `PRICE_UPDATED`).
  - Stores actor ID, entity name, entity ID, action type, IP context, and full JSON payload.
* **Verification Status**: Active in database and live stream in `/admin`.
* **Admin Portal Candidate**:
  - [x] Live Audit Stream viewer is currently implemented in `/admin`.
  - [x] **Audit Filter & Export Engine**: Implemented & Live in `/admin` with one-click client-side CSV compliance export for regulatory and investor audits.

---

### F. Telematics & Diagnostic Sensors
* **Technology**: CAN-bus diagnostic schema (`TelematicsStatus`), 4-wheel TPMS, ECU tamper check.
* **Mechanism**:
  - 4-wheel cold tire pressure gauges (FL, FR, RL, RR @ 34 PSI).
  - Powertrain lubricant life %, Brembo brake wear %, 12V auxiliary battery voltage ($12.8\text{V}$), and coolant operating temperature ($88^\circ\text{C}$).
  - Odometer tamper check with CAN-bus telemetry hash verification.
  - **Permanent Directive Governance**: Strict enforcement of **"GPS NOT CONNECTED"** invariant until physical OBD-II IoT modems are certified in Phase 8.
* **Verification Status**: Verified via Automated Test Suite (Suite 5).
* **Admin Portal Candidate**:
  - [x] **Fleet Telemetry Central Monitor**: Implemented & Live in `/admin` with real-time OBD-II CAN-bus sensor matrix (4-wheel cold TPMS @ 34 PSI, 12V alternator health, engine coolant temperature, oil life %), diagnostic polling action, and strict enforcement of the **"GPS NOT CONNECTED"** permanent safety invariant.

---

### G. Highway Expressway Corridor Routing & Energy Engine
* **Technology**: Distance/speed matrix (`POPULAR_ROAD_TRIPS`), NHAI FASTag electronic toll calculation.
* **Mechanism**:
  - Computes exact round-trip vs one-way toll costs across Delhi-Mumbai Expressway (NE-4), Yamuna Expressway, NH-334, and GT Road (NH-44).
  - Indian highway energy consumption models:
    - ICE: 13 km/L @ ₹94.7/L petrol.
    - EV: 6.2 km/kWh @ ₹18.5/kWh DC fast charging.
  - Computes tailpipe $CO_2$ emission deltas ($0.12\text{ kg } CO_2/\text{km}$).
* **Verification Status**: Verified via Automated Test Suite (Suite 4).
* **Admin Portal Candidate**:
  - [ ] **Expressway Toll Rate Master**: Interface to adjust expressway toll fees as NHAI announces annual toll tariff revisions.

---

### H. Multi-Hub Fleet Reassignment Engine
* **Technology**: Server action (`src/actions/admin.ts`), PostgreSQL foreign key update.
* **Mechanism**:
  - Reassigns vehicles dynamically across the 6 Delhi NCR operating hubs:
    1. Ghaziabad Hub (RDC Raj Nagar / Meerut Road)
    2. Faridabad Hub (Sector 15-A / Mathura Road)
    3. Gurugram Hub (DLF Cyber City / DLF Phase 2)
    4. Noida Hub (Sector 18 Commercial Complex)
    5. Greater Noida Hub (Pari Chowk / Expressway Zone)
    6. Meerut Hub (Partapur / Delhi-Meerut Expressway)
  - Emits immutable `VEHICLE_HUB_REASSIGNED` audit record.
* **Verification Status**: Verified and active in `/admin`.
* **Admin Portal Candidate**:
  - [x] Currently live in `/admin` under Fleet Management tab.
  - [x] **Fleet CRUD & Path Editor**: Provision new fleet vehicles, edit vehicle specifications, custom route paths (`/cars/[slug]`), and availability.
  - [x] **Hub Station CRUD & Path Editor**: Provision new operating hubs, edit station addresses, phone hotlines, and custom route paths (`/hubs/[slug]`).

---

### I. Customer DigiLocker Driver KYC & Verification
* **Technology**: Simulated MoRTH gateway integration (`ReservationModal.tsx`, `ProfilePage.tsx`).
* **Mechanism**:
  - Validates driving license format, LMV-NT endorsement, minimum age eligibility (23+ years), and validity dates.
  - Supports physical DL card photo upload with in-browser Base64 preview and profile synchronization.
* **Verification Status**: Verified in checkout drawer and customer profile.
* **Admin Portal Candidate**:
  - [x] **Customer DigiLocker KYC Verification Queue**: Live in `/admin` to inspect DigiLocker verified profiles, verify 23+ age policy, review MoRTH Sarathi DL and masked UIDAI Aadhaar credentials, view watermarked private storage documents, and approve, flag, or request re-uploads with full audit logging.

---

### J. Digital Rental Agreement E-Signature System
* **Technology**: HTML5 Canvas vector e-signature (`DigitalAgreementModal.tsx`).
* **Mechanism**:
  - Captures high-resolution customer signature data URLs upon pickup handover.
  - Formulates standard Delhi NCR self-drive clauses (authorized territory, FASTag toll clearance, Motor Vehicles Act 1988 compliance).
* **Verification Status**: Verified in Agent Operations Portal (`/agent`).
* **Admin Portal Candidate**:
  - [x] **Contract Vault & E-Signatures**: Implemented & Live in `/admin` with searchable repository of vaulted rental agreements, customer vector SVG e-signatures, SHA-256 cryptographic hashes, and interactive Master Administrator countersignature execution.

---

## 2. Future Technical Backend Features (Purely Technical / Non-User Configurable)

The following upcoming backend features are internal system mechanisms that can be surfaced for administrative control:

| Technical Feature | Description | Potential Admin Panel Tool |
| :--- | :--- | :--- |
| **1. Dynamic Surge Pricing Engine** | Algorithmic multiplier based on demand, weekend surges, holiday dates, and hub inventory depletion. | Surge multiplier ceiling tuner (e.g. max $1.4\times$) and holiday calendar scheduler. |
| **2. NHAI FASTag Auto-Debit Webhook** | Automated webhook receiver from toll plaza NETC clearinghouse to debit real-time tolls from active booking escrow. | Live webhook event inspector and simulated toll injection debugger. |
| **3. Phase 8 OBD-II IoT Telematics Gateway** | MQTT / HTTP ingestion pipeline receiving real vehicle CAN-bus data (actual GPS coordinates, speed, acceleration G-force, DTC diagnostic trouble codes). | Live map tracking with speed breach alert notifications and remote vehicle immobilizer killswitch. |
| **4. Cloudflare / Vercel Edge Rate Limiter** | Token bucket rate limiting on booking creation and OTP endpoints to thwart automated scraping or SMS spam. | Rate limit violation logs and IP whitelist/blacklist management interface. |
| **5. Automated SMS / WhatsApp Gateway** | Integrations with Twilio / Gupshup / Kaleyra for automated customer OTPs, trip reminder triggers, and return links. | SMS delivery log dashboard with provider latency and failure metrics. |
| **6. Supabase Storage Auto-Archival** | Background cron job moving 360° walk-around inspection videos to cold storage (e.g. AWS S3 Glacier / Cloudflare R2) after 90 days. | Storage quota usage gauge and manual media purge trigger. |
| **7. Multi-City Expansion Hierarchy** | Multi-tenant schema segmentation enabling rapid addition of new regional hub clusters (Mumbai MMR, Bengaluru, Chandigarh Tri-city). | City cluster creator with regional GSTIN and local hub configuration. |

---

## 3. Recommended Admin Panel Enhancements Roadmap

Based on the technical inventory above, the following administrative systems have been implemented:

1. [x] **Global Fee & Surge Configuration Engine**:
   - Allow Master Admin to adjust GST percentage, platform fee %, and condition multipliers dynamically from `/admin` without code redeploys. *(Implemented & Live in `/admin`)*
2. [x] **Customer KYC & Document Verification Queue**:
   - Provide an administrative dashboard to review driver licenses, verify age (23+ requirement), inspect uploaded physical DL photos via secure watermarked pre-signed URLs, calibrate risk levels, and approve or request re-uploads. *(Implemented & Live in `/admin`)*
3. [x] **Master Escrow & Financial Settlement Ledger**:
   - Provide executive oversight of all security deposits held, FASTag tolls deducted, and bank refunds pending disbursement with zero-floor mathematical protection. *(Implemented & Live in `/admin`)*
4. [x] **Digital Rental Contract Vault & Vector E-Signatures**:
   - Searchable repository of legally binding rental contracts with customer vector e-signatures, SHA-256 tamper-evident seals, and Master Administrator countersignatures. *(Implemented & Live in `/admin`)*
5. [x] **Real-time Fleet Telemetry & CAN-Bus Diagnostic Matrix**:
   - Central sensor monitor streaming 4-wheel cold TPMS (@ 34 PSI), 12V alternator health, engine coolant temperature, and oil life, strictly enforcing the **"GPS NOT CONNECTED"** permanent safety invariant. *(Implemented & Live in `/admin`)*

