# Homie Drives — Product Requirements Document (PRD)

* **Version**: 1.0.0
* **Date**: 2026-10-31
* **Market**: Delhi NCR, India (expansion to Mumbai, Bengaluru, Chandigarh)

---

## 1. Executive Summary & Vision
Homie Drives is a mobile-first self-drive car rental and flexible mobility platform designed specifically for the unique automotive and infrastructure landscape of Delhi NCR, India. It offers customers access to an aspirational, well-maintained fleet—ranging from capable domestic SUVs and electric commuters to executive sedans and supercars—with transparent condition-based pricing, regional trip planning, and instant keyless digital access.

---

## 2. Business Model & Value Proposition
1. **Unified Brand Presentation**: All vehicles are presented to consumers under the Homie Drives brand. Behind the scenes, operational fleet units are managed by authorized hub agents.
2. **Same-Hub Return Guarantee**: All initial reservations require pickup and return at the same designated Delhi NCR operational hub (Aerocity IGI Airport, Cyber Hub Gurugram, Connaught Place, Sector 18 Noida, Dwarka Express Hub, Golf Course Extension).
3. **Flexible Rental Tenures**:
   * *Everyday Rentals*: 1 to 7 days for weekend getaways, business meetings, or city mobility.
   * *Long-Term Vehicle Access*: 1 to 6 months flexible subscription with bundled maintenance and FASTag buffer.
4. **Transparent Condition-Based Pricing**:
   * *Showroom Pristine* (< 5,000 km, +15% rate).
   * *Executive Mint* (5,000–25,000 km, 1.0x standard rate).
   * *Touring / Value* (25,000–60,000 km, -15% value discount).
5. **Initial Payment Terms**: Pay at pickup with refundable security deposit held via card authorization or UPI mandate.

---

## 3. User Personas
* **The Highway Roadtripper (Arjun, 31, Gurugram)**: Young tech professional seeking a 4x4 SUV (Mahindra Thar Roxx or Scorpio-N) for a weekend getaway to Rishikesh or Neemrana with clear expressway toll and fuel calculations.
* **The Urban EV Commuter (Priya, 28, South Delhi)**: Eco-conscious professional needing an efficient, modern EV (Tata Nexon EV) for city transit with pre-configured DC fast charging stops.
* **The Luxury / Executive Traveler (Rajeev, 44, Noida)**: Corporate leader renting an executive lounge (Toyota Innova HyCross ZX or BMW 3-Series) for VIP guests arriving at IGI Airport.
* **The Station Agent (Kabir Mehta, Aerocity Hub)**: On-ground fleet manager responsible for vehicle preparation, verifying customer driving licenses, validating pickup OTPs, recording mandatory 360° walkaround inspection videos, and handing over keyless passes.
* **The Master Fleet Administrator**: Central operational manager monitoring all hub inventory, assigning vehicles to agents, tuning condition pricing multipliers, and arbitrating claims.

---

## 4. The Three Application Portals
1. **Customer Web App (`/`)**:
   * Mobile-first responsive catalog, condition switcher, expressway trip planner, 4-step DigiLocker checkout, and live digital pass with remote keyless fob simulation.
2. **Agent Operations Portal (`/agent`)**:
   * Mobile-optimized field app for hub agents: booking queues, OTP validation, video inspection uploads, vehicle offline/maintenance flags, and handover signatures.
3. **Master Administration Portal (`/admin`)**:
   * Executive back-office: master fleet inventory, vehicle-to-agent allocations, rate adjustments, customer identity audit, financial reconciliation, and platform audit logs.

---

## 5. Scope & Roadmap Status
* **Phase 1 (Completed)**: Responsive mobile customer frontend, Mobbin design system, multi-angle touch carousel, 3-tier condition pricing, 4-step checkout drawer, interactive highway getaway planner, and keyless pass simulator.
* **Phase 2 (Planned)**: Supabase PostgreSQL database, Supabase Auth, Row Level Security, and role-based access control.
* **Phase 3 (Planned)**: Production routing and geocoding engine for the trip planner.
* **Phase 4 (Planned)**: Database concurrency-safe booking engine and real-time availability blocks.
* **Phase 5 (Planned)**: Agent and Master Administrator operational portals.
* **Phase 6 (Planned)**: Mandatory inspection video upload to Supabase Private Storage, OTP verification, and digital rental agreements.

