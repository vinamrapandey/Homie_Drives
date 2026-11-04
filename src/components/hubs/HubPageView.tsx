"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LocationHub } from "@/types/booking";
import { Car as CarType } from "@/types/car";
import { DELHI_NCR_LOCATIONS } from "@/data/locations";
import { formatINR } from "@/lib/formatters";
import { GoogleRegionalMap } from "@/components/map/GoogleRegionalMap";
import {
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Car,
  Fuel,
  Users,
  Compass,
  X,
  Share2,
} from "lucide-react";

interface HubPageViewProps {
  hub: LocationHub;
  cars: CarType[];
}

export default function HubPageView({ hub, cars }: HubPageViewProps) {
  const [filterMode, setFilterMode] = useState<"all" | "available">("all");
  const [showDirectionModal, setShowDirectionModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const availableCars = cars.filter((c) => c.isAvailableDemo);
  const displayedCars = filterMode === "available" ? availableCars : cars;

  const lat = hub.latitude ?? 28.5355;
  const lng = hub.longitude ?? 77.391;
  const phone = hub.phone || "8448786016";

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${lat},${lng}`;
  const geoUri = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(hub.name)})`;

  return (
    <div className="min-h-screen bg-[#F3F6F1] text-[#172016] pb-24">
      {/* Top Breadcrumb & Switcher Header */}
      <div className="bg-white border-b border-[#E8EFE5] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#5C6B5A]">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-[#172016] transition-colors font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Fleet Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A0AFA0]" />
            <Link href="/plan" className="hover:text-[#172016] transition-colors">
              Hubs
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A0AFA0]" />
            <span className="text-[#172016] font-bold">{hub.name}</span>
          </div>

          {/* Quick Hotline Pill */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:+91${phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#50644E]/10 hover:bg-[#50644E]/20 text-[#50644E] font-bold text-xs rounded-full transition-colors"
            >
              <Phone className="w-3 h-3 text-[#50644E]" />
              <span className="hidden sm:inline">Hub Hotline:</span>
              <span>{phone}</span>
            </a>
          </div>
        </div>

        {/* Horizontal All Hubs Switcher */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 overflow-x-auto no-scrollbar border-t border-[#F0F4ED]">
          <div className="flex items-center gap-2 min-w-max text-xs">
            <span className="text-[#829280] font-bold text-[11px] uppercase tracking-wider pr-1">
              NCR Hubs:
            </span>
            {DELHI_NCR_LOCATIONS.map((otherHub) => {
              const isActive = otherHub.slug === hub.slug;
              return (
                <Link
                  key={otherHub.id}
                  href={`/hubs/${otherHub.slug}`}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${
                    isActive
                      ? "bg-[#50644E] text-white shadow-xs"
                      : "bg-[#F3F6F1] text-[#5C6B5A] hover:bg-[#E8EFE5] hover:text-[#172016]"
                  }`}
                >
                  {otherHub.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-white rounded-3xl border border-[#E8EFE5] overflow-hidden shadow-homie">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Hub Image & Badge Overlay */}
            <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[400px] bg-[#212A20]">
              <Image
                src={hub.image || "/images/cars/homie_vantage_sage.jpg"}
                alt={hub.name}
                fill
                priority
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/90 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Active Operational Hub
                </span>
                <span className="bg-black/60 text-white/90 text-xs px-3 py-1 rounded-full backdrop-blur-xs font-medium">
                  {hub.city} Station
                </span>
              </div>

              {/* Bottom Hero Overlay Info */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs uppercase tracking-widest text-emerald-300 font-extrabold block mb-1">
                  Homie Drives • Delhi NCR Station
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
                  {hub.name}
                </h1>
                <p className="text-sm text-white/80 flex items-center gap-1.5 max-w-xl">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{hub.area}</span>
                </p>
              </div>
            </div>

            {/* Hub Station Quick Specs & Directions Actions */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white">
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#829280]">
                    Station Coordinates &amp; Address
                  </span>
                  <p className="text-sm font-medium text-[#172016] mt-1 leading-relaxed">
                    {hub.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5]">
                    <div className="flex items-center gap-1.5 text-xs text-[#5C6B5A]">
                      <Clock className="w-3.5 h-3.5 text-[#50644E]" />
                      <span>Operating Hours</span>
                    </div>
                    <strong className="text-xs text-[#172016] font-bold block mt-1">
                      {hub.operatingHours || "24x7 Express Handover"}
                    </strong>
                  </div>

                  <div className="p-3 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5]">
                    <div className="flex items-center gap-1.5 text-xs text-[#5C6B5A]">
                      <Car className="w-3.5 h-3.5 text-[#50644E]" />
                      <span>Hub Fleet</span>
                    </div>
                    <strong className="text-xs text-[#172016] font-bold block mt-1">
                      {availableCars.length} of {cars.length} Available
                    </strong>
                  </div>
                </div>

                {/* Primary Station Call & Take Me to Hub CTA */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDirectionModal(true)}
                    className="w-full py-3.5 px-4 bg-[#50644E] hover:bg-[#3D4D3B] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Take Me to Hub • Get Directions</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={`tel:+91${phone}`}
                      className="py-2.5 px-3 bg-[#F3F6F1] hover:bg-[#E8EFE5] text-[#172016] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-[#DFE6DC]"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#50644E]" />
                      <span>Call: {phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/91${phone}?text=${encodeURIComponent(
                        `Hello Homie Drives! I would like to inquire about booking a vehicle from the ${hub.name}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-200"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Hub</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Security & Industry Quality Assurance Banner */}
              <div className="mt-6 pt-4 border-t border-[#F0F4ED] flex items-center gap-3 text-xs text-[#5C6B5A]">
                <ShieldCheck className="w-5 h-5 text-[#50644E] shrink-0" />
                <span>
                  All vehicles sanitized &amp; FASTag ready. Keyless app release &amp; express check-in on arrival.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Station Location & Access Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <GoogleRegionalMap
          selectedHubId={hub.id}
          height="h-[320px] sm:h-[380px]"
          showCorridors={false}
        />
      </div>

      {/* Fleet Inventory Section at this Hub */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#172016]">
                Vehicles Stationed at {hub.name}
              </h2>
              <span className="bg-[#EAF0E7] text-[#50644E] font-bold text-xs px-2.5 py-0.5 rounded-full">
                {cars.length} Fleet Total
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5C6B5A] mt-0.5">
              Instant pickup from this station. Filter by availability or contact station concierge.
            </p>
          </div>

          {/* Availability Filter Toggle Pill */}
          <div className="inline-flex p-1 bg-white rounded-2xl border border-[#E8EFE5] shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterMode === "all"
                  ? "bg-[#50644E] text-white shadow-xs"
                  : "text-[#5C6B5A] hover:text-[#172016]"
              }`}
            >
              All Cars ({cars.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("available")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterMode === "available"
                  ? "bg-[#50644E] text-white shadow-xs"
                  : "text-[#5C6B5A] hover:text-[#172016]"
              }`}
            >
              Available Cars ({availableCars.length})
            </button>
          </div>
        </div>

        {/* Cars Grid */}
        {displayedCars.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8EFE5] shadow-xs">
            <Car className="w-12 h-12 text-[#A0AFA0] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#172016]">
              No Available Vehicles Currently at {hub.name}
            </h3>
            <p className="text-xs text-[#5C6B5A] max-w-md mx-auto mt-1 mb-6">
              All vehicles at this station are currently reserved. You can view all cars, or call our
              concierge at <strong>{phone}</strong> to arrange vehicle repositioning from a nearby hub.
            </p>
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className="px-5 py-2.5 bg-[#50644E] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#3D4D3B] transition-colors"
            >
              View All Station Vehicles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCars.map((car) => {
              const isAvailable = car.isAvailableDemo;
              const reason =
                car.unavailableReason || "Currently Reserved • In Scheduled Detailing";

              return (
                <div
                  key={car.id}
                  className={`bg-white rounded-3xl border overflow-hidden flex flex-col justify-between transition-all ${
                    isAvailable
                      ? "border-[#E8EFE5] shadow-xs hover:shadow-md hover:border-[#50644E]/40"
                      : "border-amber-200/80 bg-linear-to-b from-white to-amber-50/20 opacity-95"
                  }`}
                >
                  <div>
                    {/* Car Image + Prominent Availability Badges */}
                    <div className="relative h-48 bg-[#F3F6F1] overflow-hidden">
                      <Image
                        src={car.image}
                        alt={car.name}
                        fill
                        className={`object-contain p-3 transition-transform duration-300 ${
                          isAvailable ? "hover:scale-105" : "grayscale-30"
                        }`}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="bg-white/90 backdrop-blur-xs text-[#50644E] font-bold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
                          {car.categoryLabel || car.category}
                        </span>
                        {car.badgeTag && (
                          <span className="bg-[#172016]/80 text-white font-semibold text-[10px] px-2.5 py-1 rounded-full backdrop-blur-xs">
                            {car.badgeTag}
                          </span>
                        )}
                      </div>

                      {/* Prominent Side Badge for NOT AVAILABLE */}
                      {!isAvailable && (
                        <div className="absolute bottom-0 inset-x-0 bg-amber-500/95 text-white py-1.5 px-3 text-xs font-extrabold flex items-center justify-between shadow-xs">
                          <span className="inline-flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>NOT AVAILABLE</span>
                          </span>
                          <span className="text-[10px] font-medium opacity-95 truncate max-w-[170px]">
                            {reason}
                          </span>
                        </div>
                      )}

                      {/* Available Badge */}
                      {isAvailable && (
                        <div className="absolute bottom-2 right-2 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Ready at Station</span>
                        </div>
                      )}
                    </div>

                    {/* Car Details */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[11px] font-bold text-[#829280] uppercase tracking-wider block">
                            {car.brand} • {car.year}
                          </span>
                          <h3 className="text-base font-extrabold text-[#172016] line-clamp-1">
                            {car.name}
                          </h3>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-base font-mono font-extrabold text-[#172016]">
                            {formatINR(car.dailyPriceINR)}
                          </span>
                          <span className="text-[11px] text-[#829280] block">/day</span>
                        </div>
                      </div>

                      {/* Unavailable Side Message Alert Card */}
                      {!isAvailable && (
                        <div className="my-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs">
                          <div className="flex items-center gap-1.5 font-bold mb-0.5">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Status: {reason}</span>
                          </div>
                          <p className="text-[11px] text-amber-800">
                            Repositioning available from other hubs. Tap below to call dispatcher.
                          </p>
                        </div>
                      )}

                      {/* Specs Row */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#F0F4ED] text-[11px] text-[#5C6B5A]">
                        <div className="flex items-center gap-1">
                          <Fuel className="w-3.5 h-3.5 text-[#829280]" />
                          <span>{car.specs.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-[#829280]" />
                          <span>{car.specs.transmission}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#829280]" />
                          <span>{car.specs.seats} Seats</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-5 pt-0 space-y-2">
                    {isAvailable ? (
                      <>
                        <Link
                          href={`/cars/${car.slug}`}
                          className="w-full py-2.5 px-4 bg-[#50644E] hover:bg-[#3D4D3B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>Reserve at {hub.name}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={`tel:+91${phone}`}
                            className="py-2 px-2 bg-[#F3F6F1] hover:bg-[#E8EFE5] text-[#172016] font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 border border-[#DFE6DC]"
                          >
                            <Phone className="w-3 h-3 text-[#50644E]" />
                            <span>Call: {phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/91${phone}?text=${encodeURIComponent(
                              `Hello! I want to book the ${car.name} stationed at ${hub.name}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 border border-emerald-200"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/cars/${car.slug}`}
                          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-[#5C6B5A] font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                        >
                          <span>View Specifications</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <a
                          href={`tel:+91${phone}`}
                          className="w-full py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-amber-300"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-800" />
                          <span>Inquire Availability: {phone}</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DIRECTION MODAL: PROMPT TO OPEN MAPS / NAVIGATION APPS */}
      {/* ========================================================================= */}
      {showDirectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E8EFE5] relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setShowDirectionModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#F3F6F1] text-[#829280] hover:text-[#172016] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#50644E]/10 flex items-center justify-center text-[#50644E]">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#172016]">
                  Directions to {hub.name}
                </h3>
                <p className="text-xs text-[#5C6B5A]">
                  Choose your navigation app for turn-by-turn routing
                </p>
              </div>
            </div>

            {/* Address Banner */}
            <div className="p-3.5 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5] mb-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#829280]">
                    Hub Destination
                  </span>
                  <p className="text-xs font-semibold text-[#172016] mt-0.5">
                    {hub.address}
                  </p>
                  <p className="text-[11px] text-[#5C6B5A] mt-1 font-mono">
                    GPS: {lat}, {lng}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(hub.address, "address")}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#DFE6DC] text-xs font-semibold text-[#50644E] hover:bg-[#F0F4ED] transition-colors shrink-0 flex items-center gap-1"
                >
                  {copiedField === "address" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Navigation App Choices */}
            <div className="space-y-2.5">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3.5 bg-[#50644E] hover:bg-[#3D4D3B] text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-between shadow-xs transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <Navigation className="w-4 h-4 text-emerald-300" />
                  <span>Open in Google Maps (Turn-by-Turn)</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-75" />
              </a>

              <a
                href={appleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3.5 bg-[#F3F6F1] hover:bg-[#E8EFE5] text-[#172016] rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-between border border-[#DFE6DC] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-[#50644E]" />
                  <span>Open in Apple Maps</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-75" />
              </a>

              <a
                href={geoUri}
                className="w-full p-3 bg-white hover:bg-[#F8FAF7] text-[#5C6B5A] hover:text-[#172016] rounded-2xl font-semibold text-xs flex items-center justify-between border border-[#E8EFE5] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#829280]" />
                  <span>Launch Default Mobile Maps App</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </a>
            </div>

            {/* Footer with Concierge Assistance */}
            <div className="mt-5 pt-4 border-t border-[#F0F4ED] flex items-center justify-between text-xs text-[#5C6B5A]">
              <span>Need help finding the gate?</span>
              <a
                href={`tel:+91${phone}`}
                className="font-bold text-[#50644E] hover:underline flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>Call Station ({phone})</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

