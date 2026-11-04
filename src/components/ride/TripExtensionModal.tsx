"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ActiveRentalPass } from "@/types/booking";
import { formatINR, formatDate } from "@/lib/formatters";
import { extendBookingDurationAction } from "@/actions/booking";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface TripExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePass: ActiveRentalPass;
  onPassUpdated: (updatedPass: ActiveRentalPass) => void;
}

export const TripExtensionModal: React.FC<TripExtensionModalProps> = ({
  isOpen,
  onClose,
  activePass,
  onPassUpdated,
}) => {
  const [additionalDays, setAdditionalDays] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate new return date
  const currentReturnObj = new Date(activePass.returnDate || Date.now());
  const newReturnObj = new Date(currentReturnObj);
  newReturnObj.setDate(newReturnObj.getDate() + additionalDays);
  const newReturnDateStr = newReturnObj.toISOString().split("T")[0];

  // Pro-rata daily calculation based on existing rental total
  const effectiveDays = Math.max(1, activePass.days);
  const estimatedDailyBase = Math.round((activePass.totalPaidINR * 0.7) / effectiveDays);
  const dailyProtection = activePass.protectionPlanId === "basic" ? 0 : 799;
  const extensionDailyTotal = estimatedDailyBase + dailyProtection;
  const additionalPayableINR = extensionDailyTotal * additionalDays;

  const handleConfirmExtension = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await extendBookingDurationAction({
        bookingCode: activePass.bookingRef,
        additionalDays,
        newReturnDate: newReturnDateStr,
        additionalAmountINR: additionalPayableINR,
      });

      if (!res.success) {
        setError(res.error || "Could not extend rental duration.");
        setIsSubmitting(false);
        return;
      }

      const updatedPass: ActiveRentalPass = {
        ...activePass,
        days: activePass.days + additionalDays,
        returnDate: newReturnDateStr,
        totalPaidINR: activePass.totalPaidINR + additionalPayableINR,
      };

      onPassUpdated(updatedPass);
      setSuccessMessage(
        `Trip successfully extended by ${additionalDays} ${additionalDays === 1 ? "day" : "days"}! New return is ${formatDate(newReturnDateStr)} at ${activePass.returnTime}.`
      );

      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to extend rental.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[32px] p-5 sm:p-7 shadow-homie-lg border border-[#E1E8DF] relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F4ED]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#50644E] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#50644E]">
              Self-Service Trip Extension
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F6F1] hover:bg-[#EAF0E7] flex items-center justify-center text-[#5C6B5A] hover:text-[#172016] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vehicle Mini Capsule */}
        <div className="flex items-center gap-3 bg-[#F8FAF7] border border-[#E8EFE5] p-3 rounded-2xl">
          <div className="relative w-16 h-12 bg-white rounded-xl overflow-hidden shrink-0 border border-[#E8EFE5]">
            <Image
              src={activePass.carImage}
              alt={activePass.carName}
              fill
              className="object-contain p-1"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-[#172016] truncate">
              {activePass.carName}
            </h4>
            <p className="text-xs text-[#5C6B5A]">
              Reg: <strong className="font-mono text-[#172016]">{activePass.registrationNumber}</strong> • {activePass.pickupLocation}
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in zoom-in-95">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-emerald-950">Rental Extended!</h4>
            <p className="text-xs text-emerald-800">{successMessage}</p>
          </div>
        ) : (
          <>
            {/* Current vs New Return Date */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F8FAF7] p-3 rounded-xl border border-[#E8EFE5]">
                <span className="text-[10px] uppercase font-bold text-[#829280] block">
                  Current Return Date
                </span>
                <span className="font-semibold text-[#172016] text-xs sm:text-sm mt-0.5 block">
                  {formatDate(activePass.returnDate)}
                </span>
                <span className="text-[10px] text-[#5C6B5A] block mt-0.5 font-mono">
                  {activePass.returnTime}
                </span>
              </div>

              <div className="bg-[#EAF0E7] p-3 rounded-xl border border-[#CAD8C6]">
                <span className="text-[10px] uppercase font-bold text-[#50644E] block">
                  New Extended Return
                </span>
                <span className="font-bold text-[#172016] text-xs sm:text-sm mt-0.5 block">
                  {formatDate(newReturnDateStr)}
                </span>
                <span className="text-[10px] text-[#3D4F3B] block mt-0.5 font-mono">
                  {activePass.returnTime} (+{additionalDays}d)
                </span>
              </div>
            </div>

            {/* Quick Extension Selector */}
            <div>
              <label className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider block mb-1.5">
                Select Additional Days
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setAdditionalDays(d)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border ${
                      additionalDays === d
                        ? "bg-[#50644E] text-white border-[#50644E] shadow-2xs"
                        : "bg-[#F8FAF7] text-[#172016] border-[#DFE6DC] hover:border-[#CAD8C6]"
                    }`}
                  >
                    <span>+{d} {d === 1 ? "Day" : "Days"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 bg-[#F8FAF7] p-3.5 rounded-2xl border border-[#E8EFE5] text-xs">
              <div className="flex justify-between text-[#5C6B5A]">
                <span>Vehicle Pro-Rata ({additionalDays}d × {formatINR(estimatedDailyBase)}):</span>
                <span>{formatINR(estimatedDailyBase * additionalDays)}</span>
              </div>
              {dailyProtection > 0 && (
                <div className="flex justify-between text-[#5C6B5A]">
                  <span>{activePass.protectionPlanName} ({additionalDays}d):</span>
                  <span>{formatINR(dailyProtection * additionalDays)}</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>Modification &amp; Reschedule Fee:</span>
                <span>₹0 (Waived)</span>
              </div>
              <div className="pt-2 border-t border-[#E8EFE5] flex justify-between text-sm">
                <strong className="text-[#172016]">Total Additional Payable:</strong>
                <strong className="text-base text-[#172016] font-mono">
                  {formatINR(additionalPayableINR)}
                </strong>
              </div>
            </div>

            {/* Homie Fair Extension Guarantee */}
            <div className="p-2.5 bg-[#F3F7F2] rounded-xl border border-[#D5E1D1] flex items-center gap-2 text-[11px] text-[#3D4F3B]">
              <Sparkles className="w-4 h-4 text-[#50644E] shrink-0" />
              <span>
                Zero penalty guarantee: Daily rates remain locked at your initial booking tier with seamless FASTag expressway continuity.
              </span>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Actions */}
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
                disabled={isSubmitting}
                onClick={handleConfirmExtension}
                className="flex-1 py-3 px-4 rounded-full bg-[#50644E] hover:bg-[#3F503D] active:scale-[0.99] text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Confirming Extension...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Extension ({formatINR(additionalPayableINR)})</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
