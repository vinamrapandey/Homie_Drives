# Homie Drives — Dynamic Pricing & Condition Engine Specification

* **Golden Rule**: Never hardcode business pricing throughout frontend UI components. All prices, condition deltas, taxes, and fees are computed deterministically by the pricing engine (`src/lib/formatters.ts`).

---

## 1. Condition Tier Multipliers & Grade Matrix

| Condition Tier | Code | Multiplier | Target Fleet Vintage | Inspection Standard | Customer Value Pitch |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **Showroom Pristine** | `pristine` | **`1.15x`** (+15%) | `< 5,000 km` | Factory delivery condition, zero stone chips | Weddings, VIP events, executive showcase |
| **Executive Mint** | `mint` | **`1.00x`** (Base) | `5,000–25,000 km` | 150-point certified, spotless interior | Standard fleet rate, weekend trips & commuting |
| **Touring / Value** | `touring` | **`0.85x`** (-15%) | `25,000–60,000 km` | Mechanically flawless, minor highway patina | Long highway road trips (Jaipur, Agra, Rishikesh) |

---

## 2. Rental Cost Calculation Formula

$$\text{Adjusted Daily Rate} = \text{round}(\text{Base Daily Price} \times \text{Condition Multiplier})$$

$$\text{Rental Base} = \text{Adjusted Daily Rate} \times \text{Days}$$

$$\text{Service Fee} = \text{round}(\text{Rental Base} \times 0.05) \quad (5\%)$$

$$\text{GST} = \text{round}((\text{Rental Base} + \text{Service Fee} + \text{Damage Protection Fee}) \times 0.18) \quad (18\%)$$

$$\text{Total Payable} = \text{Rental Base} + \text{Damage Protection Fee} + \text{Service Fee} + \text{GST} + \text{Security Deposit} + \text{FASTag Buffer}$$

---

## 3. Damage Protection Plans

1. **Standard Basic Coverage** (Included at ₹0/day):
   * Third-party liability covered.
   * Customer collision liability capped at **₹15,000 deductible**.
2. **Premium Zero-Dep Coverage** (₹499/day):
   * Collision liability capped at **₹2,500 deductible**.
   * Windshield, glass, and tyre damage fully covered.
3. **VIP Super Shield** (₹899/day):
   * **₹0 liability** on collision, scratch, or glass damage.
   * 24/7 personal breakdown concierge with immediate replacement car guarantee.

---

## 4. Refundable Security Deposit Brackets (Fixed by Vehicle Class)

| Vehicle Category | Deposit (INR) | Sample Fleet Models |
| :--- | :---: | :--- |
| **Adventure 4x4 / SUVs** | ₹5,000 | Mahindra Thar Roxx 4x4, Mahindra Scorpio-N 4Xplor |
| **Urban Electric / Crossover** | ₹4,000 | Tata Nexon EV Empowered+ LR, Hyundai Creta Turbo |
| **Luxury Executive Lounge** | ₹10,000 | Toyota Innova HyCross ZX Hybrid, BMW 3-Series |
| **Crown Supercars** | ₹25,000 | Aston Martin Vantage V8, Ferrari F8 Tributo Nero |

