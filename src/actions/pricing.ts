"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/roles";
import { revalidatePath } from "next/cache";

// ==============================================================================
// Zod Schema for Base Rate & Deposit Modification
// ==============================================================================
export const updatePricingSchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle UUID"),
  baseDailyPriceINR: z.number().int().min(1999, "Minimum daily rate is ₹1,999").max(99999, "Maximum daily rate is ₹99,999"),
  securityDepositINR: z.number().int().min(2000, "Minimum deposit is ₹2,000").max(100000, "Maximum deposit is ₹100,000"),
  reason: z.string().min(3, "Reason for price modification is required for audit compliance"),
});

export type UpdatePricingInput = z.infer<typeof updatePricingSchema>;

export interface UpdatePricingResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function updateVehiclePricingAction(
  input: UpdatePricingInput
): Promise<UpdatePricingResult> {
  try {
    const validated = updatePricingSchema.parse(input);
    const supabase = await createClient();

    // 1. Enforce Master Admin Role Server-Side
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized: Please authenticate to modify platform pricing.",
      };
    }

    const role = await getUserRole(user.id);
    if (role !== "master_admin") {
      return {
        success: false,
        error: "Forbidden: Only Master Administrators are authorized to alter fleet pricing models.",
      };
    }

    // 2. Fetch current vehicle pricing for audit record
    const { data: currentVehicle, error: fetchError } = await supabase
      .from("vehicles")
      .select("id, name, slug, base_daily_price_inr, security_deposit_inr")
      .eq("id", validated.vehicleId)
      .maybeSingle();

    if (fetchError || !currentVehicle) {
      return {
        success: false,
        error: "Vehicle not found in fleet records.",
      };
    }

    // 3. Mutate Vehicle Pricing
    const { error: updateError } = await supabase
      .from("vehicles")
      .update({
        base_daily_price_inr: validated.baseDailyPriceINR,
        security_deposit_inr: validated.securityDepositINR,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.vehicleId);

    if (updateError) {
      return {
        success: false,
        error: `Database update failed: ${updateError.message}`,
      };
    }

    // 4. Generate Immutable Audit Log Entry
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "PRICING_UPDATED",
      entity_name: "vehicles",
      entity_id: validated.vehicleId,
      payload: {
        vehicle_name: currentVehicle.name,
        vehicle_slug: currentVehicle.slug,
        old_daily_rate: currentVehicle.base_daily_price_inr,
        new_daily_rate: validated.baseDailyPriceINR,
        old_deposit: currentVehicle.security_deposit_inr,
        new_deposit: validated.securityDepositINR,
        reason: validated.reason,
      },
    });

    // 5. Revalidate affected routes across customer and admin portals
    revalidatePath("/admin");
    revalidatePath("/plan");
    revalidatePath("/ride");
    revalidatePath("/");

    return {
      success: true,
      message: `Updated rate for ${currentVehicle.name} to ₹${validated.baseDailyPriceINR.toLocaleString("en-IN")}/day.`,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((i) => i.message).join(", "),
      };
    }
    const message = err instanceof Error ? err.message : "Failed to update pricing.";
    return {
      success: false,
      error: message,
    };
  }
}

