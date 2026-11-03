export type SettlementStatus =
  | "held_in_escrow"
  | "refund_dispatched"
  | "disputed_hold"
  | "settlement_pending";

export interface TollPlazaRecord {
  plazaName: string;
  highwayName: string;
  timestamp: string;
  tollFeeINR: number;
}

export interface EscrowSettlementRecord {
  id: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleName: string;
  vehicleRegistration: string;
  hubName: string;
  pickupDate: string;
  returnDate: string;
  depositHeldINR: number;
  fastagTollsINR: number;
  tollPlazas: TollPlazaRecord[];
  excessKm: number;
  excessKmRateINR: number;
  excessKmChargesINR: number;
  damageCleaningChargesINR: number;
  damageReason?: string;
  totalDeductionsINR: number;
  netRefundINR: number;
  zeroFloorApplied: boolean;
  status: SettlementStatus;
  paymentGatewayRef: string;
  settledAt?: string;
  settledBy?: string;
  settlementNotes?: string;
  createdAt: string;
}
