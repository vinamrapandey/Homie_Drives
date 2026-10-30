export type FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid";
export type TransmissionType = "Automatic" | "Manual";
export type CarCategory =
  | "supercar"
  | "luxury-sedan"
  | "performance-suv"
  | "city-ev"
  | "touring-suv"
  | "adventure-4x4"
  | "family-tourer";

export type VehicleConditionTier = "pristine" | "mint" | "touring";

export interface VehicleConditionOption {
  tier: VehicleConditionTier;
  label: string;
  badge: string;
  odometerRange: string;
  cosmeticDescription: string;
  priceMultiplier: number; // 1.15 for pristine, 1.0 for mint, 0.85 for touring
  inspectionStatus: string;
  popularFor: string;
}

export interface CarSpecs {
  rangeOrMileage: string;
  horsePower: string;
  topSpeed: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  seats: number;
  luggageBags: number;
  acceleration0to100?: string;
}

export interface CarGalleryItem {
  label: string;
  url: string;
}

export interface TelematicsStatus {
  fuelOrBatteryPercent: number;
  sanitizedTimeAgo: string;
  keylessReady: boolean;
  fastagActive: boolean;
}

export interface Car {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandLogo?: string;
  category: CarCategory;
  categoryLabel: string;
  year: number;
  badgeTag: string;
  rating: number;
  reviewsCount: number;
  dailyPriceINR: number;
  monthlyPriceINR: number;
  hubLocation: string;
  image: string;
  gallery?: CarGalleryItem[];
  description: string;
  specs: CarSpecs;
  features: string[];
  isAvailableDemo: boolean;
  agentAssigned: string;
  telematicsStatus?: TelematicsStatus;
  conditionOptions?: VehicleConditionOption[];
  defaultConditionTier?: VehicleConditionTier;
}

export interface RentalPriceBreakdown {
  days: number;
  conditionTier: VehicleConditionTier;
  conditionMultiplier: number;
  baseDailyRate: number;
  adjustedDailyRate: number;
  rentalBase: number;
  insurance: number;
  serviceFee: number;
  gst: number;
  securityDeposit: number;
  total: number;
}

export interface CarFiltersState {
  searchQuery: string;
  selectedBrand: string;
  fuelType: string;
  transmission: string;
  seatingCapacity: string;
  priceRange: "all" | "under-5k" | "5k-10k" | "above-10k";
  duration: "daily" | "weekend" | "monthly" | "long-term";
}
