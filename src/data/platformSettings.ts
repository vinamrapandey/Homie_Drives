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
}

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
};

