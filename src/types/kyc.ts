export type KYCVerificationStatus =
  | "verified"
  | "pending_review"
  | "flagged"
  | "rejected";

export type KYCRiskLevel = "low" | "medium" | "high";

export interface AadhaarKYCData {
  maskedNumber: string; // e.g. "XXXXXXXX8492"
  name: string;
  dob: string;
  age: number;
  ageCheckPassed: boolean; // Must be >= 23 for Homie Drives policy
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isNcrResident: boolean;
}

export interface DrivingLicenseKYCData {
  dlNumber: string; // e.g. "DL-04-2019-0048192"
  issuingRTO: string; // e.g. "DL-04 Janakpuri, West Delhi"
  issueDate: string;
  expiryDate: string;
  isExpired: boolean;
  vehicleClasses: string[]; // e.g. ["LMV-NT", "MCWG"]
  lmvEligible: boolean; // Light Motor Vehicle Non-Transport
  documentUrl: string;
  cardImageUrl?: string;
}

export interface CustomerKYCRecord {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  digilockerStatus: KYCVerificationStatus;
  riskLevel: KYCRiskLevel;
  aadhaar: AadhaarKYCData;
  drivingLicense: DrivingLicenseKYCData;
  digilockerVerifiedAt?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}
