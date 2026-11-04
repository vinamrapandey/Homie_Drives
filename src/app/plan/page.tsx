"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TripsTab } from "@/components/plan/TripsTab";
import { CarsTab } from "@/components/plan/CarsTab";
import { RegionalMapTab } from "@/components/plan/RegionalMapTab";
import { Compass, Car, MapPin } from "lucide-react";

function PlanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const currentTab: "trips" | "map" | "cars" =
    tabParam === "cars" ? "cars" : tabParam === "map" ? "map" : "trips";

  const handleTabChange = (tab: "trips" | "map" | "cars") => {
    router.replace(`/plan?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-28 md:pb-12 space-y-6">
      {/* Top Editorial Header matching Mobbin Ro Screen 3 */}
      <div className="relative pt-6 pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E2EDE0]/70 via-[#F3F6F1] to-transparent">
        <div className="max-w-3xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#50644E] bg-white/80 px-2.5 py-1 rounded-full border border-[#D5E2D1] shadow-2xs inline-block mb-3">
            Delhi NCR Planner
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#172016] tracking-tight leading-[1.05]">
            Let&apos;s take care of your journey
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6B5A] mt-2.5 max-w-xl leading-relaxed">
            This is your space to curate regional highway getaways, explore interactive handover stations, compare 3-tier vehicle condition rates, and coordinate seamless hub pickups.
          </p>
        </div>
      </div>

      {/* Three Nested Tabs matching Ro pill switcher */}
      <div className="flex items-center justify-start border-b border-[#E1E8DF] pb-3 overflow-x-auto no-scrollbar">
        <div className="inline-flex p-1 bg-white border border-[#DFE6DC] rounded-full shadow-2xs">
          <button
            type="button"
            onClick={() => handleTabChange("trips")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === "trips"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016]"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Curated Trips</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("map")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === "map"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016]"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Regional Map &amp; Hubs</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("cars")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === "cars"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016]"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Fleet &amp; Conditions</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {currentTab === "trips" ? (
          <TripsTab />
        ) : currentTab === "map" ? (
          <RegionalMapTab />
        ) : (
          <CarsTab />
        )}
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#5C6B5A]">Loading Plan...</div>}>
      <PlanContent />
    </Suspense>
  );
}
