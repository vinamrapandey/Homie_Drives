"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Car, VehicleConditionTier, VehicleConditionOption } from "@/types/car";
import { DigiLockerKycRecord, ActiveRentalPass } from "@/types/booking";
import { DEFAULT_PROTECTION_PLANS } from "@/data/protection";
import { formatINR, formatDate, calculateRentalDays } from "@/lib/formatters";
import { saveActivePass } from "@/lib/passStorage";
import { createBookingAction } from "@/actions/booking";
import { submitCustomerKYCAction } from "@/actions/kyc";
import { useAuth } from "@/lib/supabase/auth";
import { AuthModal } from "@/components/auth/AuthModal";
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
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Phone,
  MessageCircle,
  Upload,
  Camera,
  FileCheck,
  Eye,
  Repeat,
  Wrench,
  Sparkles,
} from "lucide-react";

function getHubSlugFromLocation(location: string, carHubSlug?: string): string {
  if (carHubSlug) return carHubSlug;
  const loc = (location || "").toLowerCase();
  if (loc.includes("ghaziabad")) return "ghaziabad-hub";
  if (loc.includes("faridabad")) return "faridabad-hub";
  if (loc.includes("gurugram") || loc.includes("cyber")) return "gurugram-hub";
  if (loc.includes("greater noida") || loc.includes("pari chowk")) return "greater-noida-hub";
  if (loc.includes("noida") || loc.includes("18")) return "noida-hub";
  if (loc.includes("meerut")) return "meerut-hub";
  return "ghaziabad-hub";
}

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
  const [dlImagePreview, setDlImagePreview] = useState<string | null>(null);

  // Step 3 Payment & Agreement state
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [isFastagWalletLinked, setIsFastagWalletLinked] = useState(true);
  const [isAgreementAccepted, setIsAgreementAccepted] = useState(true);
  const [issuedPass, setIssuedPass] = useState<ActiveRentalPass | null>(null);

  // Supabase Auth & Booking Mutation State
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Rental days
  const days = Math.max(1, calculateRentalDays(pickupDate, returnDate));

  // Determine if this is a multi-month flexible subscription
  const isSubscription =
    planType === "monthly" ||
    planType === "quarterly" ||
    planType?.toLowerCase().includes("month") ||
    planType?.toLowerCase().includes("quarter") ||
    planType?.toLowerCase().includes("sub") ||
    days >= 28;

  // Calculate 30-day scheduled detailing & renewal dates
  const calculatedServiceDate = React.useMemo(() => {
    try {
      const p = new Date(pickupDate || Date.now());
      p.setDate(p.getDate() + 30);
      return p.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "15-Dec-2026";
    }
  }, [pickupDate]);

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
  // For monthly subscriptions, protection is a bundled flat monthly care fee
  const protectionCost = isSubscription
    ? activeProtection.id === "basic"
      ? 0
      : activeProtection.id === "premium"
      ? 4999
      : 8999
    : activeProtection.dailyRateINR * days;
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

  const handleVerifyOtp = async () => {
    setShowOtpInput(false);
    setIsVerifyingKyc(true);
    try {
      const res = await submitCustomerKYCAction({
        fullName: user?.user_metadata?.full_name || "Arjun Sharma",
        phone: user?.phone || "9811234567",
        email: user?.email || "customer@homiedrives.in",
        aadhaarNumber: "XXXXXXXX8492",
        dob: "1996-08-14",
        address: "B-4/112 Safdarjung Enclave, New Delhi",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110029",
        dlNumber: dlNumber || "DL-0420230012345",
        issuingRTO: "DL-04 Janakpuri, West Delhi",
        vehicleClasses: ["LMV-NT", "MCWG"],
        expiryDate: "2038-07-24",
        cardImageUrl: dlImagePreview || undefined,
      });

      if (res.success && res.record) {
        setKycRecord({
          dlNumber: res.record.drivingLicense.dlNumber,
          driverName: res.record.fullName,
          dob: res.record.aadhaar.dob,
          age: res.record.aadhaar.age,
          licenseClass: res.record.drivingLicense.vehicleClasses.join(", "),
          rtoAuthority: res.record.drivingLicense.issuingRTO,
          validUntil: res.record.drivingLicense.expiryDate,
          verifiedAt: new Date(res.record.digilockerVerifiedAt || Date.now()).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          isAgeEligible: res.record.aadhaar.ageCheckPassed,
          status: res.record.digilockerStatus === "verified" ? "verified" : "pending",
          dlImageUrl: res.record.drivingLicense.cardImageUrl || dlImagePreview || undefined,
        });
      }
    } catch {
      setKycRecord({
        dlNumber: dlNumber || "DL-0420230012345",
        driverName: user?.user_metadata?.full_name || "Arjun Sharma",
        dob: "14-Aug-1996",
        age: 28,
        licenseClass: "LMV-NT (Light Motor Vehicle)",
        rtoAuthority: "Delhi Transport Dept (DL-04 Janakpuri / Aerocity)",
        validUntil: "24-Jul-2038",
        verifiedAt: new Date().toLocaleDateString("en-IN"),
        isAgeEligible: true,
        status: "verified",
        dlImageUrl: dlImagePreview || undefined,
      });
    } finally {
      setIsVerifyingKyc(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setDlImagePreview(result);
        if (kycRecord) {
          setKycRecord({
            ...kycRecord,
            dlImageUrl: result,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuthorizeAndIssuePass = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    let bookingRef = `#HD-DEL-${Math.floor(1000 + Math.random() * 9000)}`;

    if (user) {
      try {
        const result = await createBookingAction({
          carSlug: car.slug,
          hubSlug: getHubSlugFromLocation(car.hubLocation, car.hubSlug),
          pickupDate,
          returnDate,
          pickupTime: "10:00 AM",
          returnTime: "08:00 PM",
          conditionTier: (activeCondition?.tier || conditionTier) as "pristine" | "mint" | "touring",
          protectionTier: selectedPlanId,
          fastagBufferINR: isFastagWalletLinked ? 1000 : 0,
          driverName: kycRecord?.driverName || user.user_metadata?.full_name || "Homie Customer",
          dlNumber: kycRecord?.dlNumber || dlNumber || "DL-0420230012345",
          email: user.email || undefined,
        });

        if (!result.success) {
          setSubmitError(result.error || "Failed to confirm reservation.");
          setIsSubmitting(false);
          return;
        }

        if (result.booking) {
          bookingRef = result.booking.bookingCode;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error confirming reservation";
        setSubmitError(message);
        setIsSubmitting(false);
        return;
      }
    }

    const randomSuffix =
      bookingRef.replace("#HD-DEL-", "") || Math.floor(1000 + Math.random() * 9000).toString();

    let regPrefix = "DL-01";
    if (car.hubLocation.includes("Cyber Hub") || car.hubLocation.includes("Gurugram")) {
      regPrefix = "HR-26";
    } else if (car.hubLocation.includes("Noida") || car.hubLocation.includes("Sector 18")) {
      regPrefix = "UP-16";
    }
    const regNum = `${regPrefix}-${car.brand.slice(0, 2).toUpperCase()}-${randomSuffix}`;

    const newPass: ActiveRentalPass = {
      id: `pass-${car.slug}-${Date.now()}`,
      bookingRef,
      carId: car.id,
      carSlug: car.slug,
      carName: car.name,
      carCategory: car.categoryLabel || car.category,
      carImage: car.image,
      brand: car.brand,
      registrationNumber: regNum,
      pickupLocation: car.hubLocation,
      returnLocation: car.hubLocation,
      pickupDate,
      returnDate,
      pickupTime: "10:00 AM",
      returnTime: "08:00 PM",
      days,
      conditionTier: activeCondition?.tier || conditionTier,
      conditionLabel: activeCondition?.label || "Executive Mint",
      odometerRange: activeCondition?.odometerRange || "5,000–25,000 km",
      protectionPlanName: activeProtection.name,
      protectionPlanId: activeProtection.id,
      excessLiabilityINR: activeProtection.excessLiabilityINR,
      fastagBufferINR: isFastagWalletLinked ? 1000 : 0,
      fastagBalanceINR: isFastagWalletLinked ? 1000 : 0,
      totalPaidINR: calculatedGrandTotal,
      pin: randomSuffix,
      assignedAgent: car.agentAssigned || "Kabir Mehta (Delhi Central)",
      agentPhone: "+91 98101 88924",
      driverName:
        kycRecord?.driverName || (user?.email ? user.email.split("@")[0] : "Arjun Sharma"),
      dlNumber: kycRecord?.dlNumber || dlNumber || "DL-0420230012345",
      kycStatus: "verified",
      carLocked: true,
      climateControlActive: false,
      hazardLightsActive: false,
      engineReady: true,
      batteryOrFuelLevel: car.telematicsStatus?.fuelOrBatteryPercent ?? 95,
      fuelType: car.specs?.fuelType || "Petrol",
      planType: isSubscription
        ? planType === "quarterly" || days >= 75
          ? "quarterly"
          : "monthly"
        : planType || "daily",
      isSubscription,
      nextServiceDueDate: isSubscription ? calculatedServiceDate : undefined,
      monthlyRenewalDate: isSubscription ? calculatedServiceDate : undefined,
      replacementVehicleGuarantee: isSubscription ? true : undefined,
      createdAt: new Date().toISOString(),
    };

    saveActivePass(newPass);
    setIssuedPass(newPass);
    setIsSubmitting(false);
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-xl rounded-t-[32px] sm:rounded-[32px] p-4 sm:p-7 shadow-[0_-16px_48px_rgba(23,32,22,0.2)] sm:shadow-homie-lg border-t sm:border border-[#E1E8DF] relative max-h-[90vh] sm:max-h-[92vh] overflow-y-auto pb-[max(1.5rem,calc(1rem+env(safe-area-inset-bottom,0px)))] sm:pb-7">
        {/* Mobile Drawer Grab Bar */}
        <div className="w-12 h-1 bg-[#D4E0D1] rounded-full mx-auto mb-3 sm:hidden shrink-0" />
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

            {/* Direct WhatsApp / Phone Booking Assist Banner */}
            <div className="p-3 bg-[#F3F7F2] rounded-2xl border border-[#D5E1D1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
              <div>
                <span className="font-extrabold text-[#172016] block">Prefer direct booking or have questions?</span>
                <span className="text-[11px] text-[#5C6B5A]">Instant reservation via Call or WhatsApp at <strong>8448786016</strong></span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="tel:+918448786016"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8FAF7] text-[#172016] font-bold text-xs border border-[#CFD8CD] shadow-2xs"
                >
                  <Phone className="w-3 h-3 text-[#50644E]" />
                  <span>Call 8448786016</span>
                </a>
                <a
                  href={`https://wa.me/918448786016?text=${encodeURIComponent(
                    `Hi Homie Drives, I would like to book the ${car.name} from ${pickupDate} to ${returnDate}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5C] text-white font-bold text-xs shadow-2xs"
                >
                  <MessageCircle className="w-3 h-3 fill-white" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Flexible Multi-Month Subscription Inclusions & Guarantees Banner */}
            {isSubscription && (
              <div className="bg-[#172016] text-white p-4 rounded-2xl border border-[#2D3A2B] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Homie Subscription Privileges &amp; Guarantees
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {planType === "quarterly" ? "Quarterly Lease (90d)" : "Flexible 30-Day Auto-Renew"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  <div className="flex items-start gap-2">
                    <Wrench className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Doorstep 30-Day Detailing</strong>
                      <span className="text-white/70">Complimentary health check &amp; dry wash at your address</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">4-Hour Replacement SLA</strong>
                      <span className="text-white/70">Immediate equivalent vehicle delivery during any downtime</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">3,000 km Monthly Cap</strong>
                      <span className="text-white/70">Unused kilometers roll over into next month</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Zero Maintenance &amp; Tax</strong>
                      <span className="text-white/70">Insurance, consumables &amp; Delhi NCR road tax included</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60">
                  <span>Next Scheduled Health Check: <strong className="text-emerald-300">{calculatedServiceDate}</strong></span>
                  <span className="text-emerald-300">7-Day Penalty-Free Exit</span>
                </div>
              </div>
            )}

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
                  const planCostLabel = isSubscription
                    ? plan.id === "basic"
                      ? "Included Free"
                      : plan.id === "premium"
                      ? "+₹4,999/mo"
                      : "+₹8,999/mo"
                    : plan.dailyRateINR === 0
                    ? "Included"
                    : `+${formatINR(plan.dailyRateINR)}/d`;

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
                            {planCostLabel}
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
                {isSubscription
                  ? `First Cycle Total (${planType === "quarterly" ? "Quarterly Lease" : "30 Days"} + ${activeProtection.name}):`
                  : `Estimated Quote (${days} ${days === 1 ? "day" : "days"} + ${activeProtection.name}):`}
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

            {/* Optional Physical Driver License Upload with Instant Preview */}
            <div className="bg-[#F8FAF7] border border-[#E8EFE5] p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#172016] flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#50644E]" />
                    <span>Physical Driving License Photo (Optional Backup)</span>
                  </h4>
                  <p className="text-[11px] text-[#5C6B5A] mt-0.5">
                    Upload front copy for rapid zero-contact security clearance at hub.
                  </p>
                </div>
                {dlImagePreview && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FileCheck className="w-3 h-3" />
                    <span>Uploaded</span>
                  </span>
                )}
              </div>

              {dlImagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-[#CAD8C6] bg-black/5 aspect-video max-h-36 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dlImagePreview}
                    alt="Driver License Front Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setDlImagePreview(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-[#CFD8CD] hover:border-[#50644E] hover:bg-[#F3F6F1] rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors text-center">
                  <Upload className="w-5 h-5 text-[#50644E]" />
                  <span className="text-xs font-bold text-[#172016]">
                    Click or drag &amp; drop DL front photo
                  </span>
                  <span className="text-[10px] text-[#829280]">
                    PNG, JPG, WEBP up to 5MB • Saved directly to profile
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

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
                onClick={async () => {
                  if (!kycRecord) {
                    await handleVerifyOtp();
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
            {/* Flexible Recurring Subscription Billing Schedule Card */}
            {isSubscription && (
              <div className="bg-[#F3F7F2] border border-[#CAD8C6] p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#172016]">
                    <Repeat className="w-3.5 h-3.5 text-[#50644E]" />
                    <span>Flexible Recurring Billing Schedule</span>
                  </div>
                  <span className="text-[10px] bg-[#50644E] text-white font-extrabold px-2 py-0.5 rounded-full">
                    {planType === "quarterly" ? "Quarterly Installment" : "30-Day Cycle"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5C6B5A]">
                  <div>
                    <span className="text-[10px] text-[#829280] block">First Installment Due Now</span>
                    <strong className="text-[#172016] text-xs font-mono">{formatINR(calculatedGrandTotal)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#829280] block">Next Auto-Renewal Date</span>
                    <strong className="text-[#50644E] text-xs font-semibold">{calculatedServiceDate}</strong>
                  </div>
                </div>
                <p className="text-[10px] text-[#5C6B5A] pt-1 border-t border-[#DDE7DA]">
                  Cancel or swap vehicle anytime with 7 days advance notice. Zero early-exit penalty after initial 30 days.
                </p>
              </div>
            )}

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

            {/* Offline Booking Assistance Option */}
            <div className="p-3 bg-[#F8FAF7] rounded-2xl border border-[#DFE6DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-[#172016] block">Questions before payment?</span>
                <span className="text-[11px] text-[#5C6B5A]">Call or WhatsApp <strong>8448786016</strong> for instant help.</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="tel:+918448786016"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#172016] font-bold text-xs border border-[#CFD8CD] shadow-2xs"
                >
                  <Phone className="w-3 h-3 text-[#50644E]" />
                  <span>Call Concierge</span>
                </a>
                <a
                  href={`https://wa.me/918448786016?text=${encodeURIComponent(
                    `Hi Homie Drives, I am at checkout for ${car.name} and have a quick question.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow-2xs"
                >
                  <MessageCircle className="w-3 h-3 fill-white" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Itemized Final Quote */}
            <div className="space-y-1.5 bg-[#F8FAF7] p-3.5 rounded-2xl border border-[#E8EFE5] text-xs">
              <div className="flex justify-between text-[#5C6B5A]">
                <span>
                  {isSubscription
                    ? `First Month Commitment (${activeCondition?.label}):`
                    : `Base Hire (${days}d × ${activeCondition?.label}):`}
                </span>
                <span>{formatINR(totalINR)}</span>
              </div>
              <div className="flex justify-between text-[#5C6B5A]">
                <span>
                  {isSubscription
                    ? `${activeProtection.name} (Monthly Care):`
                    : `${activeProtection.name} (${days}d):`}
                </span>
                <span>{formatINR(protectionCost)}</span>
              </div>
              {isFastagWalletLinked && (
                <div className="flex justify-between text-[#5C6B5A]">
                  <span>Delhi FASTag Toll Wallet:</span>
                  <span>₹1,000</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E8EFE5] flex justify-between text-sm">
                <strong className="text-[#172016]">
                  {isSubscription ? "First Cycle Payable:" : "Total Payable:"}
                </strong>
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
                  {isSubscription ? (
                    <>
                      I accept the <strong>Homie Drives Delhi NCR Flexible Multi-Month Subscription Agreement</strong>, agree to the 30-day recurring installment cycle, 7-day termination notice, return to <strong>{car.hubLocation}</strong>, and consent to periodic 30-day doorstep health check-ins.
                    </>
                  ) : (
                    <>
                      I accept the <strong>Homie Drives Delhi NCR Master Rental Agreement</strong>, agree to return the car to <strong>{car.hubLocation}</strong>, and consent to pre-trip 360° walk-around video logging.
                    </>
                  )}
                </span>
              </label>
            </div>

            {/* Supabase Concurrency Conflict / Error Notice */}
            {submitError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Reservation Alert</p>
                  <p className="mt-0.5 leading-relaxed">{submitError}</p>
                </div>
              </div>
            )}

            {/* Guest / Demo Notice with 1-Click Supabase Auth */}
            {!user && (
              <div className="p-3 bg-[#F3F6F1] border border-[#CAD8C6] rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#50644E] shrink-0" />
                  <span className="text-[#3D4F3B]">
                    Reserving in Guest Mode. <strong>Sign in with OTP</strong> to record this booking directly to your Supabase account.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="font-bold text-[#50644E] hover:underline shrink-0"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-full border border-[#DFE6DC] text-xs font-semibold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors disabled:opacity-50"
              >
                Back to KYC
              </button>
              <button
                type="button"
                disabled={!isAgreementAccepted || isSubmitting}
                onClick={handleAuthorizeAndIssuePass}
                className={`flex-1 py-3 px-4 rounded-full text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${
                  isAgreementAccepted && !isSubmitting
                    ? "bg-[#50644E] hover:bg-[#3F503D] active:scale-[0.99]"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Fleet Availability...</span>
                  </>
                ) : (
                  <>
                    <span>Authorize &amp; Issue Rental Pass</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
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
                    {issuedPass?.isSubscription ? "Flexible Subscription Pass" : "Verified Digital Pass"}
                  </span>
                  <span className="font-mono text-xs text-white font-bold">
                    {issuedPass?.bookingRef || "#HD-DEL-8924"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {issuedPass?.isSubscription && (
                    <span className="text-[10px] bg-[#50644E] text-white font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/40">
                      30D AUTO-RENEW
                    </span>
                  )}
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    FASTAG LINKED
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-base text-white">{car.name}</h4>
                  <p className="text-xs text-white/70">
                    Reg: <strong className="text-white font-mono">{issuedPass?.registrationNumber || "DL-01-HD-2025"}</strong>
                  </p>
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

              {issuedPass?.isSubscription && (
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 text-[11px] text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1.5 font-bold text-white">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Next Detailing: {issuedPass.nextServiceDueDate || calculatedServiceDate}</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    4-Hr Replacement Guarantee
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-white/50 block">Handover Hub</span>
                  <strong className="text-white font-medium">{car.hubLocation}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">Keyless Digital PIN / Pickup OTP</span>
                  <strong className="text-emerald-400 font-mono text-sm tracking-wider">
                    OTP: {issuedPass?.pin || "8924"}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">Assigned Specialist</span>
                  <span className="text-white">{car.agentAssigned}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">Driver Authenticated</span>
                  <span className="text-emerald-300 font-medium">
                    {issuedPass?.driverName || "Arjun Sharma"} ({issuedPass?.dlNumber?.slice(0, 5) || "DL-04"})
                  </span>
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

      {/* 1-Click Passwordless Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};
