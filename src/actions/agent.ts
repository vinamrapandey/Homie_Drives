"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/roles";
import { revalidatePath } from "next/cache";

// ==============================================================================
// 1. Zod Schema: Pickup OTP & Pre-Handover Inspection Verification
// ==============================================================================
export const verifyPickupOtpSchema = z.object({
  bookingCode: z.string().min(1, "Booking code is required"),
  otp: z.string().min(4, "4-digit OTP is required"),
  odometerReading: z.number().int().positive("Valid odometer reading is required"),
  fuelOrBatteryPercent: z.number().int().min(10).max(100),
  passedSanitization: z.boolean().default(true),
  damageNotes: z.string().optional(),
});

export type VerifyPickupOtpInput = z.infer<typeof verifyPickupOtpSchema>;

export interface VerifyPickupOtpResult {
  success: boolean;
  message?: string;
  bookingCode?: string;
  error?: string;
}

export async function verifyPickupOtpAction(
  input: VerifyPickupOtpInput
): Promise<VerifyPickupOtpResult> {
  try {
    const validated = verifyPickupOtpSchema.parse(input);
    const supabase = await createClient();

    // 1. Authenticate user and verify operational role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized: Please sign in to verify handovers.",
      };
    }

    const role = await getUserRole(user.id);
    if (role !== "agent" && role !== "master_admin") {
      return {
        success: false,
        error: "Forbidden: Only certified Homie Drives hub agents or admins can verify pickups.",
      };
    }

    // 2. Resolve Agent Profile
    const { data: agent } = await supabase
      .from("agents")
      .select("id, hub_id")
      .eq("profile_id", user.id)
      .maybeSingle();

    // 3. Find target booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, booking_code, status, pickup_otp_hash, pickup_hub_id, vehicle_id, customer_id")
      .eq("booking_code", validated.bookingCode.trim())
      .maybeSingle();

    if (bookingError || !booking) {
      return {
        success: false,
        error: `Booking ${validated.bookingCode} not found in system records.`,
      };
    }

    if (booking.status !== "pending_pickup") {
      return {
        success: false,
        error: `Cannot verify pickup: Booking is currently in '${booking.status.replace("_", " ")}' status.`,
      };
    }

    // 4. Verify OTP against stored hash/code
    if (booking.pickup_otp_hash !== validated.otp.trim()) {
      return {
        success: false,
        error: "Invalid Customer OTP. Please ask customer to show their digital pass PIN.",
      };
    }

    // 5. Update booking status to 'verified_handover'
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "verified_handover",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    if (updateError) {
      return {
        success: false,
        error: `Failed to transition booking status: ${updateError.message}`,
      };
    }

    // 6. Record pre-handover inspection log if agent record exists
    if (agent) {
      await supabase.from("rental_inspections").insert({
        booking_id: booking.id,
        agent_id: agent.id,
        type: "pre_handover",
        odometer_reading: validated.odometerReading,
        fuel_or_battery_percent: validated.fuelOrBatteryPercent,
        inspection_video_path: "storage/inspections/pending-upload.mp4",
        passed_sanitization: validated.passedSanitization,
        damage_notes: validated.damageNotes || "Pre-trip 360 inspection passed. No structural anomalies.",
      });
    }

    // 7. Record immutable audit log
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "BOOKING_OTP_VERIFIED",
      entity_name: "bookings",
      entity_id: booking.id,
      payload: {
        booking_code: booking.booking_code,
        agent_id: agent?.id ?? user.id,
        odometer_reading: validated.odometerReading,
        fuel_percent: validated.fuelOrBatteryPercent,
        new_status: "verified_handover",
      },
    });

    revalidatePath("/agent");
    revalidatePath("/ride");
    revalidatePath("/profile");

    return {
      success: true,
      message: `Pickup confirmed for booking ${booking.booking_code}. Handover authorization granted.`,
      bookingCode: booking.booking_code,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((i) => i.message).join(", "),
      };
    }
    const message = err instanceof Error ? err.message : "Handover verification failed.";
    return {
      success: false,
      error: message,
    };
  }
}

// ==============================================================================
// 2. Zod Schema & Action: Vehicle Operational Status Toggle (Maintenance/Active)
// ==============================================================================
export const toggleVehicleStatusSchema = z.object({
  vehicleId: z.string().uuid("Valid vehicle UUID required"),
  status: z.enum(["active", "maintenance", "decommissioned"]),
  reason: z.string().optional(),
});

export type ToggleVehicleStatusInput = z.infer<typeof toggleVehicleStatusSchema>;

export async function toggleVehicleOperationalStatusAction(
  input: ToggleVehicleStatusInput
) {
  try {
    const validated = toggleVehicleStatusSchema.parse(input);
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "agent" && role !== "master_admin") {
      return { success: false, error: "Forbidden: Agent or Admin role required." };
    }

    const { error: updateError } = await supabase
      .from("vehicles")
      .update({
        operational_status: validated.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.vehicleId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "VEHICLE_STATUS_CHANGED",
      entity_name: "vehicles",
      entity_id: validated.vehicleId,
      payload: {
        new_status: validated.status,
        reason: validated.reason || "Operational toggle by hub agent",
      },
    });

    revalidatePath("/agent");
    revalidatePath("/admin");
    revalidatePath("/plan");
    revalidatePath("/");

    return {
      success: true,
      message: `Vehicle status changed to '${validated.status}'.`,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((i) => i.message).join(", ") };
    }
    const message = err instanceof Error ? err.message : "Failed to toggle vehicle status.";
    return { success: false, error: message };
  }
}
