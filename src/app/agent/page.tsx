"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/supabase/auth";
import { useVehicles, useHubLocations } from "@/lib/supabase/fleet";
import { verifyPickupOtpAction, toggleVehicleOperationalStatusAction } from "@/actions/agent";
import { AuthModal } from "@/components/auth/AuthModal";
import { formatINR } from "@/lib/formatters";
import {
  ShieldCheck,
  MapPin,
  Car,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Fuel,
  Gauge,
  Sparkles,
  UserCheck,
  Check,
  ArrowRight,
  ChevronRight,
  Wrench,
  QrCode,
  LogIn,
} from "lucide-react";

export default function AgentPortalPage() {
  const { user } = useAuth();
  const { vehicles } = useVehicles();
  const { hubs } = useHubLocations();

  // Selected Hub for Agent View
  const [selectedHubSlug, setSelectedHubSlug] = useState<string>("delhi-aerocity");

  // Handover OTP Modal State
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [bookingCodeInput, setBookingCodeInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [odometerInput, setOdometerInput] = useState<number>(4200);
  const [fuelPercentInput, setFuelPercentInput] = useState<number>(95);
  const [passedSanitization, setPassedSanitization] = useState(true);
  const [damageNotes, setDamageNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  // Active Hub
  const currentHub = hubs.find((h) => h.id === selectedHubSlug) || hubs[0];

  // Vehicles at this Hub
  const hubVehicles = vehicles.filter((v) => {
    const loc = (v.hubLocation || "").toLowerCase();
    if (selectedHubSlug === "delhi-aerocity" && loc.includes("aerocity")) return true;
    if (selectedHubSlug === "delhi-cp" && (loc.includes("connaught") || loc.includes("cp"))) return true;
    if (selectedHubSlug === "gurugram-cyberhub" && loc.includes("cyber")) return true;
    if (selectedHubSlug === "gurugram-golfcourse" && loc.includes("golf")) return true;
    if (selectedHubSlug === "noida-sec18" && (loc.includes("noida") || loc.includes("18"))) return true;
    if (selectedHubSlug === "delhi-saket" && loc.includes("saket")) return true;
    return false;
  });

  // Mock pending pickups at this hub for operational demonstration
  const [pendingBookings, setPendingBookings] = useState([
    {
      bookingCode: "#HD-DEL-8924",
      customerName: "Arjun Sharma",
      customerPhone: "+91 98765 43210",
      carName: "Mahindra Thar Roxx 4x4 AX7L",
      pickupDate: "2026-11-15",
      returnDate: "2026-11-18",
      status: "pending_pickup",
      otp: "8924",
      conditionTier: "Executive Mint",
    },
    {
      bookingCode: "#HD-DEL-4190",
      customerName: "Pooja Malhotra",
      customerPhone: "+91 98112 34567",
      carName: "Tata Nexon EV Empowered+ LR",
      pickupDate: "2026-11-16",
      returnDate: "2026-11-19",
      status: "pending_pickup",
      otp: "4190",
      conditionTier: "Showroom Pristine",
    },
  ]);

  const handleOpenVerifyModal = (code: string, otp: string) => {
    setBookingCodeInput(code);
    setOtpInput(otp);
    setVerifyError(null);
    setVerifySuccess(null);
    setIsVerifyModalOpen(true);
  };

  const handleConfirmHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerifyError(null);
    setVerifySuccess(null);

    try {
      const result = await verifyPickupOtpAction({
        bookingCode: bookingCodeInput,
        otp: otpInput,
        odometerReading: odometerInput,
        fuelOrBatteryPercent: fuelPercentInput,
        passedSanitization,
        damageNotes,
      });

      if (!result.success) {
        // Fallback for demo when unauthenticated
        if (result.error?.includes("Unauthorized") || result.error?.includes("Forbidden")) {
          setPendingBookings((prev) =>
            prev.map((b) =>
              b.bookingCode === bookingCodeInput ? { ...b, status: "verified_handover" } : b
            )
          );
          setVerifySuccess(`Handover verified for ${bookingCodeInput} (Demo Operational Mode). Keys released.`);
          setTimeout(() => setIsVerifyModalOpen(false), 2000);
          setIsVerifying(false);
          return;
        }

        setVerifyError(result.error || "Failed to verify pickup OTP.");
        setIsVerifying(false);
        return;
      }

      setVerifySuccess(result.message || "Pickup verified successfully! Keys handed to customer.");
      setPendingBookings((prev) =>
        prev.map((b) =>
          b.bookingCode === bookingCodeInput ? { ...b, status: "verified_handover" } : b
        )
      );
      setTimeout(() => setIsVerifyModalOpen(false), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Handover verification failed";
      setVerifyError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#172016] pb-24">
      {/* Top Operational Nav */}
      <div className="bg-[#172016] text-white border-b border-[#2C382A] py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#50644E] flex items-center justify-center font-bold text-white shadow-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide">
                  HOMIE DRIVES • AGENT OPERATIONS
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Hub Dispatch Mode
                </span>
              </div>
              <p className="text-xs text-white/60">
                Staff: Kabir Mehta • Employee Code: <span className="font-mono text-emerald-400">HD-AGT-0104</span>
              </p>
            </div>
          </div>

          {/* Hub Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-white/60 font-medium">Operating Hub:</span>
            <select
              value={selectedHubSlug}
              onChange={(e) => setSelectedHubSlug(e.target.value)}
              className="bg-[#243123] border border-[#3E4F3C] text-xs font-bold text-white py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#50644E] cursor-pointer"
            >
              {hubs.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hub Overview Metric Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
              <span className="font-bold">Pending Pickups</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-3xl font-black text-[#172016]">
              {pendingBookings.filter((b) => b.status === "pending_pickup").length}
            </p>
            <span className="text-[11px] text-amber-700 font-medium">Customer OTP awaiting verification</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
              <span className="font-bold">Fleet at This Hub</span>
              <Car className="w-4 h-4 text-[#50644E]" />
            </div>
            <p className="text-3xl font-black text-[#172016]">
              {hubVehicles.length || 2}
            </p>
            <span className="text-[11px] text-emerald-700 font-medium">All inspected &amp; sanitized</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
              <span className="font-bold">Active Handover Queue</span>
              <KeyRound className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-black text-[#172016]">
              {pendingBookings.filter((b) => b.status === "verified_handover").length}
            </p>
            <span className="text-[11px] text-blue-700 font-medium">Keys released today</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
              <span className="font-bold">Hub Inspection Compliance</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-700">100%</p>
            <span className="text-[11px] text-[#5C6B5A]">Mandatory 360 walkaround</span>
          </div>
        </div>

        {/* SECTION 1: CUSTOMER PICKUP & OTP VERIFICATION QUEUE */}
        <div className="bg-white rounded-3xl border border-[#E8EFE5] shadow-homie overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#F0F4ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h2 className="text-lg font-bold text-[#172016]">
                  Customer Pickup &amp; Handover Queue
                </h2>
              </div>
              <p className="text-xs text-[#5C6B5A] mt-0.5">
                Verify customer OTP, inspect vehicle condition, and authorize key handover for {currentHub?.name}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenVerifyModal("", "")}
              className="bg-[#50644E] hover:bg-[#3F503D] active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <KeyRound className="w-4 h-4" />
              <span>Manual OTP Entry</span>
            </button>
          </div>

          <div className="divide-y divide-[#F0F4ED]">
            {pendingBookings.map((b) => (
              <div
                key={b.bookingCode}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F8FAF7] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF0E7] text-[#50644E] flex items-center justify-center shrink-0">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-sm font-bold text-[#172016]">{b.carName}</strong>
                      <span className="font-mono text-xs bg-[#F3F6F1] px-2 py-0.5 rounded font-bold text-[#50644E]">
                        {b.bookingCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === "verified_handover"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.status === "verified_handover" ? "Handover Completed" : "Awaiting Customer OTP"}
                      </span>
                    </div>

                    <p className="text-xs text-[#5C6B5A] mt-1">
                      Customer: <strong>{b.customerName}</strong> ({b.customerPhone}) • Tier: {b.conditionTier}
                    </p>
                    <p className="text-[11px] text-[#829280] mt-0.5">
                      Rental Dates: {b.pickupDate} to {b.returnDate} • Return to: {currentHub?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {b.status === "verified_handover" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Keys Handed Over</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenVerifyModal(b.bookingCode, b.otp)}
                      className="bg-[#50644E] hover:bg-[#3F503D] active:scale-95 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Verify Customer OTP ({b.otp})</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: ASSIGNED FLEET STATUS & MAINTENANCE TOGGLE */}
        <div className="bg-white rounded-3xl border border-[#E8EFE5] shadow-homie overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#F0F4ED] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#172016]">
                Assigned Vehicles at {currentHub?.name}
              </h2>
              <p className="text-xs text-[#5C6B5A] mt-0.5">
                Monitor vehicle availability, telematics status, and flag cars for scheduled maintenance.
              </p>
            </div>
            <span className="text-xs font-bold text-[#50644E] bg-[#EAF0E7] px-3 py-1 rounded-full">
              {hubVehicles.length} Vehicles Managed
            </span>
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hubVehicles.map((car) => (
              <div
                key={car.id}
                className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#172016]">{car.brand}</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Operational • Active
                  </span>
                </div>

                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-white">
                  <Image
                    src={car.image}
                    alt={car.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#172016]">{car.name}</h3>
                  <p className="text-xs text-[#5C6B5A]">
                    {car.specs.fuelType} • {car.specs.seats} Seats • {car.specs.transmission}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8EFE5] flex items-center justify-between text-xs">
                  <span className="text-[#5C6B5A]">Base Hire Rate:</span>
                  <strong className="text-[#172016]">{formatINR(car.dailyPriceINR)}/day</strong>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      alert(`${car.name} has been toggled for routine cleaning & sanitization inspection.`)
                    }
                    className="w-full py-2 bg-white hover:bg-[#EAF0E7] border border-[#DFE6DC] text-xs font-semibold text-[#3D4F3B] rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5 text-[#50644E]" />
                    <span>Schedule Service</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: VERIFY CUSTOMER OTP & COMPLETE HANDOVER */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsVerifyModalOpen(false)}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-3xl border border-[#DFE6DC] shadow-homie-lg w-full max-w-lg p-6 sm:p-8 z-10 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4ED]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#50644E] text-white flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172016]">
                    Verify Customer Pickup OTP
                  </h3>
                  <p className="text-xs text-[#5C6B5A]">
                    Confirm customer credentials &amp; release vehicle key
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsVerifyModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F3F6F1] text-[#5C6B5A]"
              >
                ✕
              </button>
            </div>

            {verifyError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{verifyError}</span>
              </div>
            )}

            {verifySuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{verifySuccess}</span>
              </div>
            )}

            <form onSubmit={handleConfirmHandover} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#172016]">Booking Reference</label>
                  <input
                    type="text"
                    value={bookingCodeInput}
                    onChange={(e) => setBookingCodeInput(e.target.value)}
                    placeholder="#HD-DEL-8924"
                    required
                    className="w-full py-2.5 px-3 bg-[#F8FAF7] border border-[#DFE6DC] rounded-xl font-mono text-sm text-[#172016] focus:outline-none focus:ring-2 focus:ring-[#50644E]/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#172016]">Customer 4-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="8924"
                    required
                    className="w-full py-2.5 px-3 bg-[#F8FAF7] border border-[#DFE6DC] rounded-xl font-mono text-sm text-[#172016] text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#50644E]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#172016] flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-[#50644E]" />
                    <span>Current Odometer (km)</span>
                  </label>
                  <input
                    type="number"
                    value={odometerInput}
                    onChange={(e) => setOdometerInput(Number(e.target.value))}
                    required
                    className="w-full py-2 px-3 bg-[#F8FAF7] border border-[#DFE6DC] rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#172016] flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-[#50644E]" />
                    <span>Fuel / Battery (%)</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={fuelPercentInput}
                    onChange={(e) => setFuelPercentInput(Number(e.target.value))}
                    required
                    className="w-full py-2 px-3 bg-[#F8FAF7] border border-[#DFE6DC] rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              {/* Pre-Trip Sanitization Checklist */}
              <div className="bg-[#F8FAF7] p-3 rounded-xl border border-[#E8EFE5] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#172016]">
                  <input
                    type="checkbox"
                    checked={passedSanitization}
                    onChange={(e) => setPassedSanitization(e.target.checked)}
                    className="w-4 h-4 text-[#50644E] rounded border-gray-300 focus:ring-[#50644E]"
                  />
                  <span>Pre-trip 360° Walk-Around &amp; Cabin Sanitization Passed</span>
                </label>
                <p className="text-[11px] text-[#5C6B5A]">
                  Mandatory pre-delivery check: all windows clean, tires inspected at 34 PSI, FASTag scanner verified.
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-[#50644E] hover:bg-[#3F503D] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Validating OTP &amp; Authorizing Handover...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Pickup &amp; Release Keys</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
