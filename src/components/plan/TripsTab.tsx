"use client";

import React, { useState } from "react";
import { POPULAR_ROAD_TRIPS } from "@/data/trips";
import { DELHI_NCR_LOCATIONS } from "@/data/locations";
import { RoadTripPlan } from "@/types/booking";
import {
  Compass,
  MapPin,
  Calendar,
  Navigation,
  ArrowRight,
  Info,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export const TripsTab: React.FC = () => {
  const [startHub, setStartHub] = useState(DELHI_NCR_LOCATIONS[0].name);
  const [destinationInput, setDestinationInput] = useState("Jaipur, Rajasthan");
  const [startDate, setStartDate] = useState("2026-11-15");
  const [endDate, setEndDate] = useState("2026-11-18");
  const [plannedRoute, setPlannedRoute] = useState<RoadTripPlan | null>(
    POPULAR_ROAD_TRIPS[0]
  );

  const handleCalculateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    // Find matching route or fallback
    const matched = POPULAR_ROAD_TRIPS.find((t) =>
      destinationInput.toLowerCase().includes(t.destination.toLowerCase().split(",")[0])
    ) || POPULAR_ROAD_TRIPS[0];
    setPlannedRoute(matched);
  };

  return (
    <div className="space-y-6">
      {/* Trip Planner Header Card */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E8EFE5] shadow-homie">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#EAF0E7] text-[#50644E] flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#50644E]">
            Delhi NCR Road Trip Planner
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-[#172016] tracking-tight">
          Design your perfect getaway from Delhi NCR
        </h2>
        <p className="text-xs text-[#5C6B5A] mt-1 max-w-xl">
          Enter your starting point in Delhi NCR and your getaway destination. Homie Drives will suggest ideal vehicles and route insights.
        </p>

        {/* Input Form */}
        <form onSubmit={handleCalculateTrip} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Starting Hub */}
            <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5">
              <label className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#50644E]" />
                Starting Point (Delhi NCR)
              </label>
              <select
                value={startHub}
                onChange={(e) => setStartHub(e.target.value)}
                className="w-full bg-transparent font-bold text-sm text-[#172016] focus:outline-none cursor-pointer"
              >
                {DELHI_NCR_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5">
              <label className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Navigation className="w-3.5 h-3.5 text-[#50644E]" />
                Destination Getaway
              </label>
              <select
                value={destinationInput}
                onChange={(e) => {
                  setDestinationInput(e.target.value);
                  const matched = POPULAR_ROAD_TRIPS.find(
                    (t) => t.destination === e.target.value
                  );
                  if (matched) setPlannedRoute(matched);
                }}
                className="w-full bg-transparent font-bold text-sm text-[#172016] focus:outline-none cursor-pointer"
              >
                {POPULAR_ROAD_TRIPS.map((trip) => (
                  <option key={trip.id} value={trip.destination}>
                    {trip.destination} ({trip.distanceKm} km approx)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5">
              <label className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#50644E]" />
                Trip Departure Date
              </label>
              <input
                type="date"
                value={startDate}
                min="2026-11-01"
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent font-bold text-sm text-[#172016] focus:outline-none"
              />
            </div>

            <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5">
              <label className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#50644E]" />
                Trip Return Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-transparent font-bold text-sm text-[#172016] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#50644E] hover:bg-[#3F503D] text-white font-bold text-sm py-3.5 px-8 rounded-full transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Plan This Road Trip</span>
            </button>
          </div>
        </form>
      </div>

      {/* Route Calculation Summary (Prototype view) */}
      {plannedRoute && (
        <div className="bg-[#EAF0E7] border border-[#D4E0D1] rounded-[28px] p-6 sm:p-7 text-[#172016]">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#50644E]" />
              <h3 className="font-extrabold text-lg text-[#172016]">
                Route Preview: {startHub.split(" ")[0]} to {plannedRoute.destination}
              </h3>
            </div>
            <span className="text-xs bg-white text-[#50644E] font-bold px-3 py-1 rounded-full shadow-sm">
              Suggested: {plannedRoute.suggestedDuration}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
            <div className="bg-white rounded-2xl p-3.5 border border-[#DFE6DC] shadow-sm">
              <span className="text-[11px] text-[#5C6B5A] block">Approx. Distance</span>
              <strong className="text-lg text-[#172016] font-extrabold">
                {plannedRoute.distanceKm} km (one-way)
              </strong>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-[#DFE6DC] shadow-sm">
              <span className="text-[11px] text-[#5C6B5A] block">Est. Driving Time</span>
              <strong className="text-lg text-[#172016] font-extrabold">
                {plannedRoute.estimatedDriveTime.split(" (")[0]}
              </strong>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-[#DFE6DC] shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[11px] text-[#5C6B5A] block">Recommended Category</span>
              <strong className="text-sm text-[#50644E] font-bold block truncate">
                {plannedRoute.recommendedCarCategory}
              </strong>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white/80 rounded-2xl p-4 border border-[#DFE6DC] mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6B5A] mb-2">
              Route Highlights & Highway Tips
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#172016]">
              {plannedRoute.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#50644E] shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explicit Phase 1 Disclaimer as mandated by Prompt */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] p-4 rounded-2xl flex items-start gap-2.5 text-xs text-[#92400E]">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">Next Phase Roadmap:</strong> Route distances and drive times shown are standard regional estimates. Dynamic route calculations, toll estimators, live fuel requirements, and total estimated trip costs will be integrated with our Delhi NCR mapping engine in a subsequent release.
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end">
            <Link
              href="/plan?tab=cars"
              className="inline-flex items-center gap-2 bg-[#50644E] hover:bg-[#3F503D] text-white text-xs font-bold py-3 px-6 rounded-full transition-colors shadow-sm"
            >
              <span>Match Fleet For This Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Popular Road Trips Gallery */}
      <div>
        <h3 className="text-base font-bold text-[#172016] mb-3">
          Popular Getaways from Delhi NCR
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {POPULAR_ROAD_TRIPS.map((trip) => (
            <button
              key={trip.id}
              type="button"
              onClick={() => {
                setDestinationInput(trip.destination);
                setPlannedRoute(trip);
              }}
              className="text-left bg-white rounded-2xl p-4 border border-[#E8EFE5] shadow-sm hover:shadow-homie hover:border-[#50644E] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-[#50644E] bg-[#EAF0E7] px-2 py-0.5 rounded-full">
                  {trip.state}
                </span>
                <span className="text-[11px] font-semibold text-[#829280]">
                  {trip.distanceKm} km
                </span>
              </div>
              <h4 className="font-bold text-sm text-[#172016] group-hover:text-[#50644E] transition-colors">
                {trip.destination}
              </h4>
              <p className="text-[11px] text-[#5C6B5A] mt-1 line-clamp-2">
                {trip.estimatedDriveTime}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
