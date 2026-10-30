"use client";

import React, { useState } from "react";
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
  // Rental configuration state with deterministic initial dates for prerendering
  const [rentalPlan, setRentalPlan] = useState<"daily" | "monthly" | "quarterly">("daily");
  const [pickupDate, setPickupDate] = useState<string>("2026-11-15");
  const [returnDate, setReturnDate] = useState<string>("2026-11-18");
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  // Calculate pricing breakdown
  const days = calculateRentalDays(pickupDate, returnDate);
  const pricing = calculateRentalPrice(car.dailyPriceINR, days);

  // Monthly subscription calculations (20% discount on 30 days)
  const monthlyDiscountedRate = Math.round(car.dailyPriceINR * 30 * 0.75);
  const quarterlyDiscountedRate = Math.round(monthlyDiscountedRate * 3 * 0.9);

  return (
    <div className="min-h-screen bg-[#F3F6F1] pb-24">
      {/* Top Bar matching Screen 3 */}
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        {showBackLink && (
          <button
            type="button"
            onClick={onBack ? onBack : () => window.history.back()}
            className="w-10 h-10 rounded-full bg-white border border-[#DFE6DC] flex items-center justify-center text-[#172016] hover:bg-[#EAF0E7] transition-colors shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <h1 className="text-base sm:text-lg font-bold text-[#172016]">Car Details</h1>

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
          className="w-10 h-10 rounded-full bg-white border border-[#DFE6DC] flex items-center justify-center text-[#172016] hover:bg-[#EAF0E7] transition-colors shadow-sm"
          aria-label="Share car details"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Car Showcase Image */}
      <div className="max-w-3xl mx-auto px-4 py-2">
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center">
          <Image
            src={car.image}
            alt={car.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-contain drop-shadow-xl"
          />
        </div>
      </div>

      {/* Curved Bottom Sheet Card matching Screen 3 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
              <p className="text-xs text-[#829280] mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Stationed at: <strong>{car.hubLocation}</strong> (Delhi NCR)</span>
              </p>
            </div>

            <div className="inline-flex items-center gap-1 bg-[#FFF9ED] border border-[#FDE68A] text-[#B45309] px-3 py-1.5 rounded-full text-xs font-bold shrink-0">
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
            <h3 className="text-base font-bold text-[#172016] mb-3">Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Feature 1: Range / Mileage */}
              <div className="bg-[#DCE7D9] rounded-2xl p-3.5 flex flex-col justify-between">
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
              <div className="bg-[#DCE7D9] rounded-2xl p-3.5 flex flex-col justify-between">
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
              <div className="bg-[#DCE7D9] rounded-2xl p-3.5 flex flex-col justify-between">
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
              <div className="bg-[#DCE7D9] rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center text-[#50644E] mb-2">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172016]">
                    {car.specs.seats} Seats • {car.specs.transmission}
                  </p>
                  <p className="text-[11px] font-medium text-[#5C6B5A]">
                    Cabin Specs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Duration Options: Daily vs Long-Term Flexible Commitment */}
          <div className="py-4 border-t border-[#F0F4ED]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-[#172016]">
                Rental Duration & Commitment
              </h3>
              <span className="text-xs text-[#50644E] font-medium">
                Flexible Delhi NCR Terms
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1 bg-[#F3F6F1] rounded-2xl">
              <button
                type="button"
                onClick={() => setRentalPlan("daily")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  rentalPlan === "daily"
                    ? "bg-[#50644E] text-white shadow-sm"
                    : "text-[#5C6B5A] hover:text-[#172016]"
                }`}
              >
                Daily / Weekend
              </button>
              <button
                type="button"
                onClick={() => setRentalPlan("monthly")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  rentalPlan === "monthly"
                    ? "bg-[#50644E] text-white shadow-sm"
                    : "text-[#5C6B5A] hover:text-[#172016]"
                }`}
              >
                1 Month (Save 25%)
              </button>
              <button
                type="button"
                onClick={() => setRentalPlan("quarterly")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  rentalPlan === "quarterly"
                    ? "bg-[#50644E] text-white shadow-sm"
                    : "text-[#5C6B5A] hover:text-[#172016]"
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

          {/* Rental Price Breakdown matching Screen 3 */}
          <div className="py-4 border-t border-[#F0F4ED]">
            <h3 className="text-base font-bold text-[#172016] mb-3">Rental Price</h3>

            {rentalPlan === "daily" ? (
              <div className="space-y-2 text-xs">
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
                    Comprehensive Insurance
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded">
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
                  <span>Refundable Security Deposit (Returned on drop-off)</span>
                  <span>{formatINR(pricing.securityDeposit)}</span>
                </div>

                <div className="pt-3 border-t border-[#F0F4ED] flex items-center justify-between text-sm sm:text-base">
                  <span className="font-bold text-[#172016]">Estimated Total</span>
                  <span className="font-extrabold text-xl text-[#172016]">
                    {formatINR(pricing.total)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
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
                  <span className="font-extrabold text-xl text-[#172016]">
                    {formatINR(rentalPlan === "monthly" ? monthlyDiscountedRate : quarterlyDiscountedRate)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Included Amenities List */}
          <div className="py-4 border-t border-[#F0F4ED]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6B5A] mb-2">
              Homie Assurance Included
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5C6B5A]">
              {car.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#50644E] shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Fleet Agent (Internal Demo Information) */}
          <div className="py-3 px-4 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5] text-xs text-[#5C6B5A] flex items-center justify-between">
            <div>
              <p className="font-medium text-[#172016]">Vehicle Management</p>
              <p className="text-[11px] text-[#829280]">{car.agentAssigned}</p>
            </div>
            <span className="text-[10px] bg-[#EAF0E7] text-[#50644E] font-semibold px-2 py-1 rounded-full">
              Demo Assignment
            </span>
          </div>

          {/* Primary CTA Button matching Screen 3 Dark Sage Pill */}
          <div className="mt-6 pt-4 border-t border-[#F0F4ED]">
            <button
              type="button"
              onClick={() => setIsReserveModalOpen(true)}
              className="w-full bg-[#50644E] hover:bg-[#3F503D] active:scale-[0.99] text-white text-base font-bold py-4 rounded-full transition-all duration-200 shadow-homie flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book Now</span>
              <span className="text-sm font-normal text-[#D4E0D1]">
                ({formatINR(rentalPlan === "daily" ? pricing.total : monthlyDiscountedRate)})
              </span>
            </button>
            <p className="text-[11px] text-center text-[#829280] mt-2 flex items-center justify-center gap-1">
              <Info className="w-3 h-3 text-[#50644E]" />
              <span>No immediate payment required • Prototype preview only</span>
            </p>
          </div>
        </div>
      </div>

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
