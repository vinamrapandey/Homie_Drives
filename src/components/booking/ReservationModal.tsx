"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Car, VehicleConditionTier, VehicleConditionOption } from "@/types/car";
import { DigiLockerKycRecord } from "@/types/booking";
import { DEFAULT_PROTECTION_PLANS } from "@/data/protection";
import { formatINR, formatDate, calculateRentalDays } from "@/lib/formatters";
import {
  X,
  CheckCircle,
  Calendar,
  MapPin,
  ArrowRight,
  ShieldCheck,
  QrCode,
  KeyRound,
  Lock,
  Check,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

interface ReservationModalProps {
  car: Car;
  pickupDate: string;
  returnDate: string;
  totalINR: number;
  planType: string;
  conditionTier?: VehicleConditionTier;
  conditionOption?: VehicleConditionOption;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  car,
  pickupDate,
  returnDate,
  totalINR,
  planType,
  conditionTier = "mint",
  conditionOption,
  onClose,
}) => {
  // Step state: 1: protection & review, 2: digilocker KYC, 3: payment & agreement, 4: confirmed pass
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected Protection Plan
  const [selectedPlanId, setSelectedPlanId] = useState<"basic" | "premium" | "super">("premium");

  // DigiLocker KYC state
  const [dlNumber, setDlNumber] = useState("DL-0420230012345");
  const [isVerifyingKyc, setIsVerifyingKyc] = useState(false);
  const [kycOtp, setKycOtp] = useState("8924");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [kycRecord, setKycRecord] = useState<DigiLockerKycRecord | null>(null);

  // Step 3 Payment & Agreement state
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [isFastagWalletLinked, setIsFastagWalletLinked] = useState(true);
  const [isAgreementAccepted, setIsAgreementAccepted] = useState(true);

  // Rental days
  const days = Math.max(1, calculateRentalDays(pickupDate, returnDate));

  // Determine active condition option
  const activeCondition =
    conditionOption ||
    car.conditionOptions?.find((opt) => opt.tier === conditionTier) ||
    car.conditionOptions?.[1];

  // Active protection plan
  const activeProtection =
    DEFAULT_PROTECTION_PLANS.find((p) => p.id === selectedPlanId) ||
    DEFAULT_PROTECTION_PLANS[1];

  // Compute total with protection and optional FASTag wallet
  const protectionCost = activeProtection.dailyRateINR * days;
  const fastagBufferCost = isFastagWalletLinked ? 1000 : 0;
  const calculatedGrandTotal = totalINR + protectionCost + fastagBufferCost;

  // Handle DigiLocker KYC simulation
  const handleTriggerDigiLocker = () => {
    setIsVerifyingKyc(true);
    setTimeout(() => {
      setIsVerifyingKyc(false);
      setShowOtpInput(true);
    }, 600);
  };

  const handleVerifyOtp = () => {
    setShowOtpInput(false);
    setKycRecord({
      dlNumber: dlNumber || "DL-0420230012345",
      driverName: "Arjun Sharma",
      dob: "14-Aug-1996",
      age: 28,
      licenseClass: "LMV-NT (Light Motor Vehicle)",
      rtoAuthority: "Delhi Transport Dept (DL-04 Janakpuri / Aerocity)",
      validUntil: "24-Jul-2038",
      verifiedAt: "30-Oct-2026, 07:15 AM IST",
      isAgeEligible: true,
      status: "verified",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[32px] p-5 sm:p-7 shadow-homie-lg border border-[#E1E8DF] relative max-h-[92vh] overflow-y-auto">
        {/* Header Bar with Step Progress */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F0F4ED]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#50644E] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#50644E]">
              {step === 1 && "Step 1 of 3 • Protection & Trip"}
              {step === 2 && "Step 2 of 3 • Instant DigiLocker KYC"}
              {step === 3 && "Step 3 of 3 • Payment & Agreement"}
              {step === 4 && "Booking Confirmed • Digital Pass Issued"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F6F1] hover:bg-[#EAF0E7] flex items-center justify-center text-[#5C6B5A] hover:text-[#172016] transition-colors cursor-pointer"
            aria-label="Close checkout modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ===================================================================
            STEP 1: Trip, Condition & Damage Protection Plan Selection
            =================================================================== */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Selected Car Capsule */}
            <div className="flex items-center gap-3 bg-[#F8FAF7] border border-[#E8EFE5] p-3 rounded-2xl">
              <div className="relative w-20 h-14 bg-white rounded-xl overflow-hidden shrink-0 border border-[#E8EFE5]">
                <Image
                  src={car.image}
                  alt={car.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-[#172016] truncate">
                  {car.name}
                </h4>
                <p className="text-xs text-[#5C6B5A]">
                  {car.specs.fuelType} • {car.specs.transmission} • {car.specs.seats} Seats
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3D4F3B] bg-[#EAF0E7] px-2 py-0.5 rounded-md border border-[#D5E2D1]">
                    <ShieldCheck className="w-3 h-3 text-[#50644E]" />
                    {activeCondition?.label || "Executive Mint"}
                  </span>
                  <span className="text-[11px] font-semibold text-[#50644E]">
                    {formatINR(activeCondition ? Math.round(car.dailyPriceINR * activeCondition.priceMultiplier) : car.dailyPriceINR)}/d
                  </span>
                </div>
              </div>
            </div>

            {/* Hub and Dates Capsule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-[#F8FAF7] p-2.5 rounded-xl border border-[#E8EFE5] flex items-center gap-2 text-[#5C6B5A]">
                <MapPin className="w-4 h-4 text-[#50644E] shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] uppercase font-bold text-[#829280] block">Hub Station</span>
                  <span className="font-semibold text-[#172016] truncate block">{car.hubLocation}</span>
                </div>
              </div>

              <div className="bg-[#F8FAF7] p-2.5 rounded-xl border border-[#E8EFE5] flex items-center gap-2 text-[#5C6B5A]">
                <Calendar className="w-4 h-4 text-[#50644E] shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#829280] block">Schedule</span>
                  <span className="font-semibold text-[#172016]">
                    {formatDate(pickupDate)} - {formatDate(returnDate)} ({days}d • {planType})
                  </span>
                </div>
              </div>
            </div>

            {/* Damage Protection Plans Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#172016]">
                  Select Damage Protection Plan
                </h3>
                <span className="text-[11px] text-[#50644E] font-medium">All plans include 24x7 RSA</span>
              </div>

              {/* 3 Protection Plan Cards */}
              <div className="space-y-2">
                {DEFAULT_PROTECTION_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-[#F3F7F2] border-[#50644E] ring-1 ring-[#50644E] shadow-2xs"
                          : "bg-white border-[#E5EDE3] hover:border-[#D4E0D1]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-[#50644E] bg-[#50644E] text-white"
                                : "border-[#B2C2B0]"
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-[#172016]">
                              {plan.name}
                            </span>
                            <span
                              className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                plan.id === "premium"
                                  ? "bg-[#EAF0E7] text-[#3D4F3B]"
                                  : plan.id === "super"
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {plan.badge}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-extrabold text-xs text-[#172016]">
                            {plan.dailyRateINR === 0 ? "Included" : `+${formatINR(plan.dailyRateINR)}/d`}
                          </span>
                        </div>
                      </div>

                      <ul className="pl-6 space-y-0.5 text-[11px] text-[#5C6B5A]">
                        {plan.highlights.map((hl, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#50644E]" />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Preview */}
            <div className="pt-2 border-t border-[#F0F4ED] flex items-center justify-between text-xs sm:text-sm">
              <span className="text-[#5C6B5A]">
                Estimated Quote ({days} {days === 1 ? "day" : "days"} + {activeProtection.name}):
              </span>
              <span className="font-black text-lg text-[#172016]">
                {formatINR(totalINR + protectionCost)}
              </span>
            </div>

            {/* Next Action */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-full border border-[#DFE6DC] text-xs font-semibold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3 px-4 rounded-full bg-[#50644E] hover:bg-[#3F503D] active:scale-[0.99] text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Driver KYC</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 2: Instant DigiLocker Driver License KYC Verification
            =================================================================== */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-[#F3F7F2] p-3 rounded-2xl border border-[#D8E6D5]">
              <div className="w-10 h-10 rounded-xl bg-[#50644E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                DL
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5">
                  <strong className="text-[#172016]">DigiLocker Government Authentication</strong>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                    Instant API
                  </span>
                </div>
                <p className="text-[11px] text-[#5C6B5A] mt-0.5">
                  Verify your Indian Driving License (LMV) directly via Ministry of Road Transport &amp; Highways (MoRTH).
                </p>
              </div>
            </div>

            {/* Driving License Input Form */}
            {!kycRecord && !showOtpInput && (
              <div className="bg-[#F8FAF7] border border-[#E8EFE5] p-4 rounded-2xl space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider block mb-1">
                    Driving License Number (DL)
                  </label>
                  <input
                    type="text"
                    value={dlNumber}
                    onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
                    placeholder="DL-0420230012345"
                    className="w-full bg-white border border-[#DFE6DC] text-xs sm:text-sm text-[#172016] font-mono font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#50644E]/30"
                  />
                  <p className="text-[10px] text-[#829280] mt-1">
                    Minimum age requirement: 23 years with 1 year minimum driving experience.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerDigiLocker}
                  disabled={isVerifyingKyc}
                  className="w-full py-3 px-4 rounded-xl bg-[#50644E] hover:bg-[#3F503D] active:scale-[0.99] text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifyingKyc ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Connecting to DigiLocker MoRTH Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Fetch &amp; Verify via DigiLocker</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* OTP Prompt Simulation */}
            {showOtpInput && (
              <div className="bg-[#FFFBEB] border border-[#FDE68A] p-4 rounded-2xl space-y-3">
                <div className="flex items-start gap-2">
                  <KeyRound className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#92400E]">
                      DigiLocker Security OTP
                    </h4>
                    <p className="text-[11px] text-[#78350F] mt-0.5">
                      Enter the 4-digit code sent to Aadhaar-linked mobile (+91 ******3210).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={kycOtp}
                    onChange={(e) => setKycOtp(e.target.value)}
                    maxLength={4}
                    className="w-28 text-center bg-white border border-amber-300 font-mono font-bold text-base py-2 rounded-xl text-[#172016] focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Authenticate Driver License
                  </button>
                </div>
              </div>
            )}

            {/* Verified Driver Card */}
            {kycRecord && (
              <div className="bg-[#F0F7EE] border border-[#B9DDB5] p-4 rounded-2xl space-y-2.5 animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-[#D2EACD]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-900">
                      DigiLocker Verification Passed
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#5C6B5A] block">Driver Full Name</span>
                    <strong className="text-[#172016] text-sm">{kycRecord.driverName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5C6B5A] block">License Number</span>
                    <strong className="text-[#172016] font-mono">{kycRecord.dlNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5C6B5A] block">Vehicle Class</span>
                    <span className="text-[#172016] font-semibold">{kycRecord.licenseClass}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5C6B5A] block">Age Eligibility</span>
                    <span className="text-emerald-800 font-bold">28 yrs (Verified 23+)</span>
                  </div>
                </div>

                <div className="text-[10px] text-[#5C6B5A] pt-1">
                  Issued by: {kycRecord.rtoAuthority} • Valid until: {kycRecord.validUntil}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-full border border-[#DFE6DC] text-xs font-semibold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors"
              >
                Back to Protection
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!kycRecord) {
                    handleVerifyOtp();
                  }
                  setStep(3);
                }}
                className="flex-1 py-3 px-4 rounded-full bg-[#50644E] hover:bg-[#3F503D] active:scale-[0.99] text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Payment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 3: Payment Method, FASTag Wallet & Rental Agreement
            =================================================================== */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Payment Mode Selector */}
            <div>
              <h3 className="text-xs font-bold text-[#5C6B5A] uppercase tracking-wider mb-2">
                Select Payment Mode (Simulated Pre-Auth)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === "upi"
                      ? "bg-[#F3F7F2] border-[#50644E] ring-1 ring-[#50644E]"
                      : "bg-white border-[#E5EDE3] hover:bg-[#F8FAF7]"
                  }`}
                >
                  <span className="text-xs font-bold text-[#172016] block">Instant UPI</span>
                  <span className="text-[10px] text-[#5C6B5A]">GPay / PhonePe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "bg-[#F3F7F2] border-[#50644E] ring-1 ring-[#50644E]"
                      : "bg-white border-[#E5EDE3] hover:bg-[#F8FAF7]"
                  }`}
                >
                  <span className="text-xs font-bold text-[#172016] block">Credit / Debit</span>
                  <span className="text-[10px] text-[#5C6B5A]">Visa / Mastercard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === "netbanking"
                      ? "bg-[#F3F7F2] border-[#50644E] ring-1 ring-[#50644E]"
                      : "bg-white border-[#E5EDE3] hover:bg-[#F8FAF7]"
                  }`}
                >
                  <span className="text-xs font-bold text-[#172016] block">NetBanking</span>
                  <span className="text-[10px] text-[#5C6B5A]">HDFC / ICICI / SBI</span>
                </button>
              </div>
            </div>

            {/* Delhi FASTag Auto-Toll Wallet Toggle */}
            <div className="bg-[#F8FAF7] border border-[#E8EFE5] p-3.5 rounded-2xl">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFastagWalletLinked}
                  onChange={(e) => setIsFastagWalletLinked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#50644E] rounded border-gray-300 focus:ring-[#50644E]"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <strong className="text-[#172016]">Pre-load Delhi FASTag Expressway Buffer (+₹1,000)</strong>
                    <span className="text-[10px] bg-[#EAF0E7] text-[#3D4F3B] font-bold px-1.5 rounded">
                      Refundable
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5C6B5A] mt-0.5 leading-tight">
                    Seamless toll passage on Delhi-Mumbai Expressway &amp; Yamuna E-Way. Unused toll balance is auto-credited back to UPI within 24 hours of vehicle return.
                  </p>
                </div>
              </label>
            </div>

            {/* Itemized Final Quote */}
            <div className="space-y-1.5 bg-[#F8FAF7] p-3.5 rounded-2xl border border-[#E8EFE5] text-xs">
              <div className="flex justify-between text-[#5C6B5A]">
                <span>Base Hire ({days}d × {activeCondition?.label}):</span>
                <span>{formatINR(totalINR)}</span>
              </div>
              <div className="flex justify-between text-[#5C6B5A]">
                <span>{activeProtection.name} ({days}d):</span>
                <span>{formatINR(protectionCost)}</span>
              </div>
              {isFastagWalletLinked && (
                <div className="flex justify-between text-[#5C6B5A]">
                  <span>Delhi FASTag Toll Wallet:</span>
                  <span>₹1,000</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E8EFE5] flex justify-between text-sm">
                <strong className="text-[#172016]">Total Payable:</strong>
                <strong className="text-base text-[#172016]">{formatINR(calculatedGrandTotal)}</strong>
              </div>
            </div>

            {/* Rental Master Agreement Consent */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-[#5C6B5A]">
                <input
                  type="checkbox"
                  checked={isAgreementAccepted}
                  onChange={(e) => setIsAgreementAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#50644E] rounded border-gray-300 focus:ring-[#50644E]"
                />
                <span className="leading-snug">
                  I accept the <strong>Homie Drives Delhi NCR Master Rental Agreement</strong>, agree to return the car to <strong>{car.hubLocation}</strong>, and consent to pre-trip 360° walk-around video logging.
                </span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-full border border-[#DFE6DC] text-xs font-semibold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors"
              >
                Back to KYC
              </button>
              <button
                type="button"
                disabled={!isAgreementAccepted}
                onClick={() => setStep(4)}
                className={`flex-1 py-3 px-4 rounded-full text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${
                  isAgreementAccepted
                    ? "bg-[#50644E] hover:bg-[#3F503D] active:scale-[0.99]"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <span>Authorize &amp; Issue Rental Pass</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 4: Confirmed Digital Pass & Keyless Handover Details
            =================================================================== */}
        {step === 4 && (
          <div className="text-center py-2 space-y-4">
            <div className="w-14 h-14 bg-[#EAF0E7] text-[#50644E] rounded-full flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#172016]">
                Digital Rental Pass Issued!
              </h3>
              <p className="text-xs text-[#5C6B5A] mt-1 max-w-sm mx-auto">
                Your DigiLocker KYC has been authenticated and vehicle dispatch has been assigned to your Delhi NCR pickup hub.
              </p>
            </div>

            {/* Boarding Pass Style Digital Ticket */}
            <div className="bg-[#172016] text-white p-5 rounded-[26px] text-left space-y-3 relative overflow-hidden shadow-homie border border-[#2D3A2B]">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold text-[#A2BA9F] uppercase tracking-wider block">
                    Verified Digital Pass
                  </span>
                  <span className="font-mono text-xs text-white font-bold">
                    #HD-DEL-8924
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  FASTAG LINKED
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-base text-white">{car.name}</h4>
                  <p className="text-xs text-white/70">
                    Grade: <strong className="text-emerald-300">{activeCondition?.label}</strong> ({activeCondition?.odometerRange})
                  </p>
                  <p className="text-xs text-white/70">
                    Cover: <strong className="text-white">{activeProtection.name}</strong>
                  </p>
                </div>

                <div className="w-16 h-16 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center">
                  <QrCode className="w-14 h-14 text-[#172016]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-white/50 block">Handover Hub</span>
                  <strong className="text-white font-medium">{car.hubLocation}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">Keyless Digital PIN</span>
                  <strong className="text-emerald-400 font-mono text-sm tracking-wider">PIN: 8924</strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">Assigned Specialist</span>
                  <span className="text-white">{car.agentAssigned}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">Driver Authenticated</span>
                  <span className="text-emerald-300 font-medium">Arjun Sharma (DL-04)</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/ride?tab=pass"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-full bg-[#50644E] hover:bg-[#3F503D] active:scale-[0.99] text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>View in Digital Pass Tab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-full text-xs font-semibold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors"
              >
                Back to Fleet View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
