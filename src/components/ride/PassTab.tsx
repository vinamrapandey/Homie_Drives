"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ActiveRentalPass } from "@/types/booking";
import {
  saveActivePass,
  useActivePass,
  usePassArchive,
} from "@/lib/passStorage";
import { formatINR } from "@/lib/formatters";
import { useAuth } from "@/lib/supabase/auth";
import { useUserBookings, mapBookingToActivePass } from "@/lib/supabase/bookings";
import { AuthModal } from "@/components/auth/AuthModal";
import { TaxInvoiceModal, InvoiceData } from "@/components/invoice/TaxInvoiceModal";
import { FleetTelemetryDiagnosticsModal } from "@/components/common/FleetTelemetryDiagnosticsModal";
import { TripExtensionModal } from "@/components/ride/TripExtensionModal";
import { DEMO_CARS } from "@/data/cars";
import {
  Ticket,
  QrCode,
  MapPin,
  Calendar,
  Car,
  Lock,
  Unlock,
  Wind,
  Volume2,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Fuel,
  PhoneCall,
  Maximize2,
  X,
  CreditCard,
  Cloud,
  Sparkles,
  UserCheck,
  Receipt,
  FileText,
  Activity,
  Repeat,
} from "lucide-react";

export const PassTab: React.FC = () => {
  const [showDemoPass, setShowDemoPass] = useState(true);
  const activePass = useActivePass();
  const passArchive = usePassArchive();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Supabase Auth and Live Cloud Bookings
  const { user } = useAuth();
  const { bookings, loading: bookingsLoading } = useUserBookings();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Keyless Fob Local UI State
  const [isHazardFlashing, setIsHazardFlashing] = useState(false);
  const [fobActionToast, setFobActionToast] = useState<string | null>(null);

  // Full-screen QR Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // GST Tax Invoice Modal
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Fleet Telematics Diagnostics Modal
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState(false);

  // Trip Extension Modal
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);

  // Copy to clipboard helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Switch active pass
  const handleSelectPass = (pass: ActiveRentalPass) => {
    saveActivePass(pass);
  };

  // Toggle Keyless Lock / Unlock
  const handleToggleLock = () => {
    const nextLocked = !activePass.carLocked;
    const updated = { ...activePass, carLocked: nextLocked };
    saveActivePass(updated);

    if (nextLocked) {
      setFobActionToast("🔒 Doors locked • Perimeter alarm armed & immobilizer active");
    } else {
      setFobActionToast("🔓 Doors unlocked • Keyless access active for 60 seconds");
    }
    setTimeout(() => setFobActionToast(null), 3500);
  };

  // Toggle Remote Climate Pre-conditioning
  const handleToggleClimate = () => {
    const nextClimate = !activePass.climateControlActive;
    const updated = { ...activePass, climateControlActive: nextClimate };
    saveActivePass(updated);

    if (nextClimate) {
      setFobActionToast("❄️ Cabin pre-cooling engaged • AC set to 21°C with PM2.5 filter ON");
    } else {
      setFobActionToast("🛑 Remote climate control turned off");
    }
    setTimeout(() => setFobActionToast(null), 3500);
  };

  // Flash Lights & Horn
  const handleFlashHazard = () => {
    setIsHazardFlashing(true);
    setFobActionToast("📢 Hazard lights flashed & horn sounded 2x to locate vehicle in hub");
    setTimeout(() => setIsHazardFlashing(false), 2500);
    setTimeout(() => setFobActionToast(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Controls: Mode Switcher & Archive Picker */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-[#E8EFE5] shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[#172016]">
              Digital Pass Hub
            </span>
            <span className="text-[10px] font-semibold bg-[#EAF0E7] text-[#50644E] px-2.5 py-0.5 rounded-full">
              Live Keyless Sync
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F3F6F1] p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setShowDemoPass(true)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                showDemoPass
                  ? "bg-[#50644E] text-white shadow-sm"
                  : "text-[#5C6B5A] hover:text-[#172016]"
              }`}
            >
              Active Digital Pass
            </button>
            <button
              type="button"
              onClick={() => setShowDemoPass(false)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                !showDemoPass
                  ? "bg-[#50644E] text-white shadow-sm"
                  : "text-[#5C6B5A] hover:text-[#172016]"
              }`}
            >
              Empty State View
            </button>
          </div>
        </div>

        {/* Live Supabase Bookings for Authenticated User */}
        {user && bookings.length > 0 && (
          <div className="pt-2 border-t border-[#F0F4ED] text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#50644E] flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5" />
                <span>Your Supabase Bookings ({bookings.length}):</span>
              </span>
              <span className="text-[10px] text-[#829280]">Live Database Sync</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {bookings.map((b) => {
                const isSelected = activePass.bookingRef === b.booking_code;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectPass(mapBookingToActivePass(b, user?.email))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#50644E] text-white border-[#50644E] shadow-2xs font-bold"
                        : "bg-[#F3F6F1] text-[#172016] border-[#DFE6DC] hover:border-[#CAD8C6]"
                    }`}
                  >
                    <span>{b.vehicles?.name?.split(" ")[0]} {b.vehicles?.name?.split(" ")[1]}</span>
                    <span className="font-mono text-[10px] opacity-80">{b.booking_code}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800 font-bold">
                      {b.status.replace("_", " ")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Guest Mode Sign-in Banner */}
        {!user && (
          <div className="pt-2 border-t border-[#F0F4ED] flex items-center justify-between text-xs text-[#5C6B5A]">
            <span className="text-[11px]">
              Viewing in Offline / Demo Mode.
            </span>
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="text-[#50644E] font-bold hover:underline flex items-center gap-1"
            >
              <span>Sign In with OTP for Cloud Passes</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* Saved Passes Switcher (Domestic Indian fleet & Supercars) */}
        {showDemoPass && (
          <div className="pt-2 border-t border-[#F0F4ED] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] font-semibold text-[#829280] shrink-0">
              Demo Passes:
            </span>
            <div className="flex items-center gap-1.5">
              {passArchive.map((p) => {
                const isSelected = activePass.bookingRef === p.bookingRef;
                return (
                  <button
                    key={p.bookingRef}
                    type="button"
                    onClick={() => handleSelectPass(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all border ${
                      isSelected
                        ? "bg-[#50644E] text-white border-[#50644E] shadow-2xs font-bold"
                        : "bg-[#F8FAF7] text-[#5C6B5A] border-[#E8EFE5] hover:border-[#CAD8C6] hover:text-[#172016]"
                    }`}
                  >
                    <span>{p.carName.split(" ")[0]} {p.carName.split(" ")[1]}</span>
                    <span className="opacity-70 ml-1 text-[10px]">({p.bookingRef.slice(-4)})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Toast Banner */}
      {fobActionToast && (
        <div className="p-3 bg-[#172016] text-white rounded-2xl shadow-homie flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200">
          <span className="font-medium">{fobActionToast}</span>
          <button
            type="button"
            onClick={() => setFobActionToast(null)}
            className="text-white/60 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {showDemoPass ? (
        <div className="space-y-5">
          {/* ===================================================================
              1. MAIN DIGITAL BOARDING PASS CARD (Mobbin Ro Aesthetic)
              =================================================================== */}
          <div className="bg-white rounded-[32px] overflow-hidden border border-[#E1E8DF] shadow-homie relative">
            {/* Top Verified Banner */}
            <div className="bg-[#172016] text-white px-5 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-2xs">
                  <Image
                    src="/images/logo/homie_drives.png"
                    alt="Homie Drives"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="font-extrabold text-sm tracking-wide flex items-center gap-1.5">
                    <span>HOMIE DRIVES DIGITAL PASS</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </p>
                  <p className="text-[11px] text-[#A2BA9F]">
                    Delhi NCR Authorized Self-Drive
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  FASTag Linked
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Vehicle Row */}
              <div className="flex items-center gap-4 pb-5 border-b border-[#F0F4ED]">
                <div className="relative w-28 h-20 bg-[#F8FAF7] rounded-2xl overflow-hidden shrink-0 border border-[#E8EFE5] p-1.5">
                  <Image
                    src={activePass.carImage}
                    alt={activePass.carName}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-black text-lg text-[#172016] truncate">
                      {activePass.carName}
                    </h3>
                  </div>
                  <p className="text-xs text-[#5C6B5A] mt-0.5">
                    Reg: <strong className="font-mono text-[#172016]">{activePass.registrationNumber}</strong> • {activePass.carCategory}
                  </p>

                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold bg-[#EAF0E7] text-[#50644E] px-2 py-0.5 rounded-md">
                      {activePass.conditionLabel} ({activePass.odometerRange})
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100">
                      {activePass.protectionPlanName}
                    </span>
                    {activePass.isSubscription && (
                      <span className="text-[10px] font-extrabold bg-[#50644E] text-white px-2 py-0.5 rounded-md shadow-2xs">
                        Flexible Subscription
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Multi-Month Flexible Subscription Status Banner */}
              {activePass.isSubscription && (
                <div className="bg-[#172016] text-white p-4 rounded-2xl border border-[#2D3A2B] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        {activePass.planType === "quarterly" ? "Quarterly Lease (90-Day)" : "Flexible 30-Day Subscription"}
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Active Cycle
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-white/80 pt-1 border-t border-white/10">
                    <div>
                      <span className="text-[10px] text-[#A2BA9F] block">Next Free Detailing</span>
                      <strong className="text-white">{activePass.nextServiceDueDate || "Scheduled in 30 Days"}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A2BA9F] block">Mobility Guarantee</span>
                      <strong className="text-emerald-300">4-Hour Replacement SLA</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A2BA9F] block">Monthly Quota</span>
                      <strong className="text-white">3,000 km (Rollover Active)</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Reference & Handover QR Code Box */}
              <div className="bg-[#F8FAF7] rounded-2xl p-4 sm:p-5 border border-[#E8EFE5] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#829280] uppercase tracking-wider block">
                    Verified Booking Reference
                  </span>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-xl sm:text-2xl font-black text-[#172016] tracking-tight font-mono">
                      {activePass.bookingRef}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activePass.bookingRef, "ref")}
                      className="p-1 rounded-md text-[#5C6B5A] hover:bg-white hover:text-[#172016] transition-colors"
                      title="Copy Reference"
                    >
                      {copiedField === "ref" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#5C6B5A]">
                    Keyless Access PIN: <strong className="font-mono text-sm text-[#50644E] font-extrabold">{activePass.pin}</strong>
                  </p>
                </div>

                {/* QR Code with Tap to Expand */}
                <div
                  onClick={() => setIsQrModalOpen(true)}
                  className="bg-white p-3 rounded-2xl border border-[#DFE6DC] shadow-sm flex flex-col items-center cursor-pointer hover:border-[#50644E] transition-all group shrink-0"
                >
                  <div className="relative">
                    <QrCode className="w-20 h-20 text-[#172016] group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg flex items-center justify-center transition-colors">
                      <Maximize2 className="w-4 h-4 text-[#50644E] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#50644E] mt-1 flex items-center gap-0.5">
                    <span>Tap to Enlarge</span>
                  </span>
                </div>
              </div>

              {/* Hub & Schedule Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#F8FAF7] p-3.5 rounded-2xl border border-[#E8EFE5]">
                  <span className="text-[11px] font-bold text-[#829280] uppercase tracking-wider block flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#50644E]" />
                    Pickup & Handover Hub
                  </span>
                  <p className="font-bold text-sm text-[#172016]">
                    {activePass.pickupLocation}
                  </p>
                  <p className="text-[11px] text-[#5C6B5A] mt-0.5">
                    Return to the same hub in Delhi NCR
                  </p>
                </div>

                <div className="bg-[#F8FAF7] p-3.5 rounded-2xl border border-[#E8EFE5] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#829280] uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#50644E]" />
                        Rental Schedule ({activePass.days} Days)
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsExtensionModalOpen(true)}
                        className="text-[10px] font-bold text-[#50644E] bg-white border border-[#CAD8C6] hover:bg-[#F3F6F1] px-2 py-0.5 rounded-md transition-colors cursor-pointer shadow-2xs"
                      >
                        Extend Trip +
                      </button>
                    </div>
                    <p className="font-bold text-sm text-[#172016]">
                      {activePass.pickupDate} → {activePass.returnDate}
                    </p>
                    <p className="text-[11px] text-[#5C6B5A] mt-0.5">
                      Handover from {activePass.pickupTime} • Return by {activePass.returnTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Telematics & FASTag Health Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* Fuel / Battery Gauge with Diagnostics Launcher */}
                <div
                  onClick={() => setIsDiagnosticsModalOpen(true)}
                  className="bg-[#F8FAF7] hover:bg-[#F0F5EE] p-3 rounded-xl border border-[#E8EFE5] hover:border-[#CAD8C6] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[#5C6B5A] mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 group-hover:text-[#50644E]">
                      {activePass.fuelType.includes("Electric") ? (
                        <Zap className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Fuel className="w-3 h-3 text-amber-600" />
                      )}
                      {activePass.fuelType.includes("Electric") ? "State of Charge" : "Fuel Level"}
                    </span>
                    <span className="font-bold text-[#172016] flex items-center gap-1">
                      <span>{activePass.batteryOrFuelLevel}%</span>
                      <Activity className="w-3 h-3 text-emerald-600 group-hover:scale-110 transition-transform" />
                    </span>
                  </div>
                  <div className="w-full bg-[#E8EFE5] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        activePass.batteryOrFuelLevel > 40
                          ? "bg-emerald-600"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${activePass.batteryOrFuelLevel}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#829280] mt-1">
                    <span>Full-to-Full Policy</span>
                    <span className="text-emerald-700 font-semibold group-hover:underline">
                      OBD Diagnostics →
                    </span>
                  </div>
                </div>

                {/* FASTag Buffer Balance */}
                <div className="bg-[#F8FAF7] p-3 rounded-xl border border-[#E8EFE5]">
                  <div className="flex items-center justify-between text-[#5C6B5A] mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-[#50644E]" />
                      FASTag Buffer
                    </span>
                    <span className="font-bold text-[#172016]">
                      {formatINR(activePass.fastagBalanceINR)}
                    </span>
                  </div>
                  <div className="w-full bg-[#E8EFE5] h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#50644E] rounded-full w-[90%]" />
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
                    All NCR Toll Plazas Ready
                  </span>
                </div>

                {/* DigiLocker Verified Driver */}
                <div className="bg-[#F8FAF7] p-3 rounded-xl border border-[#E8EFE5]">
                  <div className="flex items-center justify-between text-[#5C6B5A] mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      DigiLocker KYC
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      Verified
                    </span>
                  </div>
                  <p className="font-bold text-xs text-[#172016] truncate">
                    {activePass.driverName}
                  </p>
                  <span className="text-[10px] text-[#829280] block font-mono">
                    {activePass.dlNumber}
                  </span>
                </div>
              </div>

              {/* Tax Invoice & Settlement Receipt Action Bar */}
              <div className="flex items-center justify-between p-3.5 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5] transition-all hover:border-[#CAD8C6]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF0E7] flex items-center justify-center text-[#50644E]">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#172016] block">
                      GST Tax Invoice &amp; Settlement
                    </span>
                    <span className="text-[10px] text-[#5C6B5A]">
                      SAC 996601 • 18% GST • Deductions Breakdown
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#50644E] border border-[#CAD8C6] hover:bg-[#F3F6F1] font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Invoice</span>
                </button>
              </div>

              {/* Handover Agent Contact & SOS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#EAF0E7] rounded-2xl text-xs text-[#3D4F3B]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white text-[#50644E] flex items-center justify-center font-bold text-sm shadow-2xs">
                    {activePass.assignedAgent.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5C6B5A] block">
                      Assigned Hub Specialist
                    </span>
                    <span className="font-bold text-sm text-[#172016]">
                      {activePass.assignedAgent}
                    </span>
                    <span className="text-[11px] text-[#5C6B5A] block">
                      {activePass.agentPhone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activePass.agentPhone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-1.5 bg-[#50644E] text-white px-3.5 py-2 rounded-xl font-bold text-xs hover:bg-[#3F503D] transition-colors shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Specialist</span>
                  </a>
                  <a
                    href="tel:+911140004664"
                    className="flex items-center gap-1.5 bg-white text-rose-700 border border-rose-200 px-3 py-2 rounded-xl font-bold text-xs hover:bg-rose-50 transition-colors"
                  >
                    <span>24x7 SOS</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================
              2. KEYLESS MOBILE ACCESS FOB SIMULATOR
              =================================================================== */}
          <div className="bg-[#172016] text-white rounded-[32px] p-5 sm:p-7 border border-[#2D3A2B] shadow-homie space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-black text-base tracking-tight text-white">
                    Keyless Smart Access Remote
                  </h4>
                  <p className="text-[11px] text-[#A2BA9F]">
                    Bluetooth &amp; Cellular Telematics Fob
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    activePass.carLocked ? "bg-rose-500 animate-pulse" : "bg-emerald-400 animate-pulse"
                  }`}
                />
                <span className="text-xs font-bold font-mono tracking-wider">
                  {activePass.carLocked ? "LOCKED" : "UNLOCKED"}
                </span>
              </div>
            </div>

            {/* Remote Fob Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Lock / Unlock Toggle Button */}
              <button
                type="button"
                onClick={handleToggleLock}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer border ${
                  activePass.carLocked
                    ? "bg-white/10 hover:bg-white/15 border-white/15 text-white active:scale-98"
                    : "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-300"
                }`}
              >
                {activePass.carLocked ? (
                  <Lock className="w-6 h-6 text-white" />
                ) : (
                  <Unlock className="w-6 h-6 text-emerald-300" />
                )}
                <span className="text-xs font-bold">
                  {activePass.carLocked ? "Tap to Unlock Doors" : "Doors Unlocked (Tap to Lock)"}
                </span>
                <span className="text-[10px] text-white/60">
                  {activePass.carLocked ? "Alarm Armed" : "Ready to Drive"}
                </span>
              </button>

              {/* Climate Pre-condition Toggle */}
              <button
                type="button"
                onClick={handleToggleClimate}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer border ${
                  activePass.climateControlActive
                    ? "bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/40 text-cyan-300"
                    : "bg-white/10 hover:bg-white/15 border-white/15 text-white active:scale-98"
                }`}
              >
                <Wind
                  className={`w-6 h-6 ${
                    activePass.climateControlActive ? "text-cyan-300 animate-spin" : "text-white"
                  }`}
                />
                <span className="text-xs font-bold">
                  {activePass.climateControlActive ? "Cabin AC Active" : "Remote Cabin Climate"}
                </span>
                <span className="text-[10px] text-white/60">
                  {activePass.climateControlActive ? "21°C • Air Clean ON" : "Pre-Cool / Pre-Heat"}
                </span>
              </button>

              {/* Hazard Lights / Horn Strobe */}
              <button
                type="button"
                onClick={handleFlashHazard}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer border col-span-2 sm:col-span-1 ${
                  isHazardFlashing
                    ? "bg-amber-500/30 border-amber-400 text-amber-300 animate-pulse"
                    : "bg-white/10 hover:bg-white/15 border-white/15 text-white active:scale-98"
                }`}
              >
                <Volume2 className="w-6 h-6 text-amber-400" />
                <span className="text-xs font-bold">Find My Car</span>
                <span className="text-[10px] text-white/60">
                  {isHazardFlashing ? "Flashing Lights 3x..." : "Sound Horn & Flash"}
                </span>
              </button>
            </div>

            {/* Immobilizer PIN Note */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
              <span className="text-[11px]">
                Immobilizer Handover PIN: <strong className="font-mono text-emerald-400 text-sm">{activePass.pin}</strong>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(activePass.pin, "pin")}
                className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs flex items-center gap-1"
              >
                {copiedField === "pin" ? <span>Copied!</span> : <span>Copy PIN</span>}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-[32px] p-8 sm:p-12 text-center border border-[#E8EFE5] shadow-homie space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#EAF0E7] text-[#50644E] flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-[#172016]">
            No Confirmed Rental Passes Yet
          </h3>

          <p className="text-xs text-[#5C6B5A] max-w-md mx-auto leading-relaxed">
            When you complete a reservation in Homie Drives, your digital rental pass, pickup QR code, assigned agent contact, and vehicle lock status will appear right here.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/plan?tab=cars"
              className="inline-flex items-center gap-2 bg-[#50644E] hover:bg-[#3F503D] text-white text-xs font-bold py-3.5 px-6 rounded-full transition-all shadow-sm"
            >
              <Car className="w-4 h-4" />
              <span>Browse Fleet &amp; Book</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowDemoPass(true)}
              className="py-3 px-5 rounded-full border border-[#DFE6DC] text-xs font-bold text-[#50644E] hover:bg-[#F3F6F1] transition-colors"
            >
              View Active Demo Pass
            </button>
          </div>

          <div className="pt-4 border-t border-[#F0F4ED] text-[11px] text-[#829280]">
            Digital pass verification and live reservation sync is active with DigiLocker KYC.
          </div>
        </div>
      )}

      {/* ===================================================================
          3. FULL-SCREEN QR CODE MODAL FOR HUB HANDOVER AGENTS
          =================================================================== */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-homie-lg border border-[#E1E8DF] relative text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4ED]">
              <span className="text-xs font-bold text-[#50644E] uppercase tracking-wider">
                Hub Dispatch Scanner
              </span>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F3F6F1] hover:bg-[#EAF0E7] flex items-center justify-center text-[#5C6B5A] hover:text-[#172016] transition-colors cursor-pointer"
                aria-label="Close QR Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="font-extrabold text-base text-[#172016]">
                {activePass.carName}
              </h4>
              <p className="text-xs text-[#5C6B5A] font-mono mt-0.5">
                {activePass.registrationNumber} • Ref: {activePass.bookingRef}
              </p>
            </div>

            {/* High-Contrast Large QR */}
            <div className="bg-[#F8FAF7] p-5 rounded-2xl border-2 border-[#50644E]/20 flex flex-col items-center shadow-inner">
              <QrCode className="w-44 h-44 text-[#172016]" />
              <span className="text-xs font-mono font-bold text-[#50644E] mt-3 tracking-widest text-base">
                PIN: {activePass.pin}
              </span>
            </div>

            <div className="text-xs text-[#5C6B5A] space-y-1">
              <p>
                Present this screen to <strong>{activePass.assignedAgent}</strong> at <strong>{activePass.pickupLocation}</strong>.
              </p>
              <p className="text-[11px] text-[#829280]">
                Driver verified: {activePass.driverName} ({activePass.dlNumber})
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-3 rounded-full bg-[#50644E] text-white text-xs font-bold hover:bg-[#3F503D] transition-colors"
            >
              Done Scanning
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* GST Tax Invoice & Settlement Modal */}
      <TaxInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        data={{
          invoiceNumber: `INV-2026-${(activePass.bookingRef || "HD-DEL-8924").replace(/[^A-Z0-9]/gi, "").slice(-6)}`,
          invoiceDate: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          bookingRef: activePass.bookingRef || "#HD-DEL-8924",
          customerName: activePass.driverName || "Arjun Sharma",
          customerEmail: user?.email || "arjun.sharma@example.com",
          customerPhone: "+91 98765 43210",
          vehicleName: activePass.carName,
          vehicleRegistration: activePass.registrationNumber || "DL-01-HD-2025",
          hubLocation: activePass.pickupLocation,
          pickupDate: activePass.pickupDate,
          returnDate: activePass.returnDate,
          rentalDays: activePass.days || 3,
          conditionTier: activePass.conditionLabel,
          baseDailyRateINR: Math.round((activePass.totalPaidINR * 0.65) / (activePass.days || 3)),
          baseRentalINR: Math.round(activePass.totalPaidINR * 0.65),
          platformFeeINR: Math.round(activePass.totalPaidINR * 0.04),
          damageProtectionINR: 1797,
          protectionTierName: activePass.protectionPlanName,
          taxableSubtotalINR: Math.round(activePass.totalPaidINR * 0.75),
          cgstINR: Math.round(activePass.totalPaidINR * 0.75 * 0.09),
          sgstINR: Math.round(activePass.totalPaidINR * 0.75 * 0.09),
          totalTaxINR: Math.round(activePass.totalPaidINR * 0.75 * 0.18),
          fastagBufferINR: activePass.fastagBufferINR || 1000,
          fastagUsedINR: 240,
          depositHeldINR: 5000,
          depositRefundedINR: 4760,
          totalPaidINR: activePass.totalPaidINR,
          paymentStatus: "Paid",
        }}
      />

      {/* Fleet Telematics OBD Diagnostics Modal */}
      {isDiagnosticsModalOpen && (
        <FleetTelemetryDiagnosticsModal
          car={
            DEMO_CARS.find((c) => c.slug === activePass.carSlug) ||
            DEMO_CARS[0]
          }
          isOpen={isDiagnosticsModalOpen}
          onClose={() => setIsDiagnosticsModalOpen(false)}
        />
      )}

      {/* Trip Extension Modal */}
      {isExtensionModalOpen && (
        <TripExtensionModal
          isOpen={isExtensionModalOpen}
          onClose={() => setIsExtensionModalOpen(false)}
          activePass={activePass}
          onPassUpdated={(updatedPass) => {
            saveActivePass(updatedPass);
            setFobActionToast(`Trip extended to ${updatedPass.returnDate}! New schedule synced.`);
            setTimeout(() => setFobActionToast(null), 4000);
          }}
        />
      )}
    </div>
  );
};
