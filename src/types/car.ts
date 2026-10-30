export type FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid";
export type TransmissionType = "Automatic" | "Manual";
export type CarCategory =
  | "supercar"
  | "luxury-sedan"
  | "performance-suv"
  | "city-ev"
  | "touring-suv";

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
  description: string;
  specs: CarSpecs;
  features: string[];
  isAvailableDemo: boolean;
  agentAssigned: string;
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
