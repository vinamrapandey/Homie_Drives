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
- **Trips Tab (`TripsTab.tsx`)**:
  - Interactive Delhi NCR road trip getaway explorer (Jaipur via Delhi-Mumbai Expressway, Agra via Yamuna Expressway, Rishikesh via Delhi-Dehradun Expressway, Chandigarh via NH-44, Neemrana Heritage Drive).
  - **Live Highway Toll & Fuel/Energy Calculator**:
    - Real-time toll estimates (`FASTag` integrated rates per expressway).
    - Fuel & EV energy cost calculator supporting both **Round-Trip** (2x) and **One-Way** itineraries.
    - Curated highway pitstops categorized into Dining/Food, EV DC Fast Charging, Fuel stations, and Scenic Rest Stops.
  - **1-Click Fleet Matching**: Direct vehicle assignment matching the terrain (e.g., Thar Roxx for Rishikesh, Innova HyCross for Jaipur, Nexon EV for Neemrana) with instant checkout modal launch.
- **Cars Tab (`CarsTab.tsx`)**:
  - Reusable vehicle listing component with condition tags (`3 Condition Grades`).
  - Practical filters for price tiers (Under ₹5k, ₹5k–₹10k, ₹10k+), fuel types (Petrol, Diesel, EV, Hybrid), transmission (Automatic, Manual), and seating capacity (4, 5, 7 seats).
  - Brand filter pills matching the reference design (*Aston Martin, Ferrari, Lamborghini, Mercedes-Benz, BMW, Veloce, Hyundai, Mahindra, Tata, Toyota*).

### 3. Ride Experience (`/ride`)
- **Book Tab**:
  - Availability-oriented car-listing layout with hub location selection and date/time filters.
  - Quick access to reserve any fleet model across Delhi NCR hubs.
- **Live Digital Pass & Keyless Smart Access (`PassTab.tsx`)**:
  - Full cross-page reactive synchronization via `useSyncExternalStore` and `localStorage` (`passStorage.ts`).
  - **Keyless Smart Remote Fob Simulator**:
    - Interactive **Door Lock / Unlock** with audible chirp and immobilizer status toggle.
    - **Cabin Climate Pre-Conditioning**: Remote AC pre-cooling to 21°C with PM2.5 air purifier indicator.
    - **Hazard Locator Flasher**: 4-second synchronized visual flashing indicator for locating car at busy hubs/parking lots.
  - **Dispatch QR Scanner**: Tap-to-expand full-screen QR code and 4-digit PIN (`8924`) for agent handover.
  - **Live FASTag Wallet & Odometer Telematics**: Real-time balance inspection, toll recharge shortcut, and pre-trip inspection audit certificate.
  - **Recent Booking Archive**: Switch between active and past completed trips directly from the pass view.

### 4. Vehicle Detail Experience (`/cars/[slug]`)
- Accessible from car cards and dedicated dynamic route.
- **Mobbin Mobile UX Layout**:
  - Full-bleed studio vehicle showcase powered by **zero-dependency touch-swipe carousel** (`CarImageCarousel.tsx`) with cross-angle photography and pagination dots.
  - Floating dark summary card overlay (`-mt-10 bg-[#172016] text-white rounded-[28px]`) with car name, rating badge (`★ 4.9`), active condition badge, and dynamic price.
  - **3-Tier Vehicle Condition Engine** (`CarConditionSelector.tsx`):
    - **Showroom Pristine** (< 5,000 km, +15% premium)
    - **Executive Mint** (5,000–25,000 km, standard 1.0x base rate)
    - **Touring / Value** (25,000–60,000 km, -15% value discount)
  - Sage-tinted horizontal swipeable feature cards: Range/Mileage, Horsepower, Top Speed, Transmission & Seats.
  - Real-time transparent pricing breakdown table dynamically reflecting the active condition multiplier (Daily rate × days, Insurance Included, Service fee, 18% GST, Category-fixed security deposit).
  - Flexible rental tenure selector (Daily/Weekend vs. 1-Month vs. 3–6 Month Subscription).
  - Sticky mobile booking bar with condition tier indicator and "Book Now" CTA triggering the **4-Step Reservation Drawer**.

### 5. 4-Step Reservation & DigiLocker KYC Checkout (`ReservationModal.tsx`)
- **Step 1: Rental Hub & Timing**: Configure pickup and drop-off hubs, dates, and times.
- **Step 2: Damage Protection Coverage**:
  - Standard Basic (Zero additional cost, ₹15,000 deductible cap).
  - Premium Zero-Dep (₹499/day, ₹2,500 deductible cap, windshield/tyres covered).
  - VIP Super Shield (₹899/day, ₹0 liability, 24/7 personal concierge).
- **Step 3: Driver Government Verification (DigiLocker KYC)**:
  - Simulated 1-click Indian Driving License & Aadhaar e-KYC instant authentication.
  - Verified credentials pre-fill with authentic Digilocker seal.
  - FASTag convenience buffer pre-load (₹500 / ₹1,000 / ₹1,500).
- **Step 4: Summary & Instant Digital Pass Generation**:
  - Itemized pricing breakdown with GST (18%), refundable deposit, and damage cover.
  - Automatic persistent pass generation and seamless redirect to `/ride?tab=pass`.

### 6. Domestic Indian Fleet Expansion
- Curated high-demand Indian market vehicles:
  - **Mahindra Thar Roxx 4x4** (Adventure Off-Roader, ₹4,499/day)
  - **Tata Nexon EV Empowered+ LR** (Urban Electric Crossover, ₹2,699/day)
  - **Mahindra Scorpio-N 4Xplor** (Touring Power SUV, ₹3,899/day)
  - **Toyota Innova HyCross Hybrid** (7-Seater Luxury Lounge, ₹5,499/day)
- Realistic Delhi NCR pricing, Fastag inclusion, and hub assignments across Aerocity, Gurugram, CP, and Noida.

### 7. Customer Profile (`/profile`)
- Account details (*Arjun Sharma, Delhi NCR*).
- **DigiLocker Smart Card Viewer**: Interactive modal rendering authentic Ministry of Road Transport & Highways driving license smart card with QR verification code.
- Live sync with active rental pass and FASTag account status.
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

## ⚠️ Architecture Boundaries & Operational Assumptions

- **Persistent Client-Side State**: Vehicle checkout, condition grading, DigiLocker credentials, and digital pass keyless controls synchronize across views via `useSyncExternalStore` and browser `localStorage`.
- **Pre-Configured Fleet Inventory**: Vehicle models, pricing tiers, and hubs are strongly typed in `src/data/` for rapid zero-latency client rendering.
- **DigiLocker & FASTag Integration**: Government driver license verification and toll buffer preloading are interactive simulations adhering to DigiLocker and FASTag NPCI UX specifications.
- **Same Hub Return Operations**: Fleet turnaround operates on round-trip hub allocation across major Delhi NCR logistics nodes (Aerocity IGI, Cyber Hub Gurugram, Connaught Place, Noida Sector 18).
