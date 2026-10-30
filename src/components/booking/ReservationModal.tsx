"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Car } from "@/types/car";
import { formatINR, formatDate } from "@/lib/formatters";
import { X, CheckCircle, AlertCircle, Calendar, MapPin, ArrowRight } from "lucide-react";

interface ReservationModalProps {
  car: Car;
  pickupDate: string;
  returnDate: string;
  totalINR: number;
  planType: string;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  car,
  pickupDate,
  returnDate,
  totalINR,
  planType,
  onClose,
}) => {
  const [step, setStep] = useState<"review" | "confirmed">("review");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[28px] p-6 sm:p-7 shadow-homie-lg border border-[#E1E8DF] relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F3F6F1] hover:bg-[#EAF0E7] flex items-center justify-center text-[#5C6B5A] hover:text-[#172016] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {step === "review" ? (
          <div>
            <div className="inline-block bg-[#EAF0E7] text-[#3D4F3B] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              Phase 1 UI Prototype
            </div>
            <h3 className="text-xl font-bold text-[#172016] mb-1">
              Sample Reservation Preview
            </h3>
            <p className="text-xs text-[#5C6B5A] mb-4">
              Review your trip configuration. No real booking is placed or payment charged.
            </p>

            {/* Selected Car Capsule */}
            <div className="flex items-center gap-3 bg-[#F8FAF7] border border-[#E8EFE5] p-3 rounded-2xl mb-4">
              <div className="relative w-20 h-14 bg-white rounded-xl overflow-hidden shrink-0 border border-[#E8EFE5]">
                <Image
                  src={car.image}
                  alt={car.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-[#172016] truncate">
                  {car.name}
                </h4>
                <p className="text-xs text-[#5C6B5A]">
                  {car.specs.fuelType} • {car.specs.transmission} • {car.specs.seats} Seats
                </p>
                <p className="text-xs font-semibold text-[#50644E] mt-0.5">
                  {formatINR(car.dailyPriceINR)} / day
                </p>
              </div>
            </div>

            {/* Trip Itinerary Specs */}
            <div className="space-y-2.5 bg-[#F8FAF7] p-4 rounded-2xl border border-[#E8EFE5] text-xs mb-4">
              <div className="flex items-start gap-2 text-[#5C6B5A]">
                <MapPin className="w-4 h-4 text-[#50644E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#172016]">Pickup & Return Hub:</span>
                  <p className="text-[11px] text-[#829280]">{car.hubLocation}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[#5C6B5A]">
                <Calendar className="w-4 h-4 text-[#50644E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#172016]">Rental Schedule:</span>
                  <p className="text-[11px] text-[#829280]">
                    {formatDate(pickupDate)} to {formatDate(returnDate)} ({planType} plan)
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="border-t border-[#F0F4ED] pt-3 pb-2 flex items-center justify-between text-sm mb-4">
              <span className="font-semibold text-[#172016]">Total Indicative Quote:</span>
              <span className="font-extrabold text-lg text-[#172016]">
                {formatINR(totalINR)}
              </span>
            </div>

            {/* Explicit Phase 1 Disclaimer Box */}
            <div className="bg-[#FFFBEB] border border-[#FDE68A] p-3 rounded-xl flex items-start gap-2 text-xs text-[#92400E] mb-5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Notice:</strong> Real payment gateways, DigiLocker driving license verification, and agent vehicle dispatch will be integrated in subsequent phases.
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-full border border-[#DFE6DC] text-xs font-semibold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep("confirmed")}
                className="flex-1 py-3 px-4 rounded-full bg-[#50644E] hover:bg-[#3F503D] text-xs font-bold text-white transition-all shadow-sm"
              >
                Simulate Demo Pass
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-[#EAF0E7] text-[#50644E] rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#172016] mb-1">
              Demo Request Logged!
            </h3>
            <p className="text-xs text-[#5C6B5A] max-w-sm mx-auto mb-5 leading-relaxed">
              This action generates a simulated digital rental pass. You can inspect how active and confirmed passes appear in the <strong>Ride → Pass</strong> tab.
            </p>

            <div className="p-3 bg-[#F8FAF7] border border-[#E8EFE5] rounded-xl text-left text-xs space-y-1 mb-5">
              <p>
                <strong>Simulated Booking Ref:</strong> #HD-DEL-8924
              </p>
              <p>
                <strong>Vehicle:</strong> {car.name}
              </p>
              <p>
                <strong>Handover Hub:</strong> {car.hubLocation}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/ride?tab=pass"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-full bg-[#50644E] hover:bg-[#3F503D] text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>View Sample Rental Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-full text-xs font-semibold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors"
              >
                Back to Fleet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
