export type VehicleOperationalStatus = "active_trip" | "in_hub" | "detailing" | "maintenance";

export interface DiagnosticTroubleCode {
  code: string;
  description: string;
  severity: "info" | "warning" | "critical";
}

export interface TirePressureReadings {
  frontLeft: number;
  frontRight: number;
  rearLeft: number;
  rearRight: number;
  targetPSI: number;
}

export interface VehicleTelemetryData {
  vehicleId: string;
  carName: string;
  registrationNumber: string;
  hubLocation: string;
  operationalStatus: VehicleOperationalStatus;
  odometerKm: number;
  fuelOrBatteryPercent: number;
  fuelType: "petrol" | "diesel" | "electric" | "hybrid";
  batteryVoltage12V: number;
  engineCoolantTempC: number;
  engineOilLifePercent: number;
  tirePressure: TirePressureReadings;
  obdConnected: boolean;
  gpsConnected: false; // Invariant: Strictly false until hardware OBD-II is installed
  gpsStatusLabel: "GPS NOT CONNECTED";
  lastCanbusSync: string;
  dtcList: DiagnosticTroubleCode[];
}
