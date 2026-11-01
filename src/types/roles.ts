export type UserRole = "customer" | "agent" | "master_admin";

export interface UserRoleRecord {
  id: string;
  profileId: string;
  role: UserRole;
  createdAt: string;
}

export interface AgentProfile {
  id: string;
  profileId: string;
  hubId: string;
  hubName: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  assignedVehiclesCount: number;
}

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorName?: string;
  action: string;
  entityName: string;
  entityId: string;
  payload?: Record<string, unknown> | null;
  createdAt: string;
}

