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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#172016] tracking-tight">
          Ride & Bookings
        </h1>
        <p className="text-xs sm:text-sm text-[#5C6B5A] mt-1">
          Reserve vehicles by live hub availability or access your active digital passes.
        </p>
      </div>

      {/* Two Nested Tabs: Book & Pass */}
      <div className="flex items-center justify-start border-b border-[#E1E8DF] pb-3">
        <div className="inline-flex p-1 bg-white border border-[#DFE6DC] rounded-2xl shadow-sm">
          <button
            type="button"
            onClick={() => handleTabChange("book")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentTab === "book"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016]"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Book</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("pass")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentTab === "pass"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016]"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Pass</span>
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
