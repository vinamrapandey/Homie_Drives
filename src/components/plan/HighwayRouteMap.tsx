"use client";

import React, { useState } from "react";
import { RoadTripPlan } from "@/types/booking";
import { LocationHub } from "@/types/booking";
import {
  Navigation,
  ExternalLink,
  MapPin,
  Compass,
  Zap,
  Fuel,
  Gauge,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Info,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";

interface HighwayRouteMapProps {
  trip: RoadTripPlan;
  startingHub: LocationHub;
  journeyType: "roundtrip" | "oneway";
  onSelectTrip?: (tripId: string) => void;
}

// Approximate geo-coordinates for destinations from Delhi NCR
const DESTINATION_COORDINATES: Record<
  string,
  { lat: number; lng: number; city: string; state: string; label: string }
> = {
  "trip-jaipur": {
    lat: 26.9124,
    lng: 75.7873,
    city: "Jaipur",
    state: "Rajasthan",
    label: "Pink City Terminal",
  },
  "trip-agra": {
    lat: 27.1767,
    lng: 78.0081,
    city: "Agra",
    state: "Uttar Pradesh",
    label: "Taj Corridor Terminal",
  },
  "trip-rishikesh": {
    lat: 30.0869,
    lng: 78.2676,
    city: "Rishikesh",
    state: "Uttarakhand",
    label: "Ganga Foothills Terminal",
  },
  "trip-chandigarh": {
    lat: 30.7333,
    lng: 76.7794,
    city: "Chandigarh",
    state: "Punjab / Haryana",
    label: "City Beautiful Terminal",
  },
  "trip-neemrana": {
    lat: 27.9942,
    lng: 76.3884,
    city: "Neemrana",
    state: "Rajasthan",
    label: "Fort Palace Gateway",
  },
};

export const HighwayRouteMap: React.FC<HighwayRouteMapProps> = ({
  trip,
  startingHub,
  journeyType,
}) => {
  const [activeViewMode, setActiveViewMode] = useState<"route" | "ev-ice">("route");
  const destCoords =
    DESTINATION_COORDINATES[trip.id] || {
      lat: 27.1767,
      lng: 78.0081,
      city: trip.destination.split(",")[0],
      state: trip.state,
      label: "Highway Terminus",
    };

  const startLat = startingHub.latitude || 28.6836;
  const startLng = startingHub.longitude || 77.4445;

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destCoords.lat},${destCoords.lng}&travelmode=driving`;
  const appleMapsDirectionsUrl = `https://maps.apple.com/?saddr=${startLat},${startLng}&daddr=${destCoords.lat},${destCoords.lng}`;

  const multiplier = journeyType === "roundtrip" ? 2 : 1;
  const totalKm = trip.distanceKm * multiplier;

  // EV vs ICE Real Comparison Metrics for Indian Highways
  // Benchmarks: ICE Petrol @ ₹94.7/L, 13 km/L; EV @ ₹18/kWh at DC fast, 6.2 km/kWh
  const petrolLiters = (totalKm / 13).toFixed(1);
  const petrolCost = Math.round(Number(petrolLiters) * 94.7);

  const evKwh = (totalKm / 6.2).toFixed(1);
  const evCost = Math.round(Number(evKwh) * 18.5);

  const co2SavingsKg = Math.round(totalKm * 0.12);
  const fuelSavingsINR = Math.max(0, petrolCost - evCost);

  return (
    <div className="bg-[#172016] text-white rounded-[32px] p-6 sm:p-8 shadow-homie border border-[#2D3A2B] space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A2BA9F]">
              Live Highway Telematics &amp; Route Vector
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {startingHub.name} ➔ {trip.destination}
          </h3>
          <p className="text-xs text-white/60 mt-0.5">
            Via {trip.expresswayName || "National Highway"} •{" "}
            {journeyType === "roundtrip" ? `${totalKm} km (Round Trip)` : `${totalKm} km (One-Way)`}
          </p>
        </div>

        {/* View Mode Switcher: Route Map vs EV Cost Calculator */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-white/10 rounded-2xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveViewMode("route")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewMode === "route"
                  ? "bg-[#50644E] text-white shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Route Canvas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode("ev-ice")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewMode === "ev-ice"
                  ? "bg-[#50644E] text-white shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-300" />
              <span>EV vs Petrol</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Mode Content */}
      {activeViewMode === "route" ? (
        <div className="space-y-4">
          {/* Interactive SVG Highway Route Canvas */}
          <div className="relative bg-[#101710] rounded-[24px] border border-white/15 p-5 sm:p-6 overflow-hidden">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#50644E_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Route Map Header overlay */}
            <div className="relative z-10 flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs">
              <span className="font-mono text-white/60">
                VECTOR: [{startLat.toFixed(2)}, {startLng.toFixed(2)}] ➔ [{destCoords.lat.toFixed(2)}, {destCoords.lng.toFixed(2)}]
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 text-[10px]">
                FASTag NHAI Electronic Clearance Active
              </span>
            </div>

            {/* SVG Corridor Schematic */}
            <div className="relative z-10 h-44 sm:h-52 w-full flex items-center justify-center">
              <svg
                viewBox="0 0 600 180"
                className="w-full h-full max-w-2xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background highway glow line */}
                <path
                  d="M 60 90 Q 220 30, 360 110 T 540 90"
                  stroke="#50644E"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                {/* Main animated express path */}
                <path
                  d="M 60 90 Q 220 30, 360 110 T 540 90"
                  stroke="#4ADE80"
                  strokeWidth="3.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  className="animate-pulse"
                />

                {/* Waypoint 1: Origin Hub */}
                <circle cx="60" cy="90" r="14" fill="#172016" stroke="#4ADE80" strokeWidth="3" />
                <circle cx="60" cy="90" r="5" fill="#4ADE80" />
                <text x="60" y="130" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">
                  {startingHub.name.replace(" Hub", "")}
                </text>
                <text x="60" y="145" textAnchor="middle" fill="#A2BA9F" fontSize="9">
                  Origin Hub (KM 0)
                </text>

                {/* Waypoint 2: Mid-way FASTag Toll Plaza */}
                <circle cx="270" cy="62" r="9" fill="#172016" stroke="#FBBF24" strokeWidth="2.5" />
                <circle cx="270" cy="62" r="3.5" fill="#FBBF24" />
                <text x="270" y="38" textAnchor="middle" fill="#FBBF24" fontSize="10" fontWeight="bold">
                  FASTag Toll Plaza
                </text>
                <text x="270" y="50" textAnchor="middle" fill="#FFFFFF" opacity="0.7" fontSize="9">
                  ₹{trip.oneWayTollINR} 100% ETC
                </text>

                {/* Waypoint 3: Pitstop Food & Rest Area */}
                <circle cx="410" cy="108" r="9" fill="#172016" stroke="#60A5FA" strokeWidth="2.5" />
                <circle cx="410" cy="108" r="3.5" fill="#60A5FA" />
                <text x="410" y="142" textAnchor="middle" fill="#93C5FD" fontSize="10" fontWeight="bold">
                  Wayside Rest Oasis
                </text>
                <text x="410" y="154" textAnchor="middle" fill="#FFFFFF" opacity="0.7" fontSize="9">
                  Dining &amp; EV Hypercharger
                </text>

                {/* Waypoint 4: Destination Terminus */}
                <circle cx="540" cy="90" r="14" fill="#172016" stroke="#34D399" strokeWidth="3" />
                <circle cx="540" cy="90" r="5" fill="#34D399" />
                <text x="540" y="130" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">
                  {destCoords.city}
                </text>
                <text x="540" y="145" textAnchor="middle" fill="#A2BA9F" fontSize="9">
                  {trip.distanceKm} km ({trip.estimatedDriveTime})
                </text>
              </svg>
            </div>

            {/* Bottom GPS Action Pills */}
            <div className="relative z-10 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Launch turn-by-turn navigation in your phone&apos;s navigation app:</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#172016] hover:bg-[#EAF0E7] text-xs font-bold transition-all shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#50644E]" />
                  <span>Google Maps Directions</span>
                  <ExternalLink className="w-3 h-3 text-[#50644E]" />
                </a>

                <a
                  href={appleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
                >
                  <Compass className="w-3.5 h-3.5 text-white" />
                  <span>Apple Maps</span>
                  <ArrowUpRight className="w-3 h-3 text-white/70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* EV vs ICE Cost & Green Efficiency Calculator */
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Electric Vehicle (EV) Analysis */}
            <div className="bg-[#101710] rounded-[24px] p-5 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Electric Propulsion</h4>
                    <span className="text-[10px] text-emerald-300">e.g. Tata Nexon EV LR</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Zero Tailpipe Emissions
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-white/50 block">Est. Energy Need</span>
                  <strong className="text-white text-base">{evKwh} kWh</strong>
                  <span className="text-[10px] text-white/40 block">@ 6.2 km/kWh</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-white/50 block">Charging Cost</span>
                  <strong className="text-emerald-400 text-base">{formatINR(evCost)}</strong>
                  <span className="text-[10px] text-white/40 block">DC Hypercharger rate</span>
                </div>
              </div>

              <p className="text-[11px] text-white/70 leading-relaxed">
                DC fast chargers deployed every 40–60 km along {trip.expresswayName?.split(" (")[0] || "this corridor"} with guaranteed CCS2 compatibility.
              </p>
            </div>

            {/* Petrol / ICE Propulsion Analysis */}
            <div className="bg-[#101710] rounded-[24px] p-5 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Petrol / Diesel ICE</h4>
                    <span className="text-[10px] text-amber-300">e.g. Thar Roxx / Creta Turbo</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Instant 3-Min Refueling
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-white/50 block">Est. Fuel Consumed</span>
                  <strong className="text-white text-base">{petrolLiters} Liters</strong>
                  <span className="text-[10px] text-white/40 block">@ 13 km/L highway</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-white/50 block">Estimated Fuel Cost</span>
                  <strong className="text-amber-400 text-base">{formatINR(petrolCost)}</strong>
                  <span className="text-[10px] text-white/40 block">@ ₹94.7/L (Delhi NCR)</span>
                </div>
              </div>

              <p className="text-[11px] text-white/70 leading-relaxed">
                24x7 high-speed fuel plazas (IOCL / BPCL / HPCL) operational at every major interchange with nitrogen air and windshield cleaning.
              </p>
            </div>
          </div>

          {/* Green Savings Metric Bar */}
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <TrendingDown className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white">
                  Choosing an EV saves {formatINR(fuelSavingsINR)} on this route
                </strong>
                <p className="text-[11px] text-emerald-300/80">
                  Prevents approx. {co2SavingsKg} kg of tailpipe carbon emissions across the {totalKm} km drive.
                </p>
              </div>
            </div>

            <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30">
              ₹{(petrolCost / totalKm).toFixed(1)}/km vs ₹{(evCost / totalKm).toFixed(1)}/km
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

