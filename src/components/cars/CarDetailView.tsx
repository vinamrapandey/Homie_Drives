"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Car } from "@/types/car";
import { formatINR, calculateRentalPrice, calculateRentalDays } from "@/lib/formatters";
import {
  ArrowLeft,
  Share2,
  Star,
  Fuel,
  Zap,
  Gauge,
  Users,
  Calendar,
  CheckCircle2,
  Info,
  Sparkles,
  Camera,
  ShieldCheck,
  Key,
  BadgeCheck,
  ChevronRight,
} from "lucide-react";
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

  // Multi-angle gallery state
  const gallery = car.gallery && car.gallery.length > 0
    ? car.gallery
    : [{ label: "Exterior View", url: car.image }];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const currentImage = gallery[activeImageIndex]?.url || car.image;

  // Sticky bottom bar visibility trigger
  const [showStickyBar, setShowStickyBar] = useState(false);
  const inlineCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (inlineCtaRef.current) {
        const rect = inlineCtaRef.current.getBoundingClientRect();
        // Show sticky bar when inline CTA is scrolled off-screen or user scrolled past 250px
        const isPastHeader = window.scrollY > 260;
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

  // Calculate pricing breakdown
  const days = calculateRentalDays(pickupDate, returnDate);
  const pricing = calculateRentalPrice(car.dailyPriceINR, days);

  // Monthly subscription calculations
  const monthlyDiscountedRate = Math.round(car.dailyPriceINR * 30 * 0.75);
  const quarterlyDiscountedRate = Math.round(monthlyDiscountedRate * 3 * 0.9);

  return (
    <div className="min-h-screen bg-[#F3F6F1] pb-28">
      {/* Top Bar with Frosted Glassmorphism */}
      <div className="sticky top-0 z-30 bg-[#F3F6F1]/85 backdrop-blur-md border-b border-[#E1E8DF]/60 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          {showBackLink ? (
            <button
              type="button"
              onClick={onBack ? onBack : () => window.history.back()}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[#DFE6DC] flex items-center justify-center text-[#172016] hover:bg-[#EAF0E7] hover:scale-105 active:scale-95 transition-all shadow-sm"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}

          <div className="text-center">
            <h1 className="text-sm font-bold text-[#172016]">{car.name}</h1>
            <p className="text-[11px] font-medium text-[#5C6B5A]">Homie Luxury Fleet</p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${car.name} — Homie Drives Delhi NCR`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href);
                alert("Car listing link copied to clipboard!");
              }
            }}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[#DFE6DC] flex items-center justify-center text-[#172016] hover:bg-[#EAF0E7] hover:scale-105 active:scale-95 transition-all shadow-sm"
            aria-label="Share car details"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-Angle Interactive Vehicle Gallery Showcase */}
      <div className="max-w-3xl mx-auto px-4 pt-3 pb-2">
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-[28px] bg-gradient-to-b from-[#EAEFE8] to-[#DFE7DD] border border-[#D8E2D6] overflow-hidden flex items-center justify-center shadow-homie group">
          <Image
            key={currentImage}
            src={currentImage}
            alt={`${car.name} - ${gallery[activeImageIndex]?.label || "View"}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-contain p-2 sm:p-4 drop-shadow-2xl transition-all duration-500 ease-out animate-in fade-in zoom-in-95"
          />

          {/* Current Angle Tag */}
          <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 bg-white/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/60 shadow-sm">
            <Camera className="w-3.5 h-3.5 text-[#50644E]" />
            <span className="text-xs font-bold text-[#172016]">
              {gallery[activeImageIndex]?.label}
            </span>
            <span className="text-[10px] text-[#5C6B5A] ml-0.5">
              ({activeImageIndex + 1}/{gallery.length})
            </span>
          </div>

          {/* Telematics Fastag & Keyless Badge overlay */}
          <div className="absolute top-3.5 right-3.5 z-10 hidden sm:flex items-center gap-1.5 bg-[#50644E]/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm">
            <Key className="w-3 h-3 text-[#D4E0D1]" />
            <span>Keyless Ready</span>
          </div>
        </div>

        {/* Gallery Angle Pills / Thumbnail Switcher */}
        {gallery.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3 overflow-x-auto no-scrollbar py-1">
            {gallery.map((item, idx) => {
              const isSelected = idx === activeImageIndex;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#50644E] text-white shadow-sm scale-[1.02]"
                      : "bg-white/85 backdrop-blur-md text-[#5C6B5A] hover:bg-white hover:text-[#172016] border border-[#DFE6DC]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-emerald-300 animate-pulse" : "bg-[#829280]"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Live Vehicle Telematics Status Ribbon */}
        {car.telematicsStatus && (
          <div className="mt-3 bg-white/80 backdrop-blur-md rounded-2xl p-2.5 border border-[#E1E8DF] flex items-center justify-around gap-2 text-xs text-[#5C6B5A]">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-[#829280] font-medium leading-none">Level</p>
                <p className="text-xs font-bold text-[#172016]">
                  {car.telematicsStatus.fuelOrBatteryPercent}%
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-[#E1E8DF]" />

            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-700">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-[#829280] font-medium leading-none">Hygiene</p>
                <p className="text-xs font-bold text-[#172016]">
                  {car.telematicsStatus.sanitizedTimeAgo}
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-[#E1E8DF]" />

            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                <BadgeCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-[#829280] font-medium leading-none">Toll Pass</p>
                <p className="text-xs font-bold text-[#172016]">Delhi FASTag</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Curved Bottom Sheet Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-3">
        <div className="bg-white rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 shadow-homie border border-[#E8EFE5]">
          {/* Header Row: Title, Subtitle, Star Rating */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#F0F4ED]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172016] tracking-tight">
                {car.name}
              </h2>
              <p className="text-sm font-medium text-[#5C6B5A] mt-0.5">
                {car.categoryLabel} ({car.year})
              </p>
              <p className="text-xs text-[#829280] mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Stationed at: <strong>{car.hubLocation}</strong></span>
              </p>
            </div>

            <div className="inline-flex items-center gap-1 bg-[#FFF9ED] border border-[#FDE68A] text-[#B45309] px-3 py-1.5 rounded-full text-xs font-bold shrink-0 shadow-xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{car.rating.toFixed(1)}</span>
              <span className="text-[11px] text-[#92400E] font-normal">
                ({car.reviewsCount})
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="py-4">
            <p className="text-sm text-[#455243] leading-relaxed">
              {car.description}
            </p>
          </div>

          {/* Features / Specs Grid matching Screen 3 olive-tinted cards */}
          <div className="py-4">
            <h3 className="text-base font-bold text-[#172016] mb-3">Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Feature 1: Range / Mileage */}
              <div className="bg-[#DCE7D9] rounded-2xl p-3.5 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center text-[#50644E] mb-2">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172016]">
                    {car.specs.rangeOrMileage}
                  </p>
                  <p className="text-[11px] font-medium text-[#5C6B5A]">
                    {car.specs.fuelType === "Electric" ? "Full Battery" : "Estimated"}
                  </p>
                </div>
              </div>

              {/* Feature 2: Horse Power */}
              <div className="bg-[#DCE7D9] rounded-2xl p-3.5 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center text-[#50644E] mb-2">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172016]">
                    {car.specs.horsePower}
                  </p>
                  <p className="text-[11px] font-medium text-[#5C6B5A]">
                    Horse Power
                  </p>
                </div>
              </div>

              {/* Feature 3: Top Speed */}
              <div className="bg-[#DCE7D9] rounded-2xl p-3.5 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center text-[#50644E] mb-2">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172016]">
                    {car.specs.topSpeed}
                  </p>
                  <p className="text-[11px] font-medium text-[#5C6B5A]">
                    Top Speed
                  </p>
                </div>
              </div>

              {/* Feature 4: Seating / Transmission */}
              <div className="bg-[#DCE7D9] rounded-2xl p-3.5 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center text-[#50644E] mb-2">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172016]">
                    {car.specs.seats} Seats • {car.specs.transmission}
                  </p>
                  <p className="text-[11px] font-medium text-[#5C6B5A]">
                    Cabin Layout
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
                Flexible Delhi NCR Terms
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
            <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* Transparent Price Breakdown */}
          <div className="py-4 border-t border-[#F0F4ED]">
            <h3 className="text-base font-bold text-[#172016] mb-3">Rental Price Breakdown</h3>

            {rentalPlan === "daily" ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[#5C6B5A]">
                  <span>
                    Daily rate × {pricing.days} {pricing.days === 1 ? "day" : "days"}
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
                  <span>Service Fee & Platform Tech (5%)</span>
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
              <span>Book Now</span>
              <span className="text-sm font-normal text-[#D4E0D1]">
                ({formatINR(rentalPlan === "daily" ? pricing.total : monthlyDiscountedRate)})
              </span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
            <p className="text-[11px] text-center text-[#829280] mt-2.5 flex items-center justify-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#50644E]" />
              <span>No immediate payment required • Instant reservation preview</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Floating Booking Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-[#DFE6DC] px-4 py-3 sm:hidden shadow-[0_-12px_32px_rgba(23,32,22,0.14)] transition-all duration-300 animate-in slide-in-from-bottom">
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#5C6B5A]">
                {rentalPlan === "daily" ? `${days} Day Rental` : "Subscription"}
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

      {/* Reservation Preview Modal */}
      {isReserveModalOpen && (
        <ReservationModal
          car={car}
          pickupDate={pickupDate}
          returnDate={returnDate}
          totalINR={rentalPlan === "daily" ? pricing.total : monthlyDiscountedRate}
          planType={rentalPlan}
          onClose={() => setIsReserveModalOpen(false)}
        />
      )}
    </div>
  );
};
