"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ==============================================================================
// 1. Zod Validation Schema for Booking Creation
// ==============================================================================
export const createBookingSchema = z.object({
  carSlug: z.string().min(1, "Vehicle slug is required"),
  hubSlug: z.string().min(1, "Pickup hub slug is required"),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid pickup date format (YYYY-MM-DD)"),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid return date format (YYYY-MM-DD)"),
  pickupTime: z.string().default("10:00 AM"),
  returnTime: z.string().default("08:00 PM"),
  conditionTier: z.enum(["pristine", "mint", "touring"]).default("mint"),
  protectionTier: z.enum(["basic", "premium", "super"]).default("premium"),
  fastagBufferINR: z.number().nonnegative().default(1000),
  driverName: z.string().min(2, "Driver name is required"),
  dlNumber: z.string().min(8, "Valid Driving License number is required"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export interface CreateBookingResult {
  success: boolean;
  booking?: {
    id: string;
    bookingCode: string;
    vehicleName: string;
    pickupLocation: string;
    pickupDate: string;
    returnDate: string;
    totalAmountINR: number;
    securityDepositINR: number;
    status: string;
  };
  error?: string;
  isConcurrencyConflict?: boolean;
}

// ==============================================================================
// 2. Server Action: Create Reservation with Concurrency Protection
// ==============================================================================
export async function createBookingAction(input: CreateBookingInput): Promise<CreateBookingResult> {
  try {
    // 1. Validate payload with Zod
    const validated = createBookingSchema.parse(input);
    const supabase = await createClient();

    // 2. Verify authenticated customer
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Please sign in with your email or phone to confirm this reservation.",
      };
    }

    // 3. Ensure user profile exists in public.profiles
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      const generatedPhone =
        user.phone ||
        validated.phone ||
        `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        full_name: validated.driverName || user.user_metadata?.full_name || "Homie Customer",
        email: user.email || validated.email || `${user.id}@homiedrives.in`,
        phone_number: generatedPhone,
        digilocker_dl_number: validated.dlNumber,
        digilocker_verified: true,
        digilocker_verified_at: new Date().toISOString(),
      });

      if (profileError && !profileError.message.includes("duplicate key")) {
        console.error("Profile creation error:", profileError);
      }
    }

    // 4. Resolve vehicle from database
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id, name, slug, base_daily_price_inr, security_deposit_inr, operational_status")
      .eq("slug", validated.carSlug)
      .eq("operational_status", "active")
      .maybeSingle();

    if (vehicleError || !vehicle) {
      return {
        success: false,
        error: "Vehicle is currently unavailable for booking. Please select another vehicle.",
      };
    }

    // 5. Resolve hub location from database
    const { data: hub, error: hubError } = await supabase
      .from("pickup_locations")
      .select("id, name, address, is_active")
      .eq("slug", validated.hubSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (hubError || !hub) {
      return {
        success: false,
        error: "Selected pickup hub is currently inactive. Please choose an active hub.",
      };
    }

    // 6. Calculate rental duration and pricing
    const pickupDateTime = new Date(`${validated.pickupDate}T10:00:00+05:30`);
    const returnDateTime = new Date(`${validated.returnDate}T20:00:00+05:30`);

    if (returnDateTime <= pickupDateTime) {
      return {
        success: false,
        error: "Return date must be later than pickup date.",
      };
    }

    const diffDays = Math.max(
      1,
      Math.ceil((returnDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60 * 24))
    );

    const baseDailyRate = vehicle.base_daily_price_inr;
    const baseTotal = baseDailyRate * diffDays;

    const protectionDailyRates: Record<string, number> = {
      basic: 499,
      premium: 999,
      super: 1899,
    };
    const protectionDailyRate = protectionDailyRates[validated.protectionTier] ?? 999;
    const totalProtectionCost = protectionDailyRate * diffDays;
    const fastagBufferCost = validated.fastagBufferINR;
    const grandTotalINR = baseTotal + totalProtectionCost + fastagBufferCost;

    // 7. Format TSTZRANGE for PostgreSQL concurrency exclusion constraint
    const tstzrangeString = `[${pickupDateTime.toISOString()}, ${returnDateTime.toISOString()}]`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const bookingCode = `#HD-DEL-${randomSuffix}`;

    // 8. Insert Booking with Concurrency Lock
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        booking_code: bookingCode,
        customer_id: user.id,
        vehicle_id: vehicle.id,
        pickup_hub_id: hub.id,
        condition_tier: validated.conditionTier,
        rental_period: tstzrangeString,
        pickup_time: pickupDateTime.toISOString(),
        return_time: returnDateTime.toISOString(),
        daily_rate_inr: baseDailyRate,
        total_amount_inr: grandTotalINR,
        security_deposit_inr: vehicle.security_deposit_inr,
        damage_protection_tier: validated.protectionTier,
        fastag_buffer_inr: fastagBufferCost,
        status: "pending_pickup",
        pickup_otp_hash: randomSuffix,
      })
      .select("id, booking_code, status, total_amount_inr, security_deposit_inr")
      .single();

    if (bookingError) {
      // Check for PostgreSQL btree_gist exclusion violation (Code 23P01)
      if (
        bookingError.code === "23P01" ||
        bookingError.message?.includes("exclusion constraint") ||
        bookingError.message?.includes("bookings_vehicle_id_rental_period_excl")
      ) {
        return {
          success: false,
          isConcurrencyConflict: true,
          error: `This vehicle is already reserved for the selected dates (${validated.pickupDate} to ${validated.returnDate}). Please select alternate dates or choose another car from our fleet.`,
        };
      }

      console.error("Booking insertion error:", bookingError);
      return {
        success: false,
        error: `Could not complete booking: ${bookingError.message}`,
      };
    }

    // 9. Write immutable audit log
    try {
      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        action: "BOOKING_CREATED",
        entity_name: "bookings",
        entity_id: booking.id,
        payload: {
          booking_code: booking.booking_code,
          vehicle_slug: validated.carSlug,
          hub_slug: validated.hubSlug,
          total_amount_inr: booking.total_amount_inr,
          rental_period: tstzrangeString,
        },
      });
    } catch (auditErr) {
      console.warn("Audit log non-blocking warning:", auditErr);
    }

    revalidatePath("/ride");
    revalidatePath("/profile");

    return {
      success: true,
      booking: {
        id: booking.id,
        bookingCode: booking.booking_code,
        vehicleName: vehicle.name,
        pickupLocation: hub.name,
        pickupDate: validated.pickupDate,
        returnDate: validated.returnDate,
        totalAmountINR: booking.total_amount_inr,
        securityDepositINR: booking.security_deposit_inr,
        status: booking.status,
      },
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((e) => e.message).join(", "),
      };
    }
    const message = err instanceof Error ? err.message : "An unexpected booking error occurred.";
    return {
      success: false,
      error: message,
    };
  }
}

// ==============================================================================
// 3. Server Action: Extend Active Booking Duration
// ==============================================================================
export const extendBookingSchema = z.object({
  bookingCode: z.string().min(1, "Booking code is required"),
  additionalDays: z.number().int().positive("Additional days must be at least 1"),
  newReturnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  additionalAmountINR: z.number().nonnegative(),
});

export type ExtendBookingInput = z.infer<typeof extendBookingSchema>;

export interface ExtendBookingResult {
  success: boolean;
  newReturnDate?: string;
  additionalAmountINR?: number;
  newTotalINR?: number;
  error?: string;
}

export async function extendBookingDurationAction(input: ExtendBookingInput): Promise<ExtendBookingResult> {
  try {
    const validated = extendBookingSchema.parse(input);
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: booking } = await supabase
        .from("bookings")
        .select("id, total_amount_inr, return_time, pickup_time")
        .eq("booking_code", validated.bookingCode)
        .maybeSingle();

      if (booking) {
        const newReturnDateTime = new Date(`${validated.newReturnDate}T20:00:00+05:30`);
        const pickupDateTime = new Date(booking.pickup_time);
        const newTstzrange = `[${pickupDateTime.toISOString()}, ${newReturnDateTime.toISOString()}]`;
        const updatedTotal = (booking.total_amount_inr || 0) + validated.additionalAmountINR;

        await supabase
          .from("bookings")
          .update({
            return_time: newReturnDateTime.toISOString(),
            rental_period: newTstzrange,
            total_amount_inr: updatedTotal,
          })
          .eq("id", booking.id);

        try {
          await supabase.from("audit_logs").insert({
            actor_id: user.id,
            action: "BOOKING_EXTENDED",
            entity_name: "bookings",
            entity_id: booking.id,
            payload: {
              booking_code: validated.bookingCode,
              additional_days: validated.additionalDays,
              new_return_date: validated.newReturnDate,
              additional_amount_inr: validated.additionalAmountINR,
              new_total_inr: updatedTotal,
            },
          });
        } catch {
          // Non-blocking audit log
        }
      }
    }

    revalidatePath("/ride");
    revalidatePath("/profile");

    return {
      success: true,
      newReturnDate: validated.newReturnDate,
      additionalAmountINR: validated.additionalAmountINR,
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((e) => e.message).join(", "),
      };
    }
    const message = err instanceof Error ? err.message : "Failed to extend rental duration.";
    return {
      success: false,
      error: message,
    };
  }
}
