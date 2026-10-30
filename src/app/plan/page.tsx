"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TripsTab } from "@/components/plan/TripsTab";
import { CarsTab } from "@/components/plan/CarsTab";
import { Compass, Car } from "lucide-react";

function PlanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") === "cars" ? "cars" : "trips";

  const handleTabChange = (tab: "trips" | "cars") => {
    router.replace(`/plan?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#172016] tracking-tight">
          Plan Your Experience
        </h1>
        <p className="text-xs sm:text-sm text-[#5C6B5A] mt-1">
          Explore scenic highway itineraries or discover vehicles curated for Delhi NCR.
        </p>
      </div>

      {/* Two Nested Tabs matching requirements */}
      <div className="flex items-center justify-start border-b border-[#E1E8DF] pb-3">
        <div className="inline-flex p-1 bg-white border border-[#DFE6DC] rounded-2xl shadow-sm">
          <button
            type="button"
            onClick={() => handleTabChange("trips")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentTab === "trips"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016]"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Trips</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("cars")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentTab === "cars"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016]"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Cars</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {currentTab === "trips" ? <TripsTab /> : <CarsTab />}
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
