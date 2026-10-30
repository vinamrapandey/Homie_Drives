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
}
