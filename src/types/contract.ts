export type ContractStatus = "signed" | "countersigned" | "disputed" | "archived";

export interface RentalContract {
  id: string;
  contractNumber: string;
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  maskedAadhaar: string;
  dlNumber: string;
  vehicleName: string;
  registrationNumber: string;
  hubName: string;
  pickupDate: string;
  returnDate: string;
  totalDays: number;
  dailyRateINR: number;
  depositHeldINR: number;
  totalAmountINR: number;
  termsVersion: string;
  customerSignatureSvg: string;
  countersignedByAdmin: boolean;
  adminSignatureSvg?: string;
  adminSignerName?: string;
  status: ContractStatus;
  documentHashSHA256: string;
  ipAddress: string;
  signedAt: string;
  countersignedAt?: string;
}

