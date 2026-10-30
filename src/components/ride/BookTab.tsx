"use client";

import React, { useState } from "react";
import { DEMO_CARS } from "@/data/cars";
import { DELHI_NCR_LOCATIONS } from "@/data/locations";
import { Car } from "@/types/car";
import { CarCard } from "@/components/cars/CarCard";
import { CarDetailView } from "@/components/cars/CarDetailView";
import { MapPin, Calendar, Clock, CheckCircle2 } from "lucide-react";

export const BookTab: React.FC = () => {
  const [selectedHub, setSelectedHub] = useState(DELHI_NCR_LOCATIONS[0].id);
  const [pickupDate, setPickupDate] = useState("2026-11-15");
  const [returnDate, setReturnDate] = useState("2026-11-18");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const filteredCars = DEMO_CARS.filter((c) => {
    if (categoryFilter === "all") return true;
    return c.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Availability Search Bar */}
      <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-[#E8EFE5] shadow-homie">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-[#172016]">
              Instant Delhi NCR Availability
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#50644E] bg-[#EAF0E7] px-3 py-1 rounded-full">
            Sample Availability Mode
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Pickup & Return Location (Must be same) */}
          <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5">
            <label className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#50644E]" />
              Pickup & Return Hub
            </label>
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="w-full bg-transparent font-bold text-sm text-[#172016] focus:outline-none cursor-pointer"
            >
              {DELHI_NCR_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-[#829280] mt-0.5">
              Initial release: pickup and return at same hub
            </p>
          </div>

          {/* Pickup Date */}
          <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5">
            <label className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#50644E]" />
              Pickup Date
            </label>
            <input
              type="date"
              value={pickupDate}
              min="2026-11-01"
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-transparent font-bold text-sm text-[#172016] focus:outline-none"
            />
            <p className="text-[10px] text-[#829280] mt-0.5">
              Handover from 10:00 AM
            </p>
          </div>

          {/* Return Date */}
          <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5">
            <label className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#50644E]" />
              Return Date
            </label>
            <input
              type="date"
              value={returnDate}
              min={pickupDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-transparent font-bold text-sm text-[#172016] focus:outline-none"
            />
            <p className="text-[10px] text-[#829280] mt-0.5">
              Includes comprehensive insurance
            </p>
          </div>
        </div>

        {/* Category Quick Filter */}
        <div className="mt-4 pt-4 border-t border-[#F0F4ED] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-[#5C6B5A] shrink-0 mr-1">
            Category:
          </span>
          {[
            { id: "all", label: "All Fleet" },
            { id: "supercar", label: "Supercars" },
            { id: "performance-suv", label: "Performance SUVs" },
            { id: "luxury-sedan", label: "Executive Sedans" },
            { id: "city-ev", label: "City EVs" },
            { id: "touring-suv", label: "Touring 7-Seaters" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat.id
                  ? "bg-[#50644E] text-white shadow-sm"
                  : "bg-[#F3F6F1] text-[#5C6B5A] hover:bg-[#EAF0E7] hover:text-[#172016]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability Status Header */}
      <div className="flex items-center justify-between text-xs text-[#5C6B5A] px-1">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            Showing <strong className="text-[#172016]">{filteredCars.length}</strong> available fleet options for your selected dates
          </span>
        </div>
        <span className="text-[11px] text-[#829280] bg-white px-2.5 py-1 rounded-full border border-[#E8EFE5]">
          Full-to-Full Fuel Policy
        </span>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            onSelect={(selected) => setSelectedCar(selected)}
            showQuickBook={true}
          />
        ))}
      </div>

      {/* Car Detail Overlay Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full py-6">
            <CarDetailView
              car={selectedCar}
              onBack={() => setSelectedCar(null)}
              showBackLink={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
