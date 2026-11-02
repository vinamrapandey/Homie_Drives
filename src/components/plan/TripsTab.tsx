"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { POPULAR_ROAD_TRIPS } from "@/data/trips";
import { DELHI_NCR_LOCATIONS } from "@/data/locations";
import { DEMO_CARS } from "@/data/cars";
import { RoadTripPlan, RoadTripPitstop } from "@/types/booking";
import { Car } from "@/types/car";
import { formatINR, calculateRentalDays } from "@/lib/formatters";
import { ReservationModal } from "@/components/booking/ReservationModal";
import { HighwayRouteMap } from "./HighwayRouteMap";
import {
  Compass,
  MapPin,
  Calendar,
  Navigation,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Zap,
  Fuel,
  Gauge,
  Clock,
  CreditCard,
  Check,
  ShieldCheck,
  Utensils,
  Camera,
} from "lucide-react";

type PitstopCategoryFilter = "all" | "food" | "ev-charging" | "fuel" | "rest";

export const TripsTab: React.FC = () => {
  // Trip Selection & Config State
  const [selectedTripId, setSelectedTripId] = useState<string>(POPULAR_ROAD_TRIPS[0].id);
  const [startHub, setStartHub] = useState<string>(DELHI_NCR_LOCATIONS[0].name);
  const [journeyType, setJourneyType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [startDate, setStartDate] = useState<string>("2026-11-15");
  const [endDate, setEndDate] = useState<string>("2026-11-18");

  // Pitstop filter state
  const [pitstopFilter, setPitstopFilter] = useState<PitstopCategoryFilter>("all");

  // Reservation Modal trigger state
  const [selectedCarForModal, setSelectedCarForModal] = useState<Car | null>(null);

  // Active Road Trip Object
  const activeTrip: RoadTripPlan = useMemo(() => {
    return (
      POPULAR_ROAD_TRIPS.find((t) => t.id === selectedTripId) ||
      POPULAR_ROAD_TRIPS[0]
    );
  }, [selectedTripId]);

  // Matched Car from Fleet
  const matchedCar: Car = useMemo(() => {
    if (activeTrip.matchedCarSlug) {
      const found = DEMO_CARS.find((c) => c.slug === activeTrip.matchedCarSlug);
      if (found) return found;
    }
    return DEMO_CARS[0];
  }, [activeTrip]);

  // Selected Hub Object
  const selectedHubObj = useMemo(() => {
    return (
      DELHI_NCR_LOCATIONS.find((loc) => loc.name === startHub) ||
      DELHI_NCR_LOCATIONS[0]
    );
  }, [startHub]);

  // Duration in days
  const rentalDays = useMemo(() => {
    return Math.max(1, calculateRentalDays(startDate, endDate));
  }, [startDate, endDate]);

  // Cost calculations
  const totalToll = journeyType === "roundtrip"
    ? (activeTrip.returnTollINR || (activeTrip.oneWayTollINR || 0) * 2)
    : (activeTrip.oneWayTollINR || 0);

  const estimatedFuelCost = journeyType === "roundtrip"
    ? (activeTrip.estFuelOrChargeCostINR || 2500) * 1.8
    : (activeTrip.estFuelOrChargeCostINR || 2500);

  const carRentalCost = matchedCar.dailyPriceINR * rentalDays;
  const grandEstimatedBudget = carRentalCost + totalToll + estimatedFuelCost;

  // Filtered pitstops
  const filteredPitstops: RoadTripPitstop[] = useMemo(() => {
    const stops = activeTrip.pitstops || [];
    if (pitstopFilter === "all") return stops;
    return stops.filter((s) => s.type === pitstopFilter);
  }, [activeTrip, pitstopFilter]);

  return (
    <div className="space-y-7">
      {/* ===================================================================
          1. Interactive Route & Getaway Configurator Card
          =================================================================== */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E1E8DF] shadow-homie">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF0E7] text-[#50644E] flex items-center justify-center shadow-2xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#50644E] block">
                Delhi NCR Road Trip Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#172016] tracking-tight">
                Curate Your Highway Getaway
              </h2>
            </div>
          </div>

          {/* Journey Mode Switcher (Round Trip vs One-Way) */}
          <div className="inline-flex p-1 bg-[#F3F6F1] border border-[#DFE6DC] rounded-full shadow-2xs text-xs">
            <button
              type="button"
              onClick={() => setJourneyType("roundtrip")}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                journeyType === "roundtrip"
                  ? "bg-[#50644E] text-white shadow-xs"
                  : "text-[#5C6B5A] hover:text-[#172016]"
              }`}
            >
              Round-Trip Return
            </button>
            <button
              type="button"
              onClick={() => setJourneyType("oneway")}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                journeyType === "oneway"
                  ? "bg-[#50644E] text-white shadow-xs"
                  : "text-[#5C6B5A] hover:text-[#172016]"
              }`}
            >
              One-Way Transit
            </button>
          </div>
        </div>

        {/* Route Selectors & Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Starting Hub */}
          <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5 hover:border-[#50644E]/40 transition-colors">
            <label className="text-[10px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#50644E]" />
              Delhi NCR Pickup Hub
            </label>
            <select
              value={startHub}
              onChange={(e) => setStartHub(e.target.value)}
              className="w-full bg-transparent font-bold text-xs sm:text-sm text-[#172016] focus:outline-none cursor-pointer"
            >
              {DELHI_NCR_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-[#829280] block mt-1">
              FASTag pre-checked at hub
            </span>
          </div>

          {/* Destination Getaway */}
          <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5 hover:border-[#50644E]/40 transition-colors">
            <label className="text-[10px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Navigation className="w-3.5 h-3.5 text-[#50644E]" />
              Getaway Destination
            </label>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="w-full bg-transparent font-bold text-xs sm:text-sm text-[#172016] focus:outline-none cursor-pointer"
            >
              {POPULAR_ROAD_TRIPS.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.destination} ({trip.distanceKm} km)
                </option>
              ))}
            </select>
            <span className="text-[10px] text-[#829280] block mt-1">
              Via {activeTrip.expresswayName?.split(" (")[0] || "Expressway"}
            </span>
          </div>

          {/* Departure Date */}
          <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5 hover:border-[#50644E]/40 transition-colors">
            <label className="text-[10px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#50644E]" />
              Trip Departure Date
            </label>
            <input
              type="date"
              value={startDate}
              min="2026-11-01"
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent font-bold text-xs sm:text-sm text-[#172016] focus:outline-none"
            />
            <span className="text-[10px] text-[#829280] block mt-1">
              Pickup from 09:00 AM
            </span>
          </div>

          {/* Return Date */}
          <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-3.5 hover:border-[#50644E]/40 transition-colors">
            <label className="text-[10px] font-bold text-[#5C6B5A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#50644E]" />
              Trip Return Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-transparent font-bold text-xs sm:text-sm text-[#172016] focus:outline-none"
            />
            <span className="text-[10px] text-[#50644E] font-bold block mt-1">
              {rentalDays} {rentalDays === 1 ? "Day" : "Days"} Rental Duration
            </span>
          </div>
        </div>

        {/* Popular Getaways Quick Carousel Pills */}
        <div className="mt-5 pt-4 border-t border-[#F0F4ED]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#829280] block mb-2.5">
            Quick Route Switcher:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {POPULAR_ROAD_TRIPS.map((trip) => {
              const isSelected = trip.id === selectedTripId;
              return (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => setSelectedTripId(trip.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? "bg-[#50644E] text-white border-[#50644E] shadow-xs"
                      : "bg-[#F8FAF7] text-[#5C6B5A] border-[#E8EFE5] hover:border-[#D0DED0] hover:text-[#172016]"
                  }`}
                >
                  <span>{trip.destination.split(",")[0]}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[#EAF0E7] text-[#50644E]"
                    }`}
                  >
                    {trip.distanceKm} km
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. Interactive Highway Getaway Map & Route Direction Engine
          =================================================================== */}
      <HighwayRouteMap
        trip={activeTrip}
        startingHub={selectedHubObj}
        journeyType={journeyType}
        onSelectTrip={(id) => setSelectedTripId(id)}
      />

      {/* ===================================================================
          3. Corridor Telematics & Live Highway Advisory Ribbon
          =================================================================== */}
      <div className="bg-[#172016] text-white rounded-[28px] p-5 sm:p-6 shadow-homie border border-[#2D3A2B] relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A2BA9F]">
                Corridor Telematics • Verified Route
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              {activeTrip.expresswayName || "National Highway Corridor"}
            </h3>
            <p className="text-xs text-white/70 mt-0.5">
              {startHub} → {activeTrip.destination} • {journeyType === "roundtrip" ? `${activeTrip.distanceKm * 2} km Roundtrip` : `${activeTrip.distanceKm} km One-Way`}
            </p>
          </div>

          {/* Highway Stats Badge Group */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-white/60 block leading-tight">Speed Limit</span>
                <strong className="text-white font-bold">{activeTrip.speedLimitKmh || 100} km/h</strong>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-white/60 block leading-tight">Est. Drive Time</span>
                <strong className="text-white font-bold">{activeTrip.estimatedDriveTime}</strong>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-white/60 block leading-tight">RSA Patrol</span>
                <strong className="text-white font-bold">24x7 Active</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          3. Live Expressway Toll & Highway Budget Calculator
          =================================================================== */}
      <div className="bg-[#EAF0E7] border border-[#D2E2CF] rounded-[32px] p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#50644E]" />
            <h3 className="font-black text-lg text-[#172016]">
              Expressway Toll &amp; Journey Budget Breakdown
            </h3>
          </div>
          <span className="text-xs bg-white text-[#50644E] font-bold px-3 py-1 rounded-full border border-[#D2E2CF] shadow-2xs">
            FASTag Electronic Auto-Deduct
          </span>
        </div>

        {/* 4-Column Metric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-3">
          {/* Toll Cost Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#DFE6DC] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider">
                FASTag Toll
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                100% ETC
              </span>
            </div>
            <strong className="text-xl sm:text-2xl text-[#172016] font-black block">
              {formatINR(totalToll)}
            </strong>
            <span className="text-[10px] text-[#829280] mt-1 block">
              {journeyType === "roundtrip" ? "Round-trip FASTag fee" : "One-way expressway fee"}
            </span>
          </div>

          {/* Fuel / Energy Cost */}
          <div className="bg-white rounded-2xl p-4 border border-[#DFE6DC] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider">
                Fuel / EV Energy
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                Est. Metric
              </span>
            </div>
            <strong className="text-xl sm:text-2xl text-[#172016] font-black block">
              {formatINR(Math.round(estimatedFuelCost))}
            </strong>
            <span className="text-[10px] text-[#829280] mt-1 block">
              Based on {matchedCar.specs.fuelType} efficiency
            </span>
          </div>

          {/* Car Rental Base */}
          <div className="bg-white rounded-2xl p-4 border border-[#DFE6DC] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#5C6B5A] uppercase tracking-wider">
                Vehicle Hire
              </span>
              <span className="text-[10px] bg-[#EAF0E7] text-[#50644E] font-bold px-1.5 py-0.2 rounded">
                {rentalDays} {rentalDays === 1 ? "day" : "days"}
              </span>
            </div>
            <strong className="text-xl sm:text-2xl text-[#172016] font-black block">
              {formatINR(carRentalCost)}
            </strong>
            <span className="text-[10px] text-[#829280] mt-1 block truncate">
              {matchedCar.name.split(" ")[0]} ({formatINR(matchedCar.dailyPriceINR)}/d)
            </span>
          </div>

          {/* Total Highway Budget */}
          <div className="bg-[#172016] text-white rounded-2xl p-4 border border-[#2D3A2B] shadow-xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#A2BA9F] uppercase tracking-wider">
                Total Highway Budget
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <strong className="text-xl sm:text-2xl text-white font-black block">
              {formatINR(Math.round(grandEstimatedBudget))}
            </strong>
            <span className="text-[10px] text-white/60 mt-1 block">
              Hire + Tolls + Highway Fuel
            </span>
          </div>
        </div>

        {/* FASTag Benefit Banner */}
        <div className="bg-white/90 rounded-2xl p-3.5 border border-[#DFE6DC] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#172016]">
            <CheckCircle className="w-4 h-4 text-[#50644E] shrink-0" />
            <span>
              <strong>Zero Toll Plaza Stopping:</strong> Every Homie Drives fleet vehicle comes pre-fitted with a valid Delhi FASTag. Toll deductions pass directly without manual cash handling.
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#50644E] underline decoration-dotted">
            Auto-reconciled on rental pass
          </span>
        </div>
      </div>

      {/* ===================================================================
          4. Matched Fleet Recommendation with 1-Click Instant Booking
          =================================================================== */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E1E8DF] shadow-homie">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#50644E] block">
              Route-Optimized Recommendation
            </span>
            <h3 className="text-xl font-black text-[#172016]">
              Ideal Fleet Match for {activeTrip.destination.split(",")[0]}
            </h3>
          </div>
          <span className="text-xs font-bold text-[#5C6B5A] bg-[#F8FAF7] px-3 py-1.5 rounded-full border border-[#E8EFE5]">
            Target: {activeTrip.recommendedCarCategory}
          </span>
        </div>

        {/* Matched Car Spotlight Card */}
        <div className="bg-gradient-to-br from-[#F8FAF7] via-white to-[#F0F5EE] border border-[#E5EDE3] rounded-[26px] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Car Image Preview */}
          <div className="relative w-full md:w-72 h-44 bg-white rounded-2xl overflow-hidden shrink-0 border border-[#E8EFE5] p-2 flex items-center justify-center">
            <Image
              src={matchedCar.image}
              alt={matchedCar.name}
              fill
              className="object-contain p-2 hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute top-2.5 left-2.5 text-[10px] font-bold bg-[#172016] text-white px-2 py-0.5 rounded-md shadow-sm">
              {matchedCar.badgeTag}
            </span>
          </div>

          {/* Car Details */}
          <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
            <div>
              <span className="text-xs font-bold text-[#50644E] block">
                {matchedCar.brand} • {matchedCar.categoryLabel}
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-[#172016] tracking-tight">
                {matchedCar.name}
              </h4>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-[#5C6B5A]">
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#DFE6DC] font-medium flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-[#50644E]" />
                {matchedCar.specs.fuelType}
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#DFE6DC] font-medium flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-[#50644E]" />
                {matchedCar.specs.transmission}
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#DFE6DC] font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#50644E]" />
                {matchedCar.hubLocation}
              </span>
            </div>

            <p className="text-xs text-[#5C6B5A] max-w-md leading-relaxed">
              Equipped with highway cruise control, high-ground clearance, and pre-loaded FASTag. Certified 3-tier condition grades available for this model.
            </p>
          </div>

          {/* Pricing & 1-Click Booking CTA */}
          <div className="w-full md:w-auto shrink-0 flex flex-col items-center md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#E8EFE5]">
            <div className="text-center md:text-right">
              <span className="text-[10px] text-[#829280] uppercase tracking-wider block font-bold">
                Daily Rate (Executive Mint)
              </span>
              <div className="flex items-baseline justify-center md:justify-end gap-1">
                <span className="text-2xl sm:text-3xl font-black text-[#172016]">
                  {formatINR(matchedCar.dailyPriceINR)}
                </span>
                <span className="text-xs text-[#829280]">/ day</span>
              </div>
              <span className="text-[11px] text-[#50644E] font-semibold block">
                Total for {rentalDays} {rentalDays === 1 ? "day" : "days"}: {formatINR(matchedCar.dailyPriceINR * rentalDays)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedCarForModal(matchedCar)}
                className="w-full py-3.5 px-6 rounded-full bg-[#50644E] hover:bg-[#3F503D] active:scale-[0.99] text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book This Car for Route</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href={`/cars/${matchedCar.slug}`}
                className="w-full py-2.5 px-4 rounded-full border border-[#DFE6DC] hover:bg-[#F3F6F1] text-xs font-semibold text-[#5C6B5A] text-center transition-colors"
              >
                Inspect 360° Gallery &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          5. Curated Highway Pitstops & Waypoint Explorer
          =================================================================== */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E1E8DF] shadow-homie space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#50644E] block">
              En-Route Highway Waypoints
            </span>
            <h3 className="text-xl font-black text-[#172016]">
              Curated Pitstops along {activeTrip.destination.split(",")[0]} Route
            </h3>
          </div>

          {/* Pitstop Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setPitstopFilter("all")}
              className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                pitstopFilter === "all"
                  ? "bg-[#50644E] text-white"
                  : "bg-[#F3F6F1] text-[#5C6B5A] hover:text-[#172016]"
              }`}
            >
              All Stops
            </button>
            <button
              type="button"
              onClick={() => setPitstopFilter("food")}
              className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 ${
                pitstopFilter === "food"
                  ? "bg-[#50644E] text-white"
                  : "bg-[#F3F6F1] text-[#5C6B5A] hover:text-[#172016]"
              }`}
            >
              <Utensils className="w-3 h-3" />
              <span>Dining</span>
            </button>
            <button
              type="button"
              onClick={() => setPitstopFilter("ev-charging")}
              className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 ${
                pitstopFilter === "ev-charging"
                  ? "bg-[#50644E] text-white"
                  : "bg-[#F3F6F1] text-[#5C6B5A] hover:text-[#172016]"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>EV DC Fast</span>
            </button>
            <button
              type="button"
              onClick={() => setPitstopFilter("fuel")}
              className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 ${
                pitstopFilter === "fuel"
                  ? "bg-[#50644E] text-white"
                  : "bg-[#F3F6F1] text-[#5C6B5A] hover:text-[#172016]"
              }`}
            >
              <Fuel className="w-3 h-3" />
              <span>Fuel Stations</span>
            </button>
            <button
              type="button"
              onClick={() => setPitstopFilter("rest")}
              className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 ${
                pitstopFilter === "rest"
                  ? "bg-[#50644E] text-white"
                  : "bg-[#F3F6F1] text-[#5C6B5A] hover:text-[#172016]"
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Scenic Rest</span>
            </button>
          </div>
        </div>

        {/* Pitstop Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {filteredPitstops.map((stop, index) => {
            return (
              <div
                key={index}
                className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl p-4 hover:shadow-sm hover:border-[#50644E]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold bg-[#EAF0E7] text-[#50644E] px-2 py-0.5 rounded-md">
                      KM {stop.distanceKm}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        stop.type === "food"
                          ? "bg-amber-100 text-amber-900"
                          : stop.type === "ev-charging"
                          ? "bg-emerald-100 text-emerald-900"
                          : stop.type === "fuel"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-purple-100 text-purple-900"
                      }`}
                    >
                      {stop.type.replace("-", " ")}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#172016] mb-1">
                    {stop.name}
                  </h4>
                  <p className="text-[11px] text-[#829280] mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#50644E] shrink-0" />
                    <span className="truncate">{stop.location}</span>
                  </p>
                  <p className="text-xs text-[#5C6B5A] leading-relaxed">
                    {stop.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E8EFE5] flex items-center justify-between text-[10px] text-[#829280]">
                  <span>Verified Homie Stop</span>
                  <Check className="w-3.5 h-3.5 text-[#50644E]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================
          6. Route Highlights & Sightseeing Cards
          =================================================================== */}
      <div className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-[32px] p-6 sm:p-7">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6B5A] mb-3">
          Destination Highlights &amp; Sightseeing Checklist ({activeTrip.destination})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-[#172016]">
          {activeTrip.highlights.map((highlight, i) => (
            <div
              key={i}
              className="bg-white p-3.5 rounded-2xl border border-[#E8EFE5] flex items-start gap-2 shadow-2xs"
            >
              <CheckCircle className="w-4 h-4 text-[#50644E] shrink-0 mt-0.5" />
              <span className="leading-snug">{highlight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================
          7. Reservation Modal (1-Click Booking from Trip Planner)
          =================================================================== */}
      {selectedCarForModal && (
        <ReservationModal
          car={selectedCarForModal}
          pickupDate={startDate}
          returnDate={endDate}
          totalINR={selectedCarForModal.dailyPriceINR * rentalDays}
          planType="daily"
          conditionTier="mint"
          onClose={() => setSelectedCarForModal(null)}
        />
      )}
    </div>
  );
};
