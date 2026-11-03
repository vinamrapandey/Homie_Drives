"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/roles";
import { revalidatePath } from "next/cache";
import {
  DEFAULT_PLATFORM_SETTINGS,
  HolidaySurgeRule,
  INITIAL_HOLIDAY_RULES,
} from "@/data/platformSettings";

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
  isWeekendSurgeEnabled: z.boolean().default(true),
  weekendSurgeMultiplier: z.number().min(1.0).max(1.5).default(1.15),
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
          weekendSurge: validated.isWeekendSurgeEnabled,
          reason: validated.surgeReason,
        },
      });
    }

    // In-memory update
    DEFAULT_PLATFORM_SETTINGS.gstPercent = validated.gstPercent;
    DEFAULT_PLATFORM_SETTINGS.platformFeePercent = validated.platformFeePercent;
    DEFAULT_PLATFORM_SETTINGS.fastagBufferINR = validated.fastagBufferINR;
    DEFAULT_PLATFORM_SETTINGS.securityDepositINR = validated.securityDepositINR;
    DEFAULT_PLATFORM_SETTINGS.pristineMultiplier = validated.pristineMultiplier;
    DEFAULT_PLATFORM_SETTINGS.mintMultiplier = validated.mintMultiplier;
    DEFAULT_PLATFORM_SETTINGS.touringMultiplier = validated.touringMultiplier;
    DEFAULT_PLATFORM_SETTINGS.surgeMultiplierCeiling = validated.surgeMultiplierCeiling;
    DEFAULT_PLATFORM_SETTINGS.surgeActive = validated.surgeActive;
    DEFAULT_PLATFORM_SETTINGS.surgeReason = validated.surgeReason;
    DEFAULT_PLATFORM_SETTINGS.isWeekendSurgeEnabled = validated.isWeekendSurgeEnabled;
    DEFAULT_PLATFORM_SETTINGS.weekendSurgeMultiplier = validated.weekendSurgeMultiplier;

    revalidatePath("/admin");
    revalidatePath("/plan");
    revalidatePath("/cars");
    revalidatePath("/");

    return {
      success: true,
      message: `Global pricing engine calibrated: GST ${validated.gstPercent}%, Fee ${validated.platformFeePercent}%, Weekend Surge ${validated.isWeekendSurgeEnabled ? "ON" : "OFF"}, High-Demand Surge ${validated.surgeActive ? "ON" : "OFF"}.`,
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

// ==============================================================================
// Holiday Surge Rule Actions
// ==============================================================================
export const holidayRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Holiday title required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format (YYYY-MM-DD)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format (YYYY-MM-DD)"),
  multiplier: z.number().min(1.0).max(2.0, "Multiplier between 1.0x and 2.0x"),
  isActive: z.boolean().default(true),
  description: z.string().default("Delhi NCR peak highway surge corridor."),
});

export type HolidayRuleInput = z.infer<typeof holidayRuleSchema>;

export async function saveHolidayRuleAction(input: HolidayRuleInput) {
  try {
    const validated = holidayRuleSchema.parse(input);
    const ruleId = validated.id || `hol-${Date.now().toString(36)}`;

    const newRule: HolidaySurgeRule = {
      id: ruleId,
      name: validated.name,
      startDate: validated.startDate,
      endDate: validated.endDate,
      multiplier: validated.multiplier,
      isActive: validated.isActive,
      description: validated.description,
    };

    const existingIdx = INITIAL_HOLIDAY_RULES.findIndex((r) => r.id === ruleId);
    if (existingIdx >= 0) {
      INITIAL_HOLIDAY_RULES[existingIdx] = newRule;
    } else {
      INITIAL_HOLIDAY_RULES.push(newRule);
    }

    revalidatePath("/admin");
    revalidatePath("/cars");
    revalidatePath("/plan");

    return {
      success: true,
      message: `Holiday Surge Rule "${newRule.name}" saved (${(newRule.multiplier * 100 - 100).toFixed(0)}% surge).`,
      rule: newRule,
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
      error: err instanceof Error ? err.message : "Failed to save holiday rule",
    };
  }
}

export async function toggleHolidayRuleAction(ruleId: string) {
  const rule = INITIAL_HOLIDAY_RULES.find((r) => r.id === ruleId);
  if (!rule) {
    return { success: false, error: "Rule not found" };
  }
  rule.isActive = !rule.isActive;
  revalidatePath("/admin");
  return {
    success: true,
    message: `Holiday rule "${rule.name}" is now ${rule.isActive ? "ACTIVE" : "INACTIVE"}.`,
    isActive: rule.isActive,
  };
}

export async function deleteHolidayRuleAction(ruleId: string) {
  const idx = INITIAL_HOLIDAY_RULES.findIndex((r) => r.id === ruleId);
  if (idx >= 0) {
    const deleted = INITIAL_HOLIDAY_RULES.splice(idx, 1)[0];
    revalidatePath("/admin");
    return {
      success: true,
      message: `Holiday rule "${deleted.name}" removed from calendar.`,
    };
  }
  return { success: false, error: "Rule not found" };
}
