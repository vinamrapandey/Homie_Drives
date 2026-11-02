"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/roles";
import { revalidatePath } from "next/cache";
import { PlatformPricingSettings } from "@/data/platformSettings";

export const updatePlatformSettingsSchema = z.object({
  gstPercent: z.number().min(0).max(28, "GST cannot exceed 28%"),
  platformFeePercent: z.number().min(0).max(20, "Platform fee cannot exceed 20%"),
  fastagBufferINR: z.number().min(0).max(5000, "FASTag buffer cannot exceed ₹5,000"),
  securityDepositINR: z.number().min(0).max(50000, "Standard deposit cannot exceed ₹50,000"),
  pristineMultiplier: z.number().min(1.0).max(2.0, "Pristine multiplier between 1.0x and 2.0x"),
  mintMultiplier: z.number().min(0.8).max(1.5, "Mint multiplier between 0.8x and 1.5x"),
  touringMultiplier: z.number().min(0.5).max(1.0, "Touring multiplier between 0.5x and 1.0x"),
  surgeMultiplierCeiling: z.number().min(1.0).max(2.5, "Surge ceiling max 2.5x"),
  surgeActive: z.boolean(),
  surgeReason: z.string().min(3, "Audit reason required for pricing settings modification"),
});

export type UpdatePlatformSettingsInput = z.infer<typeof updatePlatformSettingsSchema>;

export async function updatePlatformSettingsAction(input: UpdatePlatformSettingsInput) {
  try {
    const validated = updatePlatformSettingsSchema.parse(input);
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
          error: "Forbidden: Only Master Administrators are authorized to alter global financial multipliers.",
        };
      }

      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        action: "PLATFORM_PRICING_CONFIG_UPDATED",
        entity_name: "platform_settings",
        entity_id: "global",
        payload: {
          gstPercent: validated.gstPercent,
          platformFeePercent: validated.platformFeePercent,
          fastagBufferINR: validated.fastagBufferINR,
          pristineMultiplier: validated.pristineMultiplier,
          touringMultiplier: validated.touringMultiplier,
          surgeActive: validated.surgeActive,
          reason: validated.surgeReason,
        },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/plan");
    revalidatePath("/cars");
    revalidatePath("/");

    return {
      success: true,
      message: `Global pricing engine calibrated: GST ${validated.gstPercent}%, Fee ${validated.platformFeePercent}%, Surge ${validated.surgeActive ? "ON" : "OFF"}.`,
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
      error: err instanceof Error ? err.message : "Failed to update platform settings",
    };
  }
}

