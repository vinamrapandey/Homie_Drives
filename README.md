# Homie Drives — Phase 1: Project Foundation & Customer Website UI

Homie Drives is a mobile-first self-drive car rental platform built specifically for **Delhi NCR, India**. Phase 1 establishes the visual design system, technical architecture, and customer-facing responsive website based on the soft sage-green automotive design reference.

---

## 🎨 Visual Identity & Design System

The visual design is directly inspired by the modern sage-green luxury reference UI:
- **Palette**:
  - Primary Dark Sage Button / Active Pill: `#50644E` (`#3F503D` hover)
  - Secondary Light Sage Button / Feature Cards: `#D4E0D1` / `#DCE7D9`
  - Page Background: `#F3F6F1` (soft sage-tinted off-white)
  - Card Surfaces: `#FFFFFF` with subtle borders (`#E1E8DF`)
  - Primary Typography: Deep Slate `#172016`
  - Muted Text / Specs: `#5C6B5A` and `#829280`
  - Rating Accent: `#E89619` (amber star)
- **Typography**: Geometric modern sans (`Plus Jakarta Sans`) with uppercase bold headline hierarchy (`DRIVE BEYOND LIMITS.`).
- **Cards & Radii**: Smooth `rounded-3xl` (24px–28px) cards with ambient soft shadows (`shadow-homie`).
- **Mobile Navigation**: Persistent floating pill bar (`rounded-full`) with exactly 4 items (Home, Plan, Ride, Profile) and dark sage active pill indicator.

---

## 🚀 Key Features Implemented

### 1. Home Page (`/`)
- Homie Drives branding with custom car silhouette motif.
- Delhi NCR pickup hub selector (Aerocity IGI Airport, Cyber Hub Gurugram, Connaught Place, Sector 18 Noida, etc.).
- Hero section matching reference with the headline `"DRIVE BEYOND LIMITS."` and studio automotive photography.
- Configurable INR daily pricing between **₹2,499 and ₹24,999/day**.
- Booking search panel with pickup date, return date, and same pickup/return hub guarantee.
- Everyday (1–7 days) vs. flexible long-term (1–6 months) rental discovery.
- Featured car showcase and platform benefits.

### 2. Plan Experience (`/plan`)
- **Trips Tab**:
  - Starting hub in Delhi NCR and getaway destinations (Jaipur, Agra, Rishikesh, Chandigarh, Neemrana).
  - Prototype route preview with distance, estimated drive time, and vehicle category match.
  - Clear roadmap disclaimer explaining live fuel calculations and tolls will be integrated in subsequent phases.
- **Cars Tab**:
  - Reusable vehicle listing component.
  - Practical filters for price tiers (Under ₹5k, ₹5k–₹10k, ₹10k+), fuel types (Petrol, Diesel, EV, Hybrid), transmission (Automatic, Manual), and seating capacity (4, 5, 7 seats).
  - Brand filter pills matching the reference design (*Aston Martin, Ferrari, Lamborghini, Mercedes-Benz, BMW, Veloce, Hyundai, Mahindra*).

### 3. Ride Experience (`/ride`)
- **Book Tab**:
  - Availability-oriented car-listing layout with hub location selection and date/time filters.
  - Clearly identified sample availability mode.
- **Pass Tab**:
  - Interactive toggle between a representative **Sample Demo Pass** and an **Empty State View**.
  - Digital pass displays simulated booking ref `#HD-DEL-8924`, QR code mockup, PIN `8924`, handover hub, and assigned agent contact (*Kabir Mehta*).

### 4. Vehicle Detail Experience (`/cars/[slug]`)
- Accessible from car cards and dedicated dynamic route.
- Matches Screen 3 in reference design:
  - Studio vehicle showcase.
  - Curved bottom sheet with rating badge (`★ 4.9`).
  - Sage-tinted feature cards: Range/Mileage, Horsepower, Top Speed, Transmission & Seats.
  - Transparent pricing breakdown table (Daily rate × days, Insurance Included, Service fee, 18% GST, Refundable security deposit).
  - Flexible rental tenure selector (Daily/Weekend vs. 1-Month vs. 3–6 Month Subscription).
  - "Book Now" CTA triggering the **Demo Reservation Preview Modal** with disclaimer.

### 5. Customer Profile (`/profile`)
- Account details placeholder (*Arjun Sharma, Delhi NCR*).
- Driver verification status placeholder (*DL & Aadhaar DigiLocker verification coming in Phase 2*).
- Rental history record linked to the digital pass.
- Standard rental documents and agreements overview.
- 24x7 Delhi NCR roadside assistance concierge & FAQs.

---

## 🛠️ Technical Stack & Architecture

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Icons**: Lucide Icons
- **Font**: Plus Jakarta Sans (`next/font/google`)
- **Number Formatting**: Indian Numbering & Currency System (`Intl.NumberFormat("en-IN")`)

### Directory Structure

```
src/
├── app/
│   ├── page.tsx               # Home page
│   ├── plan/page.tsx          # Plan page (Trips & Cars tabs)
│   ├── ride/page.tsx          # Ride page (Book & Pass tabs)
│   ├── profile/page.tsx       # Customer profile & verification
│   ├── cars/[slug]/page.tsx   # Dynamic vehicle detail route
│   ├── layout.tsx             # Root layout with navbar & bottom nav
│   └── globals.css            # Design tokens & custom utilities
├── components/
│   ├── layout/                # Navbar, BottomNav, Footer
│   ├── common/                # Logo, DisclaimerBanner
│   ├── cars/                  # CarCard, CarFilters, CarDetailView
│   ├── booking/               # SearchPanel, ReservationModal
│   ├── plan/                  # TripsTab, CarsTab
│   └── ride/                  # BookTab, PassTab
├── data/
│   ├── cars.ts                # Typed demo fleet (₹2,499 - ₹24,999)
│   ├── locations.ts           # Delhi NCR operating hubs
│   └── trips.ts               # Regional road trips from Delhi NCR
├── lib/
│   ├── formatters.ts          # INR currency and date calculations
│   └── utils.ts               # Class merging utilities
└── types/
    ├── car.ts                 # Fleet & filter interfaces
    └── booking.ts             # Hubs, bookings, passes & trips
```

---

## ⚡ Getting Started Locally

### Prerequisites
- Node.js 18+ (tested with Node.js v26.1)
- npm 9+

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type check and linting
npm run lint

# Build production bundle
npm run build
```

Preview at **[http://localhost:3000](http://localhost:3000)**.

---

## ⚠️ Known Limitations & Scope Boundaries (Phase 1)

As specified in Phase 1 requirements:
- **No live booking engine or database**: Vehicle inventory and status are typed demo data.
- **No live payment gateway**: Clicking "Book Now" opens a prototype preview modal explaining that live payments and DigiLocker KYC are coming in Phase 2.
- **No external maps SDK or GPS integration**: Route distances and times on the Trips tab are curated regional estimates.
- **Same pickup and return**: Initial fleet operations require vehicle return to the original pickup hub in Delhi NCR.
