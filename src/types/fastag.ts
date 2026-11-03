export type FastagEventStatus = "cleared" | "processing" | "low_balance_warning";

export interface FastagTollEvent {
  id: string;
  bookingCode: string;
  vehicleRegistration: string;
  vehicleName: string;
  plazaName: string;
  corridor: string;
  laneId: string;
  tollAmountINR: number;
  timestamp: string;
  status: FastagEventStatus;
  balanceRemainingINR: number;
  readerId: string;
}

export interface TollPlazaDefinition {
  id: string;
  name: string;
  corridor: string;
  standardCarTollINR: number;
  expresswayCode: string;
  lanes: string[];
}
