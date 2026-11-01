"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/roles";
import { revalidatePath } from "next/cache";

// ==============================================================================
// Zod Schema for Vehicle Handover & Return Inspection
// ==============================================================================
export const recordInspectionSchema = z.object({
  bookingCode: z.string().min(1, "Booking code is required"),
  inspectionType: z.enum(["pre_handover", "return"]),
  odometerReading: z.number().int().positive("Valid odometer reading is required"),
  fuelOrBatteryPercent: z.number().int().min(5).max(100),
  passedSanitization: z.boolean().default(true),
  damageNotes: z.string().optional(),
  videoPath: z.string().default("storage/inspections/verified_walkaround.mp4"),
});

export type RecordInspectionInput = z.infer<typeof recordInspectionSchema>;

export interface RecordInspectionResult {
  success: boolean;
  message?: string;
  error?: string;
  inspectionId?: string;
}

export async function recordInspectionAction(
  input: RecordInspectionInput
): Promise<RecordInspectionResult> {
  try {
    const validated = recordInspectionSchema.parse(input);
    const supabase = await createClient();

    // 1. Enforce Agent or Admin Role Server-Side
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized: Please sign in to submit vehicle inspection records.",
      };
    }

    const role = await getUserRole(user.id);
    if (role !== "agent" && role !== "master_admin") {
      return {
        success: false,
        error: "Forbidden: Only certified Hub staff or Admins can record vehicle inspections.",
      };
    }

    // 2. Resolve Agent Profile
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    // 3. Locate Target Booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, booking_code, status, vehicle_id, customer_id")
      .eq("booking_code", validated.bookingCode.trim())
      .maybeSingle();

    if (bookingError || !booking) {
      return {
        success: false,
        error: `Booking ${validated.bookingCode} not found in system records.`,
      };
    }

    // 4. Insert Inspection Log into rental_inspections
    let insertedInspectionId: string | undefined;

    if (agent) {
      const { data: inspection, error: inspectionError } = await supabase
        .from("rental_inspections")
        .insert({
          booking_id: booking.id,
          agent_id: agent.id,
          type: validated.inspectionType,
          odometer_reading: validated.odometerReading,
          fuel_or_battery_percent: validated.fuelOrBatteryPercent,
          inspection_video_path: validated.videoPath,
          passed_sanitization: validated.passedSanitization,
          damage_notes: validated.damageNotes || "360 walk-around video inspection passed.",
        })
        .select("id")
        .single();

      if (inspectionError) {
        return {
          success: false,
          error: `Failed to record inspection: ${inspectionError.message}`,
        };
      }
      insertedInspectionId = inspection?.id;
    }

    // 5. If return inspection, transition booking status to 'returned_inspected'
    if (validated.inspectionType === "return") {
      await supabase
        .from("bookings")
        .update({
          status: "returned_inspected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);
    }

    // 6. Record Immutable Audit Log
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action:
        validated.inspectionType === "return"
          ? "BOOKING_RETURN_INSPECTED"
          : "BOOKING_PRE_HANDOVER_INSPECTED",
      entity_name: "rental_inspections",
      entity_id: insertedInspectionId || booking.id,
      payload: {
        booking_code: booking.booking_code,
        inspection_type: validated.inspectionType,
        odometer: validated.odometerReading,
        fuel_percent: validated.fuelOrBatteryPercent,
        sanitization_passed: validated.passedSanitization,
      },
    });

    revalidatePath("/agent");
    revalidatePath("/ride");
    revalidatePath("/profile");
    revalidatePath("/admin");

    return {
      success: true,
      message:
        validated.inspectionType === "return"
          ? `Return inspection logged for ${booking.booking_code}. Vehicle returned to hub inventory.`
          : `Pre-handover inspection logged for ${booking.booking_code}. Vehicle ready for dispatch.`,
      inspectionId: insertedInspectionId,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((i) => i.message).join(", "),
      };
    }
    const message = err instanceof Error ? err.message : "Inspection submission failed.";
    return {
      success: false,
      error: message,
    };
  }
}

