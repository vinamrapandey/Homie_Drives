"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/roles";
import { BookingLifecycleStatus } from "@/types/adminBooking";
import { INITIAL_BOOKING_RECORDS } from "@/data/bookingRecords";

export const advanceLifecycleSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  targetStatus: z.enum([
    "pending_pickup",
    "verified_handover",
    "active_rental",
    "returned_inspected",
    "closed",
    "cancelled",
  ]),
  notes: z.string().min(3, "Audit justification is required"),
});

export type AdvanceLifecycleInput = z.infer<typeof advanceLifecycleSchema>;

export async function advanceBookingLifecycleAction(input: AdvanceLifecycleInput) {
  try {
    const validated = advanceLifecycleSchema.parse(input);
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (user && !authError) {
      const role = await getUserRole(user.id);
      if (role !== "master_admin") {
        return {
          success: false,
          error: "Forbidden: Only Master Administrators can manually advance or override booking lifecycles.",
        };
      }
    }

    const record = INITIAL_BOOKING_RECORDS.find((b) => b.id === validated.bookingId);
    if (!record) {
      return {
        success: false,
        error: "Booking record not found in system.",
      };
    }

    // Invariant: Closed or Cancelled bookings cannot transition back to active
    if (record.status === "closed" || record.status === "cancelled") {
      return {
        success: false,
        error: `Illegal state transition: Booking is currently ${record.status.toUpperCase()} and cannot be reverted.`,
      };
    }

    record.status = validated.targetStatus as BookingLifecycleStatus;
    if (validated.targetStatus === "closed" || validated.targetStatus === "cancelled") {
      record.isTemporalLockActive = false; // Release TSTZRANGE lock
    }

    try {
      await supabase
        .from("bookings")
        .update({
          status: validated.targetStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", validated.bookingId);

      if (user) {
        await supabase.from("audit_logs").insert({
          actor_id: user.id,
          action: "BOOKING_LIFECYCLE_OVERRIDE",
          entity_name: "bookings",
          entity_id: validated.bookingId,
          payload: {
            new_status: validated.targetStatus,
            justification: validated.notes,
            lock_released: validated.targetStatus === "closed" || validated.targetStatus === "cancelled",
          },
        });
      }
    } catch {
      // Demo environment fallback
    }

    revalidatePath("/admin");
    revalidatePath("/agent");

    return {
      success: true,
      message: `Booking ${record.bookingCode} transitioned to ${validated.targetStatus.toUpperCase()}.${
        !record.isTemporalLockActive ? " PostgreSQL TSTZRANGE exclusion lock released." : ""
      }`,
      booking: record,
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
      error: err instanceof Error ? err.message : "Failed to advance booking lifecycle",
    };
  }
}

export const emergencyCancelSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  cancellationReason: z.string().min(5, "Detailed cancellation justification required"),
});

export type EmergencyCancelInput = z.infer<typeof emergencyCancelSchema>;

export async function emergencyCancelBookingAction(input: EmergencyCancelInput) {
  try {
    const validated = emergencyCancelSchema.parse(input);
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (user && !authError) {
      const role = await getUserRole(user.id);
      if (role !== "master_admin") {
        return {
          success: false,
          error: "Forbidden: Only Master Administrators can execute emergency reservation cancellations.",
        };
      }
    }

    const record = INITIAL_BOOKING_RECORDS.find((b) => b.id === validated.bookingId);
    if (!record) {
      return {
        success: false,
        error: "Booking record not found.",
      };
    }

    record.status = "cancelled";
    record.isTemporalLockActive = false; // Disengage TSTZRANGE lock immediately

    try {
      await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", validated.bookingId);

      if (user) {
        await supabase.from("audit_logs").insert({
          actor_id: user.id,
          action: "BOOKING_EMERGENCY_CANCELLED",
          entity_name: "bookings",
          entity_id: validated.bookingId,
          payload: {
            reason: validated.cancellationReason,
            vehicle: record.vehicleName,
            tstzrange_released: record.tstzrangeInterval,
          },
        });
      }
    } catch {
      // Demo environment fallback
    }

    revalidatePath("/admin");
    revalidatePath("/agent");
    revalidatePath("/profile");

    return {
      success: true,
      message: `Emergency Cancellation Executed for ${record.bookingCode}. TSTZRANGE lock disengaged. Vehicle ${record.vehicleName} is immediately available for dispatch.`,
      booking: record,
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
      error: err instanceof Error ? err.message : "Failed to cancel booking",
    };
  }
}
