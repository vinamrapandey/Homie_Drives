export type AgentShiftStatus = "on_duty" | "on_break" | "off_duty";

export type AgentCertificationTier =
  | "Master Certified"
  | "Senior Specialist"
  | "Operations Associate";

export interface HubAgentRecord {
  id: string;
  badgeId: string; // e.g. HD-AGT-101
  fullName: string;
  phone: string;
  email: string;
  primaryHubId: string;
  primaryHubName: string;
  assignedVehicleIds: string[];
  assignedVehicleNames: string[];
  shiftStatus: AgentShiftStatus;
  certificationTier: AgentCertificationTier;
  handoverCount: number;
  rating: number; // e.g. 4.95
  emergencyContact: string;
  joinedDate: string; // YYYY-MM-DD
}
