export interface LocationHub {
  id: string;
  name: string;
  area: string;
  city: string;
  address: string;
  isPopular?: boolean;
}

export interface BookingSearch {
  pickupLocationId: string;
  returnLocationId: string; // Same as pickup for initial release
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
}

export interface RentalPassDemo {
  id: string;
  bookingRef: string;
  carName: string;
  carCategory: string;
  carImage: string;
  registrationNumber: string;
  pickupLocation: string;
  returnLocation: string;
  pickupDateTime: string;
  returnDateTime: string;
  dailyRateINR: number;
  totalPaidINR: number;
  status: "active" | "confirmed" | "completed";
  assignedAgent: string;
  securityCode: string;
}

export interface DamageProtectionPlan {
  id: "basic" | "premium" | "super";
  name: string;
  badge: string;
  dailyRateINR: number;
  excessLiabilityINR: number;
  highlights: string[];
  isRecommended?: boolean;
}

export interface DigiLockerKycRecord {
  dlNumber: string;
  driverName: string;
  dob: string;
  age: number;
  licenseClass: string;
  rtoAuthority: string;
  validUntil: string;
  verifiedAt: string;
  isAgeEligible: boolean;
  status: "verified" | "pending" | "unverified";
}

export interface RoadTripPitstop {
  name: string;
  type: "food" | "ev-charging" | "fuel" | "rest";
  location: string;
  distanceKm: number;
  description?: string;
}

export interface RoadTripPlan {
  id: string;
  destination: string;
  state: string;
  startingHub: string;
  distanceKm: number;
  estimatedDriveTime: string;
  suggestedDuration: string;
  recommendedCarCategory: string;
  highlights: string[];
  expresswayName?: string;
  speedLimitKmh?: number;
  oneWayTollINR?: number;
  returnTollINR?: number;
  estFuelOrChargeCostINR?: number;
  fastagLaneActive?: boolean;
  pitstops?: RoadTripPitstop[];
  matchedCarSlug?: string;
}
