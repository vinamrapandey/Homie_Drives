"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/roles";
import { INITIAL_TELEMETRY_RECORDS } from "@/data/telemetryRecords";

export const refreshTelemetrySchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID required"),
});

export type RefreshTelemetryInput = z.infer<typeof refreshTelemetrySchema>;

export async function refreshVehicleTelemetryAction(input: RefreshTelemetryInput) {
  try {
    const validated = refreshTelemetrySchema.parse(input);
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const role = await getUserRole(user.id);
      if (role !== "master_admin" && role !== "agent") {
        return {
          success: false,
          error: "Unauthorized: Only administrators and fleet agents can poll vehicle diagnostics.",
        };
      }
    }

    const record = INITIAL_TELEMETRY_RECORDS.find((t) => t.vehicleId === validated.vehicleId);
    if (!record) {
      return {
        success: false,
        error: "Vehicle telemetry record not found.",
      };
    }

    // Refresh timestamp
    record.lastCanbusSync = new Date().toISOString();

    if (user) {
      try {
        await supabase.from("audit_logs").insert({
          actor_id: user.id,
          action: "CANBUS_TELEMETRY_REFRESHED",
          entity_name: "vehicle_telemetry",
          entity_id: validated.vehicleId,
          payload: {
            vehicle_id: validated.vehicleId,
            battery_voltage: record.batteryVoltage12V,
            odometer_km: record.odometerKm,
            gps_connected: false,
            gps_status: "GPS NOT CONNECTED",
          },
        });
      } catch {
        // Fallback for demo
      }
    }

    revalidatePath("/admin");

    return {
      success: true,
      message: `OBD-II CAN-bus telemetry refreshed for ${record.carName}. GPS Status: GPS NOT CONNECTED (hardware isolation maintained).`,
      record,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((i) => i.message).join(", "),
      };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to refresh telemetry",
    };
  }
}
