"use client";

import React, { useState, useEffect } from "react";
import { Info, X } from "lucide-react";

export const DisclaimerBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("homie_disclaimer_dismissed") === "true") {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("homie_disclaimer_dismissed", "true");
  };

  if (isDismissed) return null;

  return (
    <aside
      aria-label="Demo notice"
      className="bg-[#E7EFE4] border-b border-[#D8E4D4] py-1 px-3 text-[11px] sm:text-xs text-[#3D4F3B] transition-all print:hidden"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Info className="w-3.5 h-3.5 shrink-0 text-[#50644E]" />
          <span className="truncate sm:whitespace-normal">
            <strong className="font-semibold">Delhi NCR Fleet:</strong> Verified vehicle access from ₹2,499/day. Same-hub pickup & return.
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden md:inline-block text-[10px] font-medium text-[#50644E] bg-white/70 px-2 py-0.5 rounded-full">
            Phase 2 Active
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-5 h-5 rounded-full hover:bg-black/5 flex items-center justify-center text-[#50644E] transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};
