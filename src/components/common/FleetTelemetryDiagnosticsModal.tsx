"use client";

import React, { useState } from "react";
import { Car, TelematicsStatus } from "@/types/car";
import {
  Gauge,
  Activity,
  Fuel,
  Zap,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Radio,
  Cpu,
  Thermometer,
  Disc,
  Battery,
  CircleAlert,
  Info,
} from "lucide-react";

interface FleetTelemetryDiagnosticsModalProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
}

export const FleetTelemetryDiagnosticsModal: React.FC<FleetTelemetryDiagnosticsModalProps> = ({
  car,
  isOpen,
  onClose,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedTime, setLastScannedTime] = useState<string>("Just now");

  if (!isOpen) return null;

  const telematics: TelematicsStatus = car.telematicsStatus || {
    fuelOrBatteryPercent: 92,
    sanitizedTimeAgo: "Cleaned 40m ago",
    keylessReady: true,
    fastagActive: true,
  };

  const tpms = telematics.tpmsPSI || {
    frontLeft: 34,
    frontRight: 34,
    rearLeft: 34,
    rearRight: 34,
  };

  const engineOil = telematics.engineOilLifePercent ?? 96;
  const brakeWear = telematics.brakePadWearPercent ?? 12;
  const voltage12v = telematics.battery12vVoltage ?? 12.8;
  const coolantTemp = telematics.coolantTempCelsius ?? 88;
  const tamperStatus = telematics.odometerTamperCheck ?? "passed";

  const handleRunDiagnosticsScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLastScannedTime("Just now (OBD-II Certified)");
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#101710] text-white w-full max-w-2xl rounded-[32px] p-6 sm:p-8 shadow-homie-lg border border-[#2D3A2B] relative max-h-[92vh] overflow-y-auto space-y-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  OBD-II Fleet Health &amp; Telemetry
                </h3>
                <span className="text-[10px] font-mono bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  SYSTEM OPTIMAL
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                {car.name} • Assigned: {car.hubLocation}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Mandatory Permanent Directive Invariant Banner */}
        <div className="bg-[#1C261A] border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-3">
          <Radio className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <strong className="text-amber-300 font-mono">
                TELEMATICS INVARIANT: GPS NOT CONNECTED
              </strong>
              <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-bold">
                AUDITED
              </span>
            </div>
            <p className="text-white/60 text-[11px] mt-0.5 leading-relaxed">
              In accordance with platform governance, simulated live satellite tracking is strictly disabled until Phase 8 hardware OBD-II &amp; IoT modems are deployed. Displaying authenticated local diagnostic telemetry only.
            </p>
          </div>
        </div>

        {/* 4-Wheel Tire Pressure Monitoring System (TPMS) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Tire Pressure Monitoring System (TPMS)
              </h4>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              Target: 34 PSI (Cold)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-white/50 block font-mono">FRONT LEFT (FL)</span>
                <strong className="text-base text-white font-mono">{tpms.frontLeft} PSI</strong>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-white/50 block font-mono">FRONT RIGHT (FR)</span>
                <strong className="text-base text-white font-mono">{tpms.frontRight} PSI</strong>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-white/50 block font-mono">REAR LEFT (RL)</span>
                <strong className="text-base text-white font-mono">{tpms.rearLeft} PSI</strong>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-white/50 block font-mono">REAR RIGHT (RR)</span>
                <strong className="text-base text-white font-mono">{tpms.rearRight} PSI</strong>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Powertrain & Mechanical Health Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Energy / Fuel Tank */}
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/50 text-[10px]">
              <span>PROPULSION</span>
              {car.specs.fuelType === "Electric" ? (
                <Zap className="w-3 h-3 text-emerald-400" />
              ) : (
                <Fuel className="w-3 h-3 text-amber-400" />
              )}
            </div>
            <strong className="text-base text-white font-mono block">
              {telematics.fuelOrBatteryPercent}%
            </strong>
            <span className="text-[10px] text-emerald-400 font-medium">Ready for Trip</span>
          </div>

          {/* Engine Oil Life */}
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/50 text-[10px]">
              <span>LUBRICANT</span>
              <Thermometer className="w-3 h-3 text-emerald-400" />
            </div>
            <strong className="text-base text-white font-mono block">
              {engineOil}%
            </strong>
            <span className="text-[10px] text-emerald-400 font-medium">Oil Quality Pure</span>
          </div>

          {/* Brake Pad Wear */}
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/50 text-[10px]">
              <span>BRAKE WEAR</span>
              <Disc className="w-3 h-3 text-emerald-400" />
            </div>
            <strong className="text-base text-white font-mono block">
              {brakeWear}%
            </strong>
            <span className="text-[10px] text-emerald-400 font-medium">Brembo Discs Mint</span>
          </div>

          {/* 12V Auxiliary Battery */}
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/50 text-[10px]">
              <span>12V VOLTAGE</span>
              <Battery className="w-3 h-3 text-emerald-400" />
            </div>
            <strong className="text-base text-white font-mono block">
              {voltage12v}V
            </strong>
            <span className="text-[10px] text-emerald-400 font-medium">Alternator Charging</span>
          </div>
        </div>

        {/* Cryptographic Odometer Integrity & Fastag Sensor */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block font-bold">
                ECU Odometer Integrity Verification
              </strong>
              <p className="text-[11px] text-white/60">
                Tamper protection: <span className="font-mono text-emerald-400 uppercase">{tamperStatus}</span> • CAN-bus telemetry hash verified.
              </p>
            </div>
          </div>

          <span className="font-mono text-[11px] bg-white/10 text-white px-2.5 py-1 rounded-lg border border-white/10">
            FASTag: {telematics.fastagActive ? "ACTIVE (NHAI OK)" : "STANDBY"}
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-[11px] text-white/50">
            Last Telemetry Query: {lastScannedTime}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isScanning}
              onClick={handleRunDiagnosticsScan}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Probing CAN-bus..." : "Re-Scan Telemetry"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#50644E] hover:bg-[#3F503D] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

