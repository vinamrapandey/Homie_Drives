export interface HolidaySurgeRule {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  multiplier: number; // e.g. 1.20 for +20%
  isActive: boolean;
  description: string;
}

export interface PlatformPricingSettings {
  gstPercent: number; // default 18 (CGST 9% + SGST 9%)
  platformFeePercent: number; // default 5%
  fastagBufferINR: number; // default 1000
  securityDepositINR: number; // default 5000
  pristineMultiplier: number; // default 1.15 (+15%)
  mintMultiplier: number; // default 1.0 (baseline)
  touringMultiplier: number; // default 0.85 (-15%)
  surgeMultiplierCeiling: number; // default 1.40 (max 40% surge)
  surgeActive: boolean;
  surgeReason: string;
  isWeekendSurgeEnabled: boolean; // Friday 6:00 PM to Sunday 11:59 PM
  weekendSurgeMultiplier: number; // default 1.15 (+15%)
  holidayRules: HolidaySurgeRule[];
}

export const INITIAL_HOLIDAY_RULES: HolidaySurgeRule[] = [
  {
    id: "hol-diwali-2026",
    name: "Diwali Festive Golden Corridor",
    startDate: "2026-11-06",
    endDate: "2026-11-12",
    multiplier: 1.2,
    isActive: true,
    description: "Peak outbound Delhi NCR travel to Jaipur, Agra, and Uttarakhand during Diwali & Bhai Dooj.",
  },
  {
    id: "hol-newyear-2026",
    name: "Christmas & New Year Gateway Rush",
    startDate: "2026-12-24",
    endDate: "2027-01-03",
    multiplier: 1.25,
    isActive: true,
    description: "High demand luxury self-drive rentals for hill station getaways (Shimla, Manali, Rishikesh).",
  },
  {
    id: "hol-republic-2027",
    name: "Republic Day Long Weekend",
    startDate: "2027-01-23",
    endDate: "2027-01-26",
    multiplier: 1.15,
    isActive: true,
    description: "3-day expressway leisure weekend to Rajasthan heritage circuits.",
  },
  {
    id: "hol-holi-2027",
    name: "Holi Festive Getaway",
    startDate: "2027-03-21",
    endDate: "2027-03-25",
    multiplier: 1.2,
    isActive: true,
    description: "Festival of colors extended weekend outbound from Delhi NCR.",
  },
];

export const DEFAULT_PLATFORM_SETTINGS: PlatformPricingSettings = {
  gstPercent: 18,
  platformFeePercent: 5,
  fastagBufferINR: 1000,
  securityDepositINR: 5000,
  pristineMultiplier: 1.15,
  mintMultiplier: 1.0,
  touringMultiplier: 0.85,
  surgeMultiplierCeiling: 1.4,
  surgeActive: false,
  surgeReason: "Regular Demand Protocol",
  isWeekendSurgeEnabled: true,
  weekendSurgeMultiplier: 1.15,
  holidayRules: INITIAL_HOLIDAY_RULES,
};

/**
 * Calculates dynamic surge multiplier based on date range and active holiday rules
 */
export function calculateSurgeForDate(
  dateStr: string,
  settings: PlatformPricingSettings = DEFAULT_PLATFORM_SETTINGS
): { multiplier: number; reason: string; isSurgeActive: boolean } {
  // If global surge override is active, use it (capped at ceiling)
  if (settings.surgeActive) {
    const capped = Math.min(settings.surgeMultiplierCeiling, 1.25);
    return {
      multiplier: capped,
      reason: settings.surgeReason || "High Demand Protocol",
      isSurgeActive: true,
    };
  }

  // Check holiday rules
  const targetDate = new Date(dateStr).getTime();
  const matchedHoliday = settings.holidayRules.find((h) => {
    if (!h.isActive) return false;
    const start = new Date(h.startDate).getTime();
    const end = new Date(h.endDate).getTime();
    return targetDate >= start && targetDate <= end;
  });

  if (matchedHoliday) {
    const capped = Math.min(settings.surgeMultiplierCeiling, matchedHoliday.multiplier);
    return {
      multiplier: capped,
      reason: matchedHoliday.name,
      isSurgeActive: true,
    };
  }

  // Check weekend surge (Fri, Sat, Sun)
  if (settings.isWeekendSurgeEnabled) {
    const day = new Date(dateStr).getDay();
    // 0 = Sunday, 5 = Friday, 6 = Saturday
    if (day === 0 || day === 5 || day === 6) {
      const capped = Math.min(settings.surgeMultiplierCeiling, settings.weekendSurgeMultiplier);
      return {
        multiplier: capped,
        reason: "Weekend Getaway Surge (+15%)",
        isSurgeActive: true,
      };
    }
  }

  return {
    multiplier: 1.0,
    reason: "Standard Rate",
    isSurgeActive: false,
  };
}
