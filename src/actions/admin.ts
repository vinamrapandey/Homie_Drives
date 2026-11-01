"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/roles";
import { revalidatePath } from "next/cache";

// ==============================================================================
// Zod Schema: Vehicle Hub Reassignment
// ==============================================================================
export const reassignHubSchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle UUID"),
  targetHubId: z.string().uuid("Invalid target hub UUID"),
  reason: z.string().min(3, "Reassignment reason required for fleet audit log"),
});

export type ReassignHubInput = z.infer<typeof reassignHubSchema>;

export interface ReassignHubResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function reassignVehicleHubAction(
  input: ReassignHubInput
): Promise<ReassignHubResult> {
  try {
    const validated = reassignHubSchema.parse(input);
    const supabase = await createClient();

    // 1. Enforce Master Admin Role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized: Please sign in to manage hub fleet assignments.",
      };
    }

    const role = await getUserRole(user.id);
    if (role !== "master_admin") {
      return {
        success: false,
        error: "Forbidden: Only Master Administrators can reassign fleet vehicles across hubs.",
      };
    }

    // 2. Fetch Target Vehicle and Hub Details
    const { data: vehicle, error: vehicleErr } = await supabase
      .from("vehicles")
      .select("id, name, slug, hub_id")
      .eq("id", validated.vehicleId)
      .maybeSingle();

    if (vehicleErr || !vehicle) {
      return {
        success: false,
        error: "Vehicle not found in fleet records.",
      };
    }

    const { data: targetHub, error: hubErr } = await supabase
      .from("pickup_locations")
      .select("id, name, city")
      .eq("id", validated.targetHubId)
      .maybeSingle();

    if (hubErr || !targetHub) {
      return {
        success: false,
        error: "Target operating hub location not found.",
      };
    }

    // 3. Mutate Vehicle Hub Assignment
    const { error: updateErr } = await supabase
      .from("vehicles")
      .update({
        hub_id: validated.targetHubId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.vehicleId);

    if (updateErr) {
      return {
        success: false,
        error: `Database update failed: ${updateErr.message}`,
      };
    }

    // 4. Log Immutable Audit Record
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "VEHICLE_HUB_REASSIGNED",
      entity_name: "vehicles",
      entity_id: validated.vehicleId,
      payload: {
        vehicle_name: vehicle.name,
        vehicle_slug: vehicle.slug,
        previous_hub_id: vehicle.hub_id,
        new_hub_id: validated.targetHubId,
        new_hub_name: targetHub.name,
        new_hub_city: targetHub.city,
        reason: validated.reason,
      },
    });

    // 5. Revalidate affected portals
    revalidatePath("/admin");
    revalidatePath("/agent");
    revalidatePath("/plan");
    revalidatePath("/");

    return {
      success: true,
      message: `Reassigned ${vehicle.name} to ${targetHub.name}. Fleet allocation updated.`,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((i) => i.message).join(", "),
      };
    }
    const message = err instanceof Error ? err.message : "Reassignment failed.";
    return {
      success: false,
      error: message,
    };
  }
}

