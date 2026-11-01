"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/roles";
import { revalidatePath } from "next/cache";

// ==============================================================================
// Zod Schema: Trip Return & Deposit Settlement
// ==============================================================================
export const settleBookingSchema = z.object({
  bookingCode: z.string().min(1, "Booking code is required"),
  finalOdometerReading: z.number().int().positive("Valid return odometer reading required"),
  finalFuelOrBatteryPercent: z.number().int().min(5).max(100),
  fastagTollChargesINR: z.number().int().min(0).default(0),
  excessKmChargesINR: z.number().int().min(0).default(0),
  damageOrCleaningDeductionINR: z.number().int().min(0).default(0),
  settlementNotes: z.string().optional(),
});

export type SettleBookingInput = z.infer<typeof settleBookingSchema>;

export interface SettleBookingResult {
  success: boolean;
  message?: string;
  error?: string;
  bookingCode?: string;
  depositHeldINR?: number;
  totalDeductionsINR?: number;
  netRefundINR?: number;
}

export async function settleBookingReturnAction(
  input: SettleBookingInput
): Promise<SettleBookingResult> {
  try {
    const validated = settleBookingSchema.parse(input);
    const supabase = await createClient();

    // 1. Enforce Agent or Admin Role Server-Side
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized: Please authenticate to process deposit settlements.",
      };
    }

    const role = await getUserRole(user.id);
    if (role !== "agent" && role !== "master_admin") {
      return {
        success: false,
        error: "Forbidden: Only certified Hub agents or Master Admins can finalize rental settlements.",
      };
    }

    // 2. Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, booking_code, status, vehicle_id, customer_id, security_deposit_inr, fastag_buffer_inr")
      .eq("booking_code", validated.bookingCode.trim())
      .maybeSingle();

    if (bookingError || !booking) {
      return {
        success: false,
        error: `Booking ${validated.bookingCode} not found in system records.`,
      };
    }

    if (booking.status === "closed") {
      return {
        success: false,
        error: `Booking ${validated.bookingCode} is already settled and closed.`,
      };
    }

    // 3. Calculate Financial Deductions & Net Refund
    const totalDeductions =
      validated.fastagTollChargesINR +
      validated.excessKmChargesINR +
      validated.damageOrCleaningDeductionINR;

    const depositHeld = booking.security_deposit_inr || 5000;
    const netRefund = Math.max(0, depositHeld - totalDeductions);

    // 4. Update Booking Status to 'closed'
    // This removes the active exclusion constraint lock (rental_period TSTZRANGE) on the vehicle
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "closed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    if (updateError) {
      return {
        success: false,
        error: `Failed to close booking: ${updateError.message}`,
      };
    }

    // 5. Append Immutable Audit Log
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "DEPOSIT_SETTLEMENT_CLOSED",
      entity_name: "bookings",
      entity_id: booking.id,
      payload: {
        booking_code: booking.booking_code,
        vehicle_id: booking.vehicle_id,
        customer_id: booking.customer_id,
        final_odometer: validated.finalOdometerReading,
        final_fuel_battery: validated.finalFuelOrBatteryPercent,
        deposit_held_inr: depositHeld,
        fastag_toll_deductions_inr: validated.fastagTollChargesINR,
        excess_km_deductions_inr: validated.excessKmChargesINR,
        damage_deductions_inr: validated.damageOrCleaningDeductionINR,
        total_deductions_inr: totalDeductions,
        net_refund_released_inr: netRefund,
        notes: validated.settlementNotes || "Normal return settlement and deposit release.",
      },
    });

    // 6. Revalidate all portals
    revalidatePath("/agent");
    revalidatePath("/admin");
    revalidatePath("/ride");
    revalidatePath("/profile");

    return {
      success: true,
      message: `Rental settled successfully. Net deposit of ₹${netRefund.toLocaleString("en-IN")} released to customer.`,
      bookingCode: booking.booking_code,
      depositHeldINR: depositHeld,
      totalDeductionsINR: totalDeductions,
      netRefundINR: netRefund,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((i) => i.message).join(", "),
      };
    }
    const message = err instanceof Error ? err.message : "Settlement processing failed.";
    return {
      success: false,
      error: message,
    };
  }
}

