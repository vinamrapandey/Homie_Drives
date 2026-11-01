"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useHubLocations } from "@/lib/supabase/fleet";
import { MapPin, Calendar, Clock, Search, Sparkles, Compass } from "lucide-react";

interface SearchPanelProps {
  onSearch?: (criteria: {
    locationId: string;
    pickupDate: string;
    returnDate: string;
    rentalType: "daily" | "long-term";
  }) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  onSearch,
}) => {
  const router = useRouter();
  const { hubs } = useHubLocations();
  const [locationId, setLocationId] = useState(hubs[0]?.id || "delhi-aerocity");
  const [pickupDate, setPickupDate] = useState<string>("2026-11-15");
  const [returnDate, setReturnDate] = useState<string>("2026-11-18");
  const [rentalType, setRentalType] = useState<"daily" | "long-term">("daily");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ locationId, pickupDate, returnDate, rentalType });
    } else {
      router.push(`/ride?location=${locationId}&from=${pickupDate}&to=${returnDate}&type=${rentalType}`);
    }
  };

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-7 shadow-homie border border-[#E8EFE5] w-full">
      {/* Tab Switcher: Everyday Daily / Weekend vs Long-term flexible */}
      <div className="flex items-center justify-between gap-2 mb-5 pb-4 border-b border-[#F0F4ED]">
        <div className="inline-flex p-1 bg-[#F3F6F1] rounded-2xl">
          <button
            type="button"
            onClick={() => setRentalType("daily")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              rentalType === "daily"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016]"
            }`}
          >
            Everyday / Weekend (1–7 Days)
          </button>
          <button
            type="button"
            onClick={() => setRentalType("long-term")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              rentalType === "long-term"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016]"
            }`}
          >
            Long-Term (1–6 Months)
          </button>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#50644E] bg-[#EAF0E7] px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3" />
          <span>Same Pickup & Return Hub</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Location Hub */}
          <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5 focus-within:ring-2 focus-within:ring-[#50644E]/30 transition-all">
            <label className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#50644E]" />
              Delhi NCR Pickup Hub
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full bg-transparent font-bold text-sm text-[#172016] focus:outline-none cursor-pointer"
            >
              {hubs.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.area})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-[#829280] mt-0.5">
              Return to same hub
            </p>
          </div>

          {/* Pickup Date */}
          <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5 focus-within:ring-2 focus-within:ring-[#50644E]/30 transition-all">
            <label className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#50644E]" />
              Pickup Date & Time
            </label>
            <input
              type="date"
              value={pickupDate}
              min="2026-11-01"
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-transparent font-bold text-sm text-[#172016] focus:outline-none cursor-pointer"
            />
            <p className="text-[10px] text-[#829280] mt-0.5">
              From 10:00 AM onwards
            </p>
          </div>

          {/* Return Date */}
          <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5 focus-within:ring-2 focus-within:ring-[#50644E]/30 transition-all">
            <label className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#50644E]" />
              Return Date
            </label>
            <input
              type="date"
              value={returnDate}
              min={pickupDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-transparent font-bold text-sm text-[#172016] focus:outline-none cursor-pointer"
            />
            <p className="text-[10px] text-[#829280] mt-0.5">
              {rentalType === "long-term" ? "30+ days monthly rate" : "Flexible dropoff window"}
            </p>
          </div>
        </div>

        {/* Dual Actions: Explore Fleet vs Plan a Trip */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            className="w-full sm:flex-1 bg-[#50644E] hover:bg-[#3F503D] active:scale-[0.99] text-white font-bold text-sm py-4 px-6 rounded-full transition-all duration-200 shadow-homie flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Explore Delhi NCR Cars</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/plan?tab=trips")}
            className="w-full sm:w-auto bg-[#D4E0D1] hover:bg-[#C5D5C1] active:scale-[0.99] text-[#172016] font-bold text-sm py-4 px-6 rounded-full transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Compass className="w-4 h-4 text-[#50644E]" />
            <span>Plan Road Trip</span>
          </button>
        </div>
      </form>
    </div>
  );
};
