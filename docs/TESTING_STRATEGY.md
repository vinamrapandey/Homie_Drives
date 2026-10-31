# Homie Drives — Comprehensive Testing Strategy

* **Testing Philosophy**: Shift-left automated validation across business calculations, UI interactions, and database integrity.

---

## 1. Test Pyramid & Tooling

| Level | Tool | Coverage Focus |
| :--- | :--- | :--- |
| **Unit Testing** | Vitest | Deterministic pricing recalculation, GST, condition multipliers, trip toll/fuel calculations |
| **Component Testing** | React Testing Library | Carousel gestures, condition radio toggles, reservation modal drawer flow |
| **End-to-End (E2E)** | Playwright | Full booking flow: Home → Car Detail → 4-Step Checkout → Live Pass View |
| **Static Verification** | TypeScript & ESLint | Strict type safety, no implicit `any`, no unused imports, valid Next.js rules |
| **Database Concurrency** | PostgreSQL Test Harness | Verifying `btree_gist` exclusion constraints prevent simultaneous double bookings |

---

## 2. Critical Test Scenarios

### Test Suite 1: Condition Pricing Engine (`lib/formatters.ts`)
* Given a car with base rate ₹4,499:
  * Pristine (+15%): daily rate equals `round(4499 * 1.15) = 5174`.
  * Executive Mint (1.0x): daily rate equals `4499`.
  * Touring Value (-15%): daily rate equals `round(4499 * 0.85) = 3824`.
* Verifies GST is calculated exactly at 18% of `(Rental Base + Service Fee + Damage Protection Fee)`.

### Test Suite 2: Road Trip Highway Calculator (`TripsTab.tsx`)
* Round-trip distance matches `baseDistance * 2`.
* Fuel expenditure scales correctly for Electric (kWh), Diesel (L), and Petrol (L).
* Pitstop category filters (Food, EV Fast, Fuel, Rest) return correct subsets.

### Test Suite 3: Concurrency & Booking Guardrails
* Attempting two simultaneous bookings on the same vehicle for overlapping dates must fail with a PostgreSQL exclusion constraint violation.

