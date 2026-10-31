# Homie Drives — Road Trip Planner & Highway Telematics

* **Status**: Core Highway Calculator Implemented (`src/components/plan/TripsTab.tsx` & `src/data/trips.ts`)
* **Future Extension (Phase 3)**: Integration with dynamic routing and tile providers (Leaflet, Mappls, Google Maps).

---

## 1. Supported Regional Getaway Routes (Delhi NCR Hubs)

1. **Delhi to Jaipur** (via Delhi-Mumbai Expressway - NE4):
   * Distance: ~280 km (One-Way) / 560 km (Round-Trip)
   * Toll Estimate: ₹590 (One-Way) / ₹1,180 (Round-Trip)
   * Recommended Fleet: Toyota Innova HyCross ZX Hybrid (Cruising efficiency & 7-seat comfort)
2. **Delhi to Agra** (via Yamuna Expressway):
   * Distance: ~230 km (One-Way) / 460 km (Round-Trip)
   * Toll Estimate: ₹435 (One-Way) / ₹870 (Round-Trip)
   * Recommended Fleet: BMW 3-Series Gran Limousine (High-speed expressway stability)
3. **Delhi to Rishikesh** (via Delhi-Dehradun Expressway):
   * Distance: ~245 km (One-Way) / 490 km (Round-Trip)
   * Toll Estimate: ₹360 (One-Way) / ₹720 (Round-Trip)
   * Recommended Fleet: Mahindra Thar Roxx 4x4 (Hill climb & rough terrain capability)
4. **Delhi to Chandigarh** (via NH-44 Grand Trunk Road):
   * Distance: ~250 km (One-Way) / 500 km (Round-Trip)
   * Toll Estimate: ₹390 (One-Way) / ₹780 (Round-Trip)
   * Recommended Fleet: Mahindra Scorpio-N 4Xplor (Torquey diesel expressway cruiser)
5. **Delhi to Neemrana Heritage Drive** (via NH-48):
   * Distance: ~130 km (One-Way) / 260 km (Round-Trip)
   * Toll Estimate: ₹185 (One-Way) / ₹370 (Round-Trip)
   * Recommended Fleet: Tata Nexon EV Long Range (Zero emissions & single-charge radius)

---

## 2. Interactive Energy & Toll Calculation Architecture

### Mathematical Model
```typescript
// Distance calculation supporting trip configuration
const effectiveDistance = journeyType === "roundtrip" ? baseDistanceKm * 2 : baseDistanceKm;

// Energy cost based on vehicle powertrain
let estimatedFuelCost = 0;
if (fuelType === "Electric") {
  // Tata Nexon EV: ~7 km per kWh, @ ₹18/kWh DC fast charging
  const unitsKWh = effectiveDistance / 7.0;
  estimatedFuelCost = Math.round(unitsKWh * 18);
} else if (fuelType === "Diesel") {
  // Mahindra SUVs: ~14 km/L, @ ₹88/L in Delhi NCR
  const liters = effectiveDistance / 14.0;
  estimatedFuelCost = Math.round(liters * 88);
} else {
  // Petrol / Hybrid: ~16 km/L, @ ₹95/L in Delhi NCR
  const liters = effectiveDistance / 16.0;
  estimatedFuelCost = Math.round(liters * 95);
}

// Toll estimates using official NHAI / Yamuna Expressway FASTag rates
const estimatedTollCost = journeyType === "roundtrip" ? baseTollINR * 2 : baseTollINR;
```

---

## 3. Curated Waypoint Pitstop Categories
* **Dining & Highway Dhabas**: Mannat Haveli (NH-44), Shiva Tourist Dhaba (Babarpur), Old Rao Hotel (NH-48).
* **EV DC Fast Charging Hubs**: Tata Power EZ Charge 60kW, Statiq Hypercharger 120kW, Jio-bp Pulse.
* **Fuel & Rest Stops**: Indian Oil COCO, Bharat Petroleum Speed Stations with clean washrooms and ATMs.
* **Scenic Lookouts**: Neemrana Fort vantage, Ganga Barrage overlook.

