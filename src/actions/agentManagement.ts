"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { HubAgentRecord, AgentShiftStatus, AgentCertificationTier } from "@/types/agent";
import { INITIAL_HUB_AGENTS } from "@/data/agentRecords";

export const createAgentSchema = z.object({
  fullName: z.string().min(3, "Agent full name required"),
  badgeId: z.string().min(4, "Badge ID required (e.g. HD-AGT-106)"),
  phone: z.string().min(10, "Valid Indian mobile phone required"),
  email: z.string().email("Valid company email required"),
  primaryHubId: z.string().min(1, "Primary hub assignment required"),
  primaryHubName: z.string().min(1, "Hub name required"),
  certificationTier: z.enum(["Master Certified", "Senior Specialist", "Operations Associate"]),
  assignedVehicleIds: z.array(z.string()).default([]),
  assignedVehicleNames: z.array(z.string()).default([]),
  shiftStatus: z.enum(["on_duty", "on_break", "off_duty"]).default("on_duty"),
  emergencyContact: z.string().default("+91 98100 00000"),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;

export async function createHubAgentAction(input: CreateAgentInput): Promise<{
  success: boolean;
  agent?: HubAgentRecord;
  message?: string;
  error?: string;
}> {
  try {
    const validated = createAgentSchema.parse(input);
    const agentId = `agt-${Date.now().toString(36)}`;

    const newAgent: HubAgentRecord = {
      id: agentId,
      badgeId: validated.badgeId.toUpperCase(),
      fullName: validated.fullName,
      phone: validated.phone,
      email: validated.email,
      primaryHubId: validated.primaryHubId,
      primaryHubName: validated.primaryHubName,
      assignedVehicleIds: validated.assignedVehicleIds,
      assignedVehicleNames: validated.assignedVehicleNames,
      shiftStatus: validated.shiftStatus,
      certificationTier: validated.certificationTier,
      handoverCount: 0,
      rating: 5.0,
      emergencyContact: validated.emergencyContact,
      joinedDate: new Date().toISOString().split("T")[0],
    };

    INITIAL_HUB_AGENTS.unshift(newAgent);
    revalidatePath("/admin");
    revalidatePath("/agent");

    return {
      success: true,
      agent: newAgent,
      message: `Certified Agent ${newAgent.fullName} (${newAgent.badgeId}) provisioned successfully at ${newAgent.primaryHubName}.`,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Validation error" };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to provision hub agent",
    };
  }
}

export async function toggleAgentShiftStatusAction(
  agentId: string,
  newStatus: AgentShiftStatus
): Promise<{
  success: boolean;
  shiftStatus?: AgentShiftStatus;
  message?: string;
  error?: string;
}> {
  const agent = INITIAL_HUB_AGENTS.find((a) => a.id === agentId);
  if (!agent) {
    return { success: false, error: "Agent not found" };
  }

  agent.shiftStatus = newStatus;
  revalidatePath("/admin");
  revalidatePath("/agent");

  const readable =
    newStatus === "on_duty" ? "ON DUTY" : newStatus === "on_break" ? "ON BREAK" : "OFF DUTY";

  return {
    success: true,
    shiftStatus: newStatus,
    message: `Agent ${agent.fullName} shift status updated to ${readable}.`,
  };
}

export async function reassignAgentVehiclesAction(
  agentId: string,
  vehicleIds: string[],
  vehicleNames: string[]
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const agent = INITIAL_HUB_AGENTS.find((a) => a.id === agentId);
  if (!agent) {
    return { success: false, error: "Agent not found" };
  }

  agent.assignedVehicleIds = vehicleIds;
  agent.assignedVehicleNames = vehicleNames;
  revalidatePath("/admin");
  revalidatePath("/agent");

  return {
    success: true,
    message: `Fleet roster for ${agent.fullName} updated (${vehicleNames.length} vehicles assigned).`,
  };
}

