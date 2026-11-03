"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { FastagTollEvent } from "@/types/fastag";
import { DELHI_NCR_TOLL_PLAZAS, INITIAL_FASTAG_EVENTS } from "@/data/fastagEvents";
import { INITIAL_SETTLEMENT_RECORDS } from "@/data/settlementRecords";

export const simulateTollSchema = z.object({
  bookingCode: z.string().min(3, "Booking reference required"),
  vehicleRegistration: z.string().min(4, "Vehicle registration required"),
  vehicleName: z.string().min(2, "Vehicle model required"),
  plazaId: z.string().min(1, "Plaza ID required"),
  customLaneId: z.string().optional(),
});

export type SimulateTollInput = z.infer<typeof simulateTollSchema>;

export async function simulateFastagTollCrossingAction(input: SimulateTollInput): Promise<{
  success: boolean;
  event?: FastagTollEvent;
  message?: string;
  error?: string;
}> {
  try {
    const validated = simulateTollSchema.parse(input);
    const plaza = DELHI_NCR_TOLL_PLAZAS.find((p) => p.id === validated.plazaId);
    if (!plaza) {
      return { success: false, error: "Toll plaza definition not found" };
    }

    const laneId =
      validated.customLaneId ||
      plaza.lanes[Math.floor(Math.random() * plaza.lanes.length)];

    // Find latest event for this booking to calculate new balance
    const priorEvents = INITIAL_FASTAG_EVENTS.filter((e) => e.bookingCode === validated.bookingCode);
    const lastBalance = priorEvents.length > 0 ? priorEvents[0].balanceRemainingINR : 1000;
    const newBalance = Math.max(0, lastBalance - plaza.standardCarTollINR);
    const isLowBalance = newBalance < 200;

    const eventId = `ft-evt-${Date.now().toString(36)}`;
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);

    const newEvent: FastagTollEvent = {
      id: eventId,
      bookingCode: validated.bookingCode,
      vehicleRegistration: validated.vehicleRegistration,
      vehicleName: validated.vehicleName,
      plazaName: plaza.name,
      corridor: plaza.corridor,
      laneId,
      tollAmountINR: plaza.standardCarTollINR,
      timestamp: nowStr,
      status: isLowBalance ? "low_balance_warning" : "cleared",
      balanceRemainingINR: newBalance,
      readerId: `NETC-RFID-${plaza.expresswayCode}-${laneId.split("-").pop() || "01"}`,
    };

    // Prepend event
    INITIAL_FASTAG_EVENTS.unshift(newEvent);

    // Sync to settlement record if active
    const cleanRef = validated.bookingCode.startsWith("#")
      ? validated.bookingCode
      : `#${validated.bookingCode}`;
    const matchingSettlement = INITIAL_SETTLEMENT_RECORDS.find(
      (s) => s.bookingRef === cleanRef || s.vehicleRegistration === validated.vehicleRegistration
    );

    if (matchingSettlement) {
      matchingSettlement.fastagTollsINR += plaza.standardCarTollINR;
      matchingSettlement.tollPlazas.push({
        plazaName: plaza.name,
        highwayName: plaza.corridor,
        timestamp: `${nowStr} (Simulated)`,
        tollFeeINR: plaza.standardCarTollINR,
      });
      matchingSettlement.totalDeductionsINR += plaza.standardCarTollINR;
      matchingSettlement.netRefundINR = Math.max(
        0,
        matchingSettlement.depositHeldINR - matchingSettlement.totalDeductionsINR
      );
    }

    revalidatePath("/admin");

    return {
      success: true,
      event: newEvent,
      message: `[NETC Toll Clearing] ₹${plaza.standardCarTollINR} debited at ${plaza.name} (${laneId}) for ${validated.vehicleRegistration}. Buffer remaining: ₹${newBalance}.`,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Validation error" };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to simulate FASTag toll crossing",
    };
  }
}
