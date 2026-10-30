"use client";

import React from "react";
import { VehicleConditionOption, VehicleConditionTier } from "@/types/car";
import { Sparkles, ShieldCheck, Compass, CheckCircle2, Info } from "lucide-react";

interface CarConditionSelectorProps {
  options: VehicleConditionOption[];
  selectedTier: VehicleConditionTier;
  onSelectTier: (tier: VehicleConditionTier) => void;
  baseDailyRate: number;
}

export const CarConditionSelector: React.FC<CarConditionSelectorProps> = ({
  options,
  selectedTier,
  onSelectTier,
  baseDailyRate,
}) => {
  const getIcon = (tier: VehicleConditionTier) => {
    switch (tier) {
      case "pristine":
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case "mint":
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case "touring":
        return <Compass className="w-4 h-4 text-blue-600" />;
    }
  };

  const getDeltaBadge = (multiplier: number) => {
    if (multiplier > 1.0) {
      const pct = Math.round((multiplier - 1.0) * 100);
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          +{pct}% Premium
        </span>
      );
    }
    if (multiplier < 1.0) {
      const pct = Math.round((1.0 - multiplier) * 100);
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          Save {pct}%
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
        Standard Fleet
      </span>
    );
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-[#172016]">
            Select Vehicle Condition Grade
          </h3>
          <p className="text-xs text-[#5C6B5A]">
            Choose mileage tier & finish — pricing adjusts dynamically
          </p>
        </div>
        <span className="text-[11px] font-semibold text-[#50644E] bg-[#EAF0E7] px-2.5 py-0.5 rounded-full hidden sm:inline-block">
          Certified Inspection
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5" role="radiogroup" aria-label="Vehicle Condition Tier">
        {options.map((opt) => {
          const isSelected = opt.tier === selectedTier;
          const adjustedRate = Math.round(baseDailyRate * opt.priceMultiplier);

          return (
            <div
              key={opt.tier}
              onClick={() => onSelectTier(opt.tier)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  onSelectTier(opt.tier);
                }
              }}
              className={`relative rounded-2xl p-3.5 transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
                isSelected
                  ? "bg-[#F5F8F4] border-[#50644E] shadow-sm ring-1 ring-[#50644E]/30 scale-[1.01]"
                  : "bg-white border-[#E1E8DF] hover:border-[#CBD8C8] hover:bg-[#FAFBF9]"
              }`}
            >
              {/* Top Row: Icon, Title, and Delta Badge */}
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {getIcon(opt.tier)}
                    <span className="font-bold text-sm text-[#172016]">
                      {opt.label}
                    </span>
                  </div>
                  {getDeltaBadge(opt.priceMultiplier)}
                </div>

                {/* Odometer Bracket & Inspection Tag */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#5C6B5A] mb-2 font-medium">
                  <span className="bg-[#EAEFE8] px-1.5 py-0.5 rounded text-[#2E3D2C] font-semibold">
                    {opt.odometerRange}
                  </span>
                  <span>•</span>
                  <span>{opt.inspectionStatus}</span>
                </div>

                {/* Cosmetic Details Description */}
                <p className="text-[11px] text-[#5C6B5A] leading-relaxed mb-3">
                  {opt.cosmeticDescription}
                </p>
              </div>

              {/* Bottom Row: Calculated Daily Price for this tier */}
              <div className="pt-2 border-t border-[#E8EFE5] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#829280]">Daily Rate:</span>
                  <p className="font-black text-sm text-[#172016]">
                    ₹{adjustedRate.toLocaleString("en-IN")}{" "}
                    <span className="text-[10px] font-normal text-[#829280]">/ day</span>
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-[#50644E] border-[#50644E] text-white"
                      : "border-[#DFE6DC] bg-white"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-[#829280] mt-2 flex items-center gap-1">
        <Info className="w-3 h-3 text-[#50644E] shrink-0" />
        <span>Pre-trip condition certificate digitally logged during agent handover.</span>
      </p>
    </div>
  );
};
