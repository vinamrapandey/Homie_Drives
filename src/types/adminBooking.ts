export type BookingLifecycleStatus =
  | "pending_pickup"
  | "verified_handover"
  | "active_rental"
  | "returned_inspected"
  | "closed"
  | "cancelled";

export interface BookingInspectionData {
  recordedAt: string;
  agentName: string;
  odometerKm: number;
  fuelOrBatteryPercent: number;
  passedSanitization: boolean;
  damageNotes?: string;
  videoUrl: string;
}

export interface AdminBookingRecord {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleId: string;
  vehicleName: string;
  registrationNumber: string;
  hubName: string;
  hubSlug: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  tstzrangeInterval: string; // PostgreSQL TSTZRANGE lock string
  isTemporalLockActive: boolean;
  status: BookingLifecycleStatus;
  conditionTier: "pristine" | "mint" | "touring";
  dailyRateINR: number;
  totalAmountINR: number;
  depositHeldINR: number;
  pickupOtp: string;
  assignedAgent: string;
  createdAt: string;
  preHandoverInspection?: BookingInspectionData;
  returnInspection?: BookingInspectionData;
}
