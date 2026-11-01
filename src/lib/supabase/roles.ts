import { createClient } from "./server";
import { UserRole, AgentProfile } from "@/types/roles";

/**
 * Resolves the authenticated user's highest operational role from Supabase
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("profile_id", userId);

    if (error || !data || data.length === 0) {
      return "customer";
    }

    const roles = data.map((r) => r.role as UserRole);
    if (roles.includes("master_admin")) return "master_admin";
    if (roles.includes("agent")) return "agent";
    return "customer";
  } catch {
    return "customer";
  }
}

/**
 * Resolves an operational Agent's profile and assigned hub
 */
export async function getAgentProfile(userId: string): Promise<AgentProfile | null> {
  try {
    const supabase = await createClient();
    const { data: agent, error } = await supabase
      .from("agents")
      .select(`
        id,
        profile_id,
        hub_id,
        employee_code,
        is_active,
        profiles (
          full_name,
          email,
          phone_number
        ),
        pickup_locations (
          name
        )
      `)
      .eq("profile_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !agent) {
      return null;
    }

    const { count } = await supabase
      .from("vehicle_assignments")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", agent.id);

    const profileData = agent.profiles as unknown as {
      full_name: string;
      email: string;
      phone_number: string;
    } | null;

    const hubData = agent.pickup_locations as unknown as {
      name: string;
    } | null;

    return {
      id: agent.id,
      profileId: agent.profile_id,
      hubId: agent.hub_id,
      hubName: hubData?.name || "Delhi NCR Hub",
      employeeCode: agent.employee_code,
      fullName: profileData?.full_name || "Operational Agent",
      email: profileData?.email || "",
      phone: profileData?.phone_number || "",
      isActive: agent.is_active,
      assignedVehiclesCount: count || 0,
    };
  } catch {
    return null;
  }
}

