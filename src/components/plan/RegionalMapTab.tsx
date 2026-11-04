"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LocationHub } from "@/types/booking";
import { DELHI_NCR_LOCATIONS } from "@/data/locations";
import { DEMO_CARS } from "@/data/cars";
import { GoogleRegionalMap } from "@/components/map/GoogleRegionalMap";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Car,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const RegionalMapTab: React.FC = () => {
  const [selectedHub, setSelectedHub] = useState<LocationHub>(DELHI_NCR_LOCATIONS[0]);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredHubs = DELHI_NCR_LOCATIONS.filter((hub) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "delhi_gurugram") return hub.city === "Gurugram" || hub.city === "Delhi";
    if (activeFilter === "noida_gr_noida") return hub.city === "Noida" || hub.city === "Greater Noida";
    if (activeFilter === "ghaziabad_meerut") return hub.city === "Ghaziabad" || hub.city === "Meerut" || hub.city === "Faridabad";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Subheader & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h2 className="text-xl font-bold text-[#172016]">
            Delhi NCR Handover Station Network
          </h2>
          <p className="text-xs text-[#5C6B5A] mt-0.5">
            Same-hub pickup and return required across all bookings. 24x7 sanitization &amp; express key handover.
          </p>
        </div>

        {/* Region Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === "all"
                ? "bg-[#50644E] text-white shadow-2xs"
                : "bg-white text-[#5C6B5A] hover:bg-[#F3F6F1] border border-[#E1E8DF]"
            }`}
          >
            All Stations (6)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("delhi_gurugram")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === "delhi_gurugram"
                ? "bg-[#50644E] text-white shadow-2xs"
                : "bg-white text-[#5C6B5A] hover:bg-[#F3F6F1] border border-[#E1E8DF]"
            }`}
          >
            Delhi &amp; Gurugram
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("noida_gr_noida")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === "noida_gr_noida"
                ? "bg-[#50644E] text-white shadow-2xs"
                : "bg-white text-[#5C6B5A] hover:bg-[#F3F6F1] border border-[#E1E8DF]"
            }`}
          >
            Noida &amp; Greater Noida
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("ghaziabad_meerut")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === "ghaziabad_meerut"
                ? "bg-[#50644E] text-white shadow-2xs"
                : "bg-white text-[#5C6B5A] hover:bg-[#F3F6F1] border border-[#E1E8DF]"
            }`}
          >
            Ghaziabad, Faridabad &amp; Meerut
          </button>
        </div>
      </div>

      {/* Main Interactive Map View */}
      <GoogleRegionalMap
        selectedHubId={selectedHub.id}
        onSelectHub={setSelectedHub}
        height="h-[420px] sm:h-[480px]"
        showCorridors={true}
      />

      {/* Hub Station Directory Grid */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#5C6B5A]">
            Station Directory &amp; Stationed Fleet ({filteredHubs.length})
          </h3>
          <span className="text-xs text-[#829280]">
            Click station to highlight on map
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHubs.map((hub) => {
            const isSelected = hub.id === selectedHub.id;
            const stationedCars = DEMO_CARS.filter(
              (c) =>
                c.hubSlug === hub.slug ||
                c.hubLocation.toLowerCase().includes(hub.name.toLowerCase()) ||
                c.hubLocation.toLowerCase().includes(hub.city.toLowerCase())
            );

            const lat = hub.latitude ?? 28.5355;
            const lng = hub.longitude ?? 77.3910;
            const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

            return (
              <div
                key={hub.id}
                onClick={() => setSelectedHub(hub)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "bg-white border-[#50644E] ring-2 ring-[#50644E]/20 shadow-homie"
                    : "bg-white border-[#E8EFE5] hover:border-[#CFD8CD] shadow-xs"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Image + Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#EAF0E7] text-[#50644E] px-2 py-0.5 rounded-full border border-[#D5E2D1]">
                          {hub.city}
                        </span>
                        {hub.isPopular && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                            High Demand
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-base text-[#172016]">
                        {hub.name}
                      </h4>
                      <p className="text-xs text-[#5C6B5A]">{hub.area}</p>
                    </div>

                    <div className="w-14 h-14 rounded-2xl overflow-hidden relative shrink-0 border border-[#E8EFE5]">
                      <Image
                        src={hub.image || "/images/cars/homie_thar_roxx.jpg"}
                        alt={hub.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Address & Hours */}
                  <div className="p-3 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5] space-y-1.5 text-xs text-[#5C6B5A]">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#50644E] shrink-0 mt-0.5" />
                      <span className="line-clamp-2 text-[11px] leading-tight">
                        {hub.address}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#F0F4ED] text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#829280]" />
                        24x7 Express Handover
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-[#829280]" />
                        {hub.phone || "8448786016"}
                      </span>
                    </div>
                  </div>

                  {/* Stationed Fleet Models */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#829280] flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-[#50644E]" />
                      Stationed Fleet ({stationedCars.length} models)
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {stationedCars.slice(0, 3).map((car) => (
                        <span
                          key={car.id}
                          className="text-[10px] font-semibold bg-[#F3F6F1] text-[#172016] px-2 py-0.5 rounded-md border border-[#DFE6DC]"
                        >
                          {car.name}
                        </span>
                      ))}
                      {stationedCars.length > 3 && (
                        <span className="text-[10px] font-bold text-[#50644E] px-1.5 py-0.5">
                          +{stationedCars.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[#F0F4ED] flex items-center gap-2">
                  <Link
                    href={`/hubs/${hub.slug}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#50644E] hover:bg-[#3D4D3B] text-white text-xs font-bold text-center shadow-2xs transition-all"
                  >
                    Station Page →
                  </Link>
                  <a
                    href={dirUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#F8FAF7] hover:bg-[#EAF0E7] text-[#50644E] border border-[#CFD8CD] transition-colors"
                    title="Open in Google Maps"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
