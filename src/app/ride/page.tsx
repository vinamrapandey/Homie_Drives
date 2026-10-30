"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookTab } from "@/components/ride/BookTab";
import { PassTab } from "@/components/ride/PassTab";
import { Car, Ticket } from "lucide-react";

function RideContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") === "pass" ? "pass" : "book";

  const handleTabChange = (tab: "book" | "pass") => {
    router.replace(`/ride?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Top Editorial Header matching Mobbin Ro Screen 3 */}
      <div className="relative pt-6 pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E2EDE0]/70 via-[#F3F6F1] to-transparent">
        <div className="max-w-3xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#50644E] bg-white/80 px-2.5 py-1 rounded-full border border-[#D5E2D1] shadow-2xs inline-block mb-3">
            Ride Dispatch & Passes
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#172016] tracking-tight leading-[1.05]">
            Your active drives &amp; passes
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6B5A] mt-2.5 max-w-xl leading-relaxed">
            Reserve vehicles by real-time hub availability, access your keyless pass code, and track pre-trip condition check walk-arounds.
          </p>
        </div>
      </div>

      {/* Two Nested Tabs: Book & Pass */}
      <div className="flex items-center justify-start border-b border-[#E1E8DF] pb-3">
        <div className="inline-flex p-1 bg-white border border-[#DFE6DC] rounded-full shadow-2xs">
          <button
            type="button"
            onClick={() => handleTabChange("book")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentTab === "book"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016]"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Fleet Availability</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("pass")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentTab === "pass"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016]"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Digital Passes</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {currentTab === "book" ? <BookTab /> : <PassTab />}
      </div>
    </div>
  );
}

export default function RidePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#5C6B5A]">Loading Ride...</div>}>
      <RideContent />
    </Suspense>
  );
}
