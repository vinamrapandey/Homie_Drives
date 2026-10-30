import React from "react";
import { Info } from "lucide-react";

export const DisclaimerBanner: React.FC = () => {
  return (
    <aside aria-label="Demo notice" className="bg-[#E7EFE4] border-b border-[#D8E4D4] py-1.5 px-3 text-xs text-[#3D4F3B]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 text-[#50644E]" />
          <span>
            <strong className="font-semibold">Demo Prototype (Phase 1):</strong> All vehicle inventory, pricing (₹2,499–₹24,999), and availability for Delhi NCR are simulated for evaluation.
          </span>
        </div>
        <span className="hidden md:inline-block text-[11px] font-medium text-[#50644E] bg-white/70 px-2 py-0.5 rounded-full">
          Delhi NCR Edition
        </span>
      </div>
    </aside>
  );
};
