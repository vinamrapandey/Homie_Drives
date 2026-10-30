import { DamageProtectionPlan } from "@/types/booking";

export const DEFAULT_PROTECTION_PLANS: DamageProtectionPlan[] = [
  {
    id: "basic",
    name: "Homie Standard Shield",
    badge: "Included Free",
    dailyRateINR: 0,
    excessLiabilityINR: 15000,
    highlights: [
      "Basic comprehensive insurance included with booking",
      "₹15,000 maximum customer damage excess liability",
      "Standard third-party cover as per Motor Vehicles Act",
    ],
  },
  {
    id: "premium",
    name: "Homie Premium Zero-Dep Care",
    badge: "Recommended",
    dailyRateINR: 799,
    excessLiabilityINR: 0,
    isRecommended: true,
    highlights: [
      "₹0 Excess / Zero Deductible on all accidental body repairs",
      "Tire puncture, sidewall & alloy rim damage covered",
      "Windshield stone-chip & headlamp glass replacement",
      "Complimentary roadside key replacement & battery jump",
    ],
  },
  {
    id: "super",
    name: "VIP Peace-of-Mind Super Shield",
    badge: "Total Protection",
    dailyRateINR: 1299,
    excessLiabilityINR: 0,
    highlights: [
      "Zero customer financial liability on damages or loss",
      "₹25 Lakh personal accidental indemnity per occupant",
      "Zero pre-authorization credit card security deposit hold",
      "Priority immediate replacement vehicle dispatch in Delhi NCR",
    ],
  },
];
