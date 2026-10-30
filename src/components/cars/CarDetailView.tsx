"use client";

import React, { useState, useEffect, useRef } from "react";
import { Car, VehicleConditionTier } from "@/types/car";
import { DEFAULT_CONDITION_OPTIONS } from "@/data/cars";
import { formatINR, calculateRentalPrice, calculateRentalDays } from "@/lib/formatters";
import {
  Star,
  Fuel,
  Zap,
  Gauge,
  Users,
  Calendar,
  CheckCircle2,
  Info,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  ChevronRight,
  Sparkle,
  MoreHorizontal,
} from "lucide-react";
import { CarImageCarousel } from "@/components/cars/CarImageCarousel";
import { CarConditionSelector } from "@/components/cars/CarConditionSelector";
import { ReservationModal } from "@/components/booking/ReservationModal";

interface CarDetailViewProps {
  car: Car;
  onBack?: () => void;
  showBackLink?: boolean;
}

export const CarDetailView: React.FC<CarDetailViewProps> = ({
  car,
  onBack,
  showBackLink = true,
}) => {
  // Rental configuration state
  const [rentalPlan, setRentalPlan] = useState<"daily" | "monthly" | "quarterly">("daily");
  const [pickupDate, setPickupDate] = useState<string>("2026-11-15");
  const [returnDate, setReturnDate] = useState<string>("2026-11-18");
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  // 3-Tier Condition Selector State
  const conditionOptions = car.conditionOptions && car.conditionOptions.length > 0
    ? car.conditionOptions
    : DEFAULT_CONDITION_OPTIONS;

  const [selectedConditionTier, setSelectedConditionTier] = useState<VehicleConditionTier>(
    car.defaultConditionTier || "mint"
  );

  const activeConditionOption = conditionOptions.find(
    (opt) => opt.tier === selectedConditionTier
  ) || conditionOptions[1];

  const conditionMultiplier = activeConditionOption.priceMultiplier;

  // Calculate pricing breakdown with condition multiplier
  const days = calculateRentalDays(pickupDate, returnDate);
  const pricing = calculateRentalPrice(
    car.dailyPriceINR,
    days,
    conditionMultiplier,
    selectedConditionTier
  );

  // Monthly subscription calculations (adjusted for condition tier)
  const monthlyDiscountedRate = Math.round(pricing.adjustedDailyRate * 30 * 0.75);
  const quarterlyDiscountedRate = Math.round(monthlyDiscountedRate * 3 * 0.9);

  // Sticky bottom bar visibility trigger
  const [showStickyBar, setShowStickyBar] = useState(false);
  const inlineCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (inlineCtaRef.current) {
        const rect = inlineCtaRef.current.getBoundingClientRect();
        const isPastHeader = window.scrollY > 280;
        const isInlineVisible = rect.top < window.innerHeight && rect.bottom > 0;
        setShowStickyBar(isPastHeader && !isInlineVisible);
      } else {
        setShowStickyBar(window.scrollY > 300);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F6F1] pb-28">
      {/* 1. Full-Bleed Swipeable Image Carousel (Mobbin Screen 4 reference) */}
      <CarImageCarousel
        carName={car.name}
        gallery={car.gallery || []}
        fallbackImage={car.image}
        onBack={onBack}
        showBackLink={showBackLink}
      />

      {/* 2. Floating Dark Hero Summary Card (Mobbin Screen 4 dark overlay pattern) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-12 relative z-10">
        <div className="bg-[#172016] text-white rounded-[28px] p-5 sm:p-7 shadow-[0_20px_48px_rgba(23,32,22,0.28)] border border-[#2A3828]">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9BB199]">
                  {car.categoryLabel}
                </span>
                <span className="text-white/30">•</span>
                <span className="text-[11px] text-white/60 font-medium">
                  {car.year} Model
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {car.name}
              </h1>
              <p className="text-xs text-white/70 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>Stationed at: <strong className="text-white">{car.hubLocation}</strong> (Delhi NCR)</span>
              </p>
            </div>

            {/* Action Buttons & Rating Pill matching Screen 4 */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsReserveModalOpen(true)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer shadow-2xs"
                aria-label="Inspect vehicle and condition snapshot"
                title="Inspect vehicle & condition"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{car.rating.toFixed(1)}</span>
                <span className="text-[11px] text-white/60 font-normal">
                  ({car.reviewsCount})
                </span>
              </div>
            </div>
          </div>

          {/* Condition Tier Snapshot & Dynamic Price Pill */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">Selected Grade:</span>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                <Sparkle className="w-3 h-3" />
                {activeConditionOption.label} ({activeConditionOption.odometerRange})
              </span>
            </div>

            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {formatINR(pricing.adjustedDailyRate)}
              </span>
              <span className="text-xs text-white/60 ml-1">/ day</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Specifications, Condition Engine & Pricing Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-4">
        <div className="bg-white rounded-[32px] p-5 sm:p-8 shadow-homie border border-[#E8EFE5]">
          {/* Live Telematics Readiness Ribbon */}
          {car.telematicsStatus && (
            <div className="mb-4 bg-[#F5F8F4] rounded-2xl p-3 border border-[#E1E8DF] flex items-center justify-around gap-2 text-xs text-[#5C6B5A]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-[#829280] font-medium leading-none">Power / Tank</p>
                  <p className="text-xs font-bold text-[#172016]">
                    {car.telematicsStatus.fuelOrBatteryPercent}% Ready
                  </p>
                </div>
              </div>

              <div className="h-6 w-px bg-[#DFE6DC]" />

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-[#829280] font-medium leading-none">Hygiene</p>
                  <p className="text-xs font-bold text-[#172016]">
                    {car.telematicsStatus.sanitizedTimeAgo}
                  </p>
                </div>
              </div>

              <div className="h-6 w-px bg-[#DFE6DC]" />

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-[#829280] font-medium leading-none">Toll Pass</p>
                  <p className="text-xs font-bold text-[#172016]">Delhi FASTag Active</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="py-2">
            <p className="text-sm text-[#455243] leading-relaxed">
              {car.description}
            </p>
          </div>

          {/* 3-Tier Vehicle Condition Engine (Requested Core Feature) */}
          <div className="py-2 border-t border-[#F0F4ED]">
            <CarConditionSelector
              options={conditionOptions}
              selectedTier={selectedConditionTier}
              onSelectTier={setSelectedConditionTier}
              baseDailyRate={car.dailyPriceINR}
            />
          </div>

          {/* Horizontal Specifications Slider (Mobbin horizontal card layout) */}
          <div className="py-4 border-t border-[#F0F4ED]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-[#172016]">
                  How to drive • Specifications
                </h3>
                <p className="text-[11px] text-[#829280]">
                  Engineered performance, efficiency &amp; cabin credentials
                </p>
              </div>
              <span className="text-xs text-[#829280] font-medium hidden sm:inline-block">Swipe to explore →</span>
            </div>

            <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 snap-x">
              {/* Card 1: Range */}
              <div className="min-w-[150px] sm:min-w-[170px] bg-[#EAF0E7] rounded-2xl p-4 flex flex-col justify-between snap-start border border-[#D8E2D5]">
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#50644E] mb-2 shadow-xs">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#172016]">
                    {car.specs.rangeOrMileage}
                  </p>
                  <p className="text-[11px] font-medium text-[#5C6B5A]">
                    {car.specs.fuelType} Efficiency
                  </p>
                </div>
              </div>

              {/* Card 2: Horsepower */}
              <div className="min-w-[150px] sm:min-w-[170px] bg-[#EAF0E7] rounded-2xl p-4 flex flex-col justify-between snap-start border border-[#D8E2D5]">
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#50644E] mb-2 shadow-xs">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#172016]">
                    {car.specs.horsePower}
                  </p>
                  <p className="text-[11px] font-medium text-[#5C6B5A]">
                    Peak Power
                  </p>
                </div>
              </div>

              {/* Card 3: Top Speed */}
              <div className="min-w-[150px] sm:min-w-[170px] bg-[#EAF0E7] rounded-2xl p-4 flex flex-col justify-between snap-start border border-[#D8E2D5]">
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#50644E] mb-2 shadow-xs">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#172016]">
                    {car.specs.topSpeed}
                  </p>
                  <p className="text-[11px] font-medium text-[#5C6B5A]">
                    Top Speed
                  </p>
                </div>
              </div>

              {/* Card 4: Cabin & Transmission */}
              <div className="min-w-[150px] sm:min-w-[170px] bg-[#EAF0E7] rounded-2xl p-4 flex flex-col justify-between snap-start border border-[#D8E2D5]">
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#50644E] mb-2 shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#172016]">
                    {car.specs.seats} Seats
                  </p>
                  <p className="text-[11px] font-medium text-[#5C6B5A]">
                    {car.specs.transmission} Gearbox
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Duration Options: Segmented Control */}
          <div className="py-4 border-t border-[#F0F4ED]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-[#172016]">
                Rental Tenure & Plan
              </h3>
              <span className="text-xs text-[#50644E] font-semibold bg-[#EAF0E7] px-2.5 py-0.5 rounded-full">
                Delhi NCR Hub Return
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#F3F6F1] rounded-2xl border border-[#DFE6DC]">
              <button
                type="button"
                onClick={() => setRentalPlan("daily")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  rentalPlan === "daily"
                    ? "bg-[#50644E] text-white shadow-sm scale-[1.01]"
                    : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white/60"
                }`}
              >
                Daily / Weekend
              </button>
              <button
                type="button"
                onClick={() => setRentalPlan("monthly")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  rentalPlan === "monthly"
                    ? "bg-[#50644E] text-white shadow-sm scale-[1.01]"
                    : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white/60"
                }`}
              >
                1 Month (-25%)
              </button>
              <button
                type="button"
                onClick={() => setRentalPlan("quarterly")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  rentalPlan === "quarterly"
                    ? "bg-[#50644E] text-white shadow-sm scale-[1.01]"
                    : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white/60"
                }`}
              >
                3–6 Months Sub
              </button>
            </div>
          </div>

          {/* Date Picker Range (for daily/weekend) */}
          {rentalPlan === "daily" ? (
            <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3">
                <label className="text-[11px] font-semibold text-[#5C6B5A] block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#50644E]" />
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  min="2026-11-01"
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-transparent font-medium text-sm text-[#172016] focus:outline-none"
                />
              </div>

              <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3">
                <label className="text-[11px] font-semibold text-[#5C6B5A] block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#50644E]" />
                  Return Date ({days} {days === 1 ? "day" : "days"})
                </label>
                <input
                  type="date"
                  value={returnDate}
                  min={pickupDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-transparent font-medium text-sm text-[#172016] focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="my-3 bg-[#EAF0E7] border border-[#D4E0D1] rounded-2xl p-4 text-xs text-[#3D4F3B]">
              <div className="flex items-center gap-2 font-bold text-sm text-[#172016] mb-1">
                <Sparkles className="w-4 h-4 text-[#50644E]" />
                <span>
                  {rentalPlan === "monthly" ? "1-Month Subscription" : "3 to 6-Month Flexible Lease"}
                </span>
              </div>
              <p className="leading-relaxed">
                Includes zero maintenance liability, complimentary vehicle sanitization every 30 days, door-to-door concierge delivery in Delhi NCR, and priority agent support.
              </p>
            </div>
          )}

          {/* Transparent Price Breakdown (Recalculated with Condition) */}
          <div className="py-4 border-t border-[#F0F4ED]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#172016]">
                Transparent Price Breakdown
              </h3>
              <span className="text-[11px] font-semibold text-[#50644E] bg-[#EAF0E7] px-2 py-0.5 rounded">
                Tier: {activeConditionOption.label}
              </span>
            </div>

            {rentalPlan === "daily" ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[#5C6B5A]">
                  <span>
                    Daily rate (Tier: {activeConditionOption.label}) × {pricing.days} {pricing.days === 1 ? "day" : "days"}
                  </span>
                  <span className="font-semibold text-[#172016]">
                    {formatINR(pricing.rentalBase)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#5C6B5A]">
                  <span className="flex items-center gap-1">
                    Comprehensive Zero-Dep Insurance
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded font-medium">
                      Included
                    </span>
                  </span>
                  <span className="font-semibold text-emerald-700">₹0</span>
                </div>
                <div className="flex items-center justify-between text-[#5C6B5A]">
                  <span>Platform & Service Fee (5%)</span>
                  <span className="font-semibold text-[#172016]">
                    {formatINR(pricing.serviceFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#5C6B5A]">
                  <span>GST (18% Govt. Tax)</span>
                  <span className="font-semibold text-[#172016]">
                    {formatINR(pricing.gst)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#829280] italic">
                  <span>Refundable Security Deposit (Auto-refunded to UPI within 24h)</span>
                  <span>{formatINR(pricing.securityDeposit)}</span>
                </div>

                <div className="pt-3 border-t border-[#F0F4ED] flex items-center justify-between text-sm sm:text-base">
                  <span className="font-bold text-[#172016]">Estimated Total (All-Inclusive)</span>
                  <span className="font-black text-2xl text-[#172016]">
                    {formatINR(pricing.total)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[#5C6B5A]">
                  <span>
                    Monthly Commitment ({rentalPlan === "monthly" ? "30 Days" : "90 Days"})
                  </span>
                  <span className="font-semibold text-[#172016]">
                    {formatINR(rentalPlan === "monthly" ? monthlyDiscountedRate : quarterlyDiscountedRate)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#5C6B5A]">
                  <span>Doorstep Concierge & Sanitization</span>
                  <span className="font-semibold text-emerald-700">Included</span>
                </div>
                <div className="flex items-center justify-between text-[#5C6B5A]">
                  <span>Road Tax & Comprehensive Insurance</span>
                  <span className="font-semibold text-emerald-700">Included</span>
                </div>
                <div className="pt-3 border-t border-[#F0F4ED] flex items-center justify-between text-sm sm:text-base">
                  <span className="font-bold text-[#172016]">Subscribed Total</span>
                  <span className="font-black text-2xl text-[#172016]">
                    {formatINR(rentalPlan === "monthly" ? monthlyDiscountedRate : quarterlyDiscountedRate)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Included Amenities List */}
          <div className="py-4 border-t border-[#F0F4ED]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6B5A] mb-2.5">
              Homie Signature Assurance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5C6B5A]">
              {car.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#50644E] shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Fleet Agent Card */}
          <div className="py-3 px-4 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5] text-xs text-[#5C6B5A] flex items-center justify-between">
            <div>
              <p className="font-medium text-[#172016]">Handover Specialist</p>
              <p className="text-[11px] text-[#829280]">{car.agentAssigned}</p>
            </div>
            <span className="text-[10px] bg-[#EAF0E7] text-[#50644E] font-semibold px-2.5 py-1 rounded-full">
              Demo Assignment
            </span>
          </div>

          {/* Primary Inline CTA */}
          <div ref={inlineCtaRef} className="mt-6 pt-4 border-t border-[#F0F4ED]">
            <button
              type="button"
              onClick={() => setIsReserveModalOpen(true)}
              className="w-full bg-[#50644E] hover:bg-[#3F503D] active:scale-[0.99] text-white text-base font-bold py-4 rounded-full transition-all duration-200 shadow-homie flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book Now • {activeConditionOption.label}</span>
              <span className="text-sm font-normal text-[#D4E0D1]">
                ({formatINR(rentalPlan === "daily" ? pricing.total : monthlyDiscountedRate)})
              </span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
            <p className="text-[11px] text-center text-[#829280] mt-2.5 flex items-center justify-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#50644E]" />
              <span>No immediate payment required • Prototype preview only</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Floating Booking Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-[#DFE6DC] px-4 py-3 sm:hidden shadow-[0_-12px_32px_rgba(23,32,22,0.14)] transition-all duration-300 animate-in slide-in-from-bottom">
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#5C6B5A] truncate max-w-[150px]">
                {activeConditionOption.label}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-[#172016]">
                  {formatINR(rentalPlan === "daily" ? pricing.total : monthlyDiscountedRate)}
                </span>
                <span className="text-xs text-[#829280]">
                  {rentalPlan === "daily" ? "total" : "/ mo"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReserveModalOpen(true)}
              className="bg-[#50644E] hover:bg-[#3F503D] active:scale-95 text-white text-sm font-bold py-3 px-6 rounded-full transition-all duration-200 shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Book Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Reservation Preview Modal with Condition Snapshot */}
      {isReserveModalOpen && (
        <ReservationModal
          car={car}
          pickupDate={pickupDate}
          returnDate={returnDate}
          totalINR={rentalPlan === "daily" ? pricing.total : monthlyDiscountedRate}
          planType={rentalPlan}
          conditionTier={selectedConditionTier}
          conditionOption={activeConditionOption}
          onClose={() => setIsReserveModalOpen(false)}
        />
      )}
    </div>
  );
};
