# Homie Drives — Design System Specification

* **Style Architecture**: Mobbin Automotive Aesthetic / Soft Sage-Green Luxury
* **Viewport Priority**: Mobile-First (360px–430px base, responsive up to 1440px desktop)

---

## 1. Color Palette & Design Tokens

The visual palette is directly adapted from the automotive reference design, pairing muted organic greens with deep obsidian slate and crisp frosted cards.

### Core Swatches

| Token Name | Hex Code | Tailwind Utility | Functional Role |
| :--- | :---: | :--- | :--- |
| `--brand-sage` | `#50644E` | `bg-[#50644E]`, `text-[#50644E]` | Primary interactive brand color, active pill indicators, main CTAs |
| `--brand-sage-dark` | `#3F503D` | `hover:bg-[#3F503D]` | CTA hover and pressed states |
| `--brand-sage-light` | `#D4E0D1` | `bg-[#D4E0D1]` | Selection highlights, subtle borders, chip tags |
| `--brand-sage-tint` | `#EAF0E7` | `bg-[#EAF0E7]` | Card accent backgrounds, verified badge surfaces |
| `--bg-page` | `#F3F6F1` | `bg-[#F3F6F1]` | Global body background (soft sage-tinted off-white) |
| `--bg-card` | `#FFFFFF` | `bg-white` | Elevated card surfaces and modal drawers |
| `--text-primary` | `#172016` | `text-[#172016]` | High-contrast headings, prices, and titles |
| `--text-secondary` | `#5C6B5A` | `text-[#5C6B5A]` | Body copy, vehicle subtitles, and section intros |
| `--text-muted` | `#829280` | `text-[#829280]` | Micro-copy, timestamps, and placeholder text |
| `--star-amber` | `#E89619` | `text-[#E89619]` | Verified rating stars and condition premium alerts |

---

## 2. Typography Hierarchy

* **Primary Typeface**: `Plus Jakarta Sans`, falling back to `system-ui, -apple-system, sans-serif`.
* **Headings**: Uppercase, tight letter-spacing (`tracking-tight` or `tracking-wide` for small badges), font-weight `font-bold` to `font-black`.
* **Numeric Displays**: Formatted via `Intl.NumberFormat("en-IN")` for authentic Indian Rupee notation (e.g., `₹4,499/day`).

---

## 3. UI Component Primitives

### A. Touch-Native Multi-Angle Image Carousel (`CarImageCarousel.tsx`)
* Zero external JavaScript dependencies; uses GPU-composited CSS transforms.
* Touch swipe listener with minimum 40px gesture delta threshold.
* Translucent pagination counter pill (`1 / 4`) positioned at top right.
* Thumbnail preview strip allowing immediate jumping between exterior, cockpit, rear, and cargo bay perspectives.

### B. Floating Frosted Summary Card
* Overlays the lower boundary of the hero media banner with negative margin (`-mt-10 sm:-mt-12`).
* Frosted glassmorphism treatment: `bg-white/95 backdrop-blur-xl border border-white/60 shadow-homie-lg rounded-t-[32px]`.
* Contains vehicle title, rating chip, telematics health pill, and dynamic condition badge.

### C. 3-Tier Condition Selector (`CarConditionSelector.tsx`)
* Three standardized discrete radio cards:
  * **Showroom Pristine**: `< 5,000 km` • `+15%` rate adjustment • Factory finish.
  * **Executive Mint**: `5,000–25,000 km` • Standard `1.0x` rate • 150-point certified.
  * **Touring / Value**: `25,000–60,000 km` • `-15%` value discount • Mechanically certified.

### D. Persistent Bottom Navigation Bar (`BottomNav.tsx`)
* Mobile floating pill bar fixed above the viewport bottom safe area (`pb-[env(safe-area-inset-bottom)]`).
* Exactly four core navigation destinations:
  1. **Home** (`/`)
  2. **Plan** (`/plan?tab=trips`)
  3. **Ride** (`/ride?tab=book`)
  4. **Profile** (`/profile`)
* Active destination highlighted with dark sage pill container and white icon/text.

