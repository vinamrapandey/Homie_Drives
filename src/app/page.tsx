"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchPanel } from "@/components/booking/SearchPanel";
import { CarCard } from "@/components/cars/CarCard";
import { useVehicles } from "@/lib/supabase/fleet";
import { DELHI_NCR_LOCATIONS } from "@/data/locations";
import {
  Compass,
  ShieldCheck,
  Bell,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  ChevronRight,
  Phone,
  MessageSquare,
  Navigation,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [bookingRefInput, setBookingRefInput] = useState("");
  const { vehicles } = useVehicles();
  const featuredCars = vehicles.slice(0, 4);

  const handleLookupBooking = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/ride?tab=pass");
  };

  // Distinct category drives for Screen 1 horizontal swipeable cards
  const driveCategories = [
    {
      title: "Weekend 4x4 Off-Road",
      subtitle: "Mahindra Thar Roxx 4x4 AX7L",
      rate: "₹4,499/day",
      image: "/images/cars/homie_thar_roxx.jpg",
      href: "/cars/mahindra-thar-roxx-4x4",
      actionText: "Get started",
      bgGradient: "from-[#1F2C1E] to-[#121B11]",
    },
    {
      title: "Urban Electric Commute",
      subtitle: "Tata Nexon EV Empowered+ LR",
      rate: "₹2,699/day",
      image: "/images/cars/homie_nexon_ev.jpg",
      href: "/cars/tata-nexon-ev-long-range",
      actionText: "Explore EV",
      bgGradient: "from-[#1B2729] to-[#0F181A]",
    },
    {
      title: "7-Seater Luxury Lounge",
      subtitle: "Toyota Innova HyCross Hybrid",
      rate: "₹5,499/day",
      image: "/images/cars/homie_innova_hycross.jpg",
      href: "/cars/toyota-innova-hycross-zx",
      actionText: "Book Lounge",
      bgGradient: "from-[#2A231C] to-[#17130F]",
    },
    {
      title: "Supercar Track Rush",
      subtitle: "Aston Martin Vantage V8",
      rate: "₹24,999/day",
      image: "/images/cars/homie_vantage_sage.jpg",
      href: "/cars/aston-martin-vantage-v8",
      actionText: "Experience",
      bgGradient: "from-[#1D2523] to-[#101614]",
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-14 pb-28 md:pb-12">
      {/* =========================================================================
          SCREEN 2: Mobbin Ro Atmospheric Hero Card with Rounded Bottom Corners
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#141F14] via-[#1B291A] to-[#121A12] text-white pt-8 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 lg:px-8 rounded-b-[36px] sm:rounded-b-[48px] shadow-[0_20px_50px_rgba(20,31,20,0.25)] border-b border-[#2C3B2A]/70">
        {/* Subtle Ambient Lighting Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#50644E]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Top Bar with Hub Tag & Floating Notification Bell (Ro Screen 2) */}
          <div className="w-full flex items-center justify-between gap-2 mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-white/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Delhi NCR • 6 Active Handover Hubs</span>
            </div>

            {/* Floating Top Bell Button */}
            <Link
              href="/ride?tab=pass"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all shadow-sm"
              aria-label="Rental status and active pass notifications"
            >
              <Bell className="w-4 h-4" />
            </Link>
          </div>

          {/* Centered Atmospheric Editorial Headline (Matching Ro Screen 2) */}
          <div className="space-y-2 mb-8 sm:mb-10 max-w-2xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white/90">
              Zero hassle.
            </h1>
            <p className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              You&apos;re all set to drive.
            </p>
            <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto pt-2 font-normal leading-relaxed">
              Curated self-drive fleet, 3 certified condition tiers, keyless hub pickups, and Delhi FASTag active on every vehicle.
            </p>
          </div>

          {/* Two Floating Frosted Action Cards (Ro Screen 2 Primitives) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md mb-8">
            <Link
              href="/plan?tab=trips"
              className="group bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5 shadow-sm flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                  Manage your trips
                </p>
                <p className="text-[10px] text-white/60 mt-0.5">Jaipur • Agra • Rishikesh</p>
              </div>
            </Link>

            <Link
              href="/profile"
              className="group bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5 shadow-sm flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                  Help Center
                </p>
                <p className="text-[10px] text-white/60 mt-0.5">24x7 Roadside Concierge</p>
              </div>
            </Link>
          </div>

          {/* Signature Brand Footnote (Matching Ro Screen 2) */}
          <div className="pt-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white block">
              homie<span className="text-[#A2BA9F]">.</span>
            </span>
            <span className="text-xs font-medium text-white/60 tracking-wider">
              Every drive, handled.
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCREEN 1: "Already on Homie?" & "New to Homie?" Direct Entry
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        {/* Section 1A: Already on Homie? Search Input Pill */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E8EFE5] shadow-homie">
          <h2 className="text-base sm:text-lg font-black text-[#172016] tracking-tight mb-1">
            Already on Homie?
          </h2>
          <p className="text-xs text-[#5C6B5A] mb-4">
            Enter your mobile number or booking reference to view active passes and live vehicle telematics.
          </p>

          <form onSubmit={handleLookupBooking} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={bookingRefInput}
                onChange={(e) => setBookingRefInput(e.target.value)}
                placeholder="Enter booking ref (e.g. #HD-DEL-8924) or phone"
                className="w-full bg-[#F6F8F5] border border-[#DFE6DC] text-xs sm:text-sm text-[#172016] placeholder-[#829280] rounded-full px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#50644E]/30 focus:border-[#50644E] transition-all font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-[#50644E] hover:bg-[#3F503D] active:scale-95 text-white font-bold text-xs sm:text-sm py-3.5 px-8 rounded-full transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Section 1B: New to Homie? Horizontal Swipeable Dark Cards (Ro Screen 1) */}
        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#172016] tracking-tight">
                New to Homie?
              </h2>
              <p className="text-xs text-[#5C6B5A] mt-0.5">
                Select a drive experience below to get started.
              </p>
            </div>
            <span className="text-xs text-[#829280] font-medium hidden sm:inline-block">
              Swipe to explore →
            </span>
          </div>

          {/* Horizontal Swipeable Container with Snap Physics */}
          <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar snap-x pb-2 -mx-2 px-2">
            {driveCategories.map((cat, idx) => (
              <div
                key={idx}
                className={`min-w-[260px] sm:min-w-[280px] max-w-[300px] bg-gradient-to-br ${cat.bgGradient} text-white rounded-[28px] p-5 snap-start border border-white/10 flex flex-col justify-between shadow-homie relative overflow-hidden group`}
              >
                {/* Header */}
                <div className="relative z-10 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                    Category Drive
                  </span>
                  <h3 className="text-lg font-black text-white leading-snug mt-0.5">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-white/70 line-clamp-1">{cat.subtitle}</p>
                </div>

                {/* Car Image Preview */}
                <div className="relative w-full aspect-[16/10] my-3">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="280px"
                    className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Bottom Rate & Dark Pill Button (Ro Screen 1 Style) */}
                <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <span className="text-xs font-extrabold text-white block">
                      {cat.rate}
                    </span>
                    <span className="text-[10px] text-white/60">base rate</span>
                  </div>

                  <Link
                    href={cat.href}
                    className="bg-black/60 hover:bg-black/80 active:scale-95 text-white border border-white/20 text-xs font-bold py-2 px-4 rounded-full transition-all duration-200 shadow-sm flex items-center gap-1.5"
                  >
                    <span>{cat.actionText}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          Delhi NCR Hub Booking Search Panel
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <SearchPanel />
      </section>

      {/* =========================================================================
          CREATIVE VIP CONCIERGE & DIRECT PHONE / WHATSAPP BOOKING SHOWCASE
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1C271B] via-[#162115] to-[#10180F] text-white rounded-[32px] sm:rounded-[36px] p-6 sm:p-10 border border-[#2D3F2B] shadow-[0_16px_40px_rgba(20,32,19,0.35)]">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#50644E]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Top Eyebrow Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs px-3.5 py-1 rounded-full backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>DIRECT BOOKING HOTLINE • NO APP REQUIRED</span>
              </div>
              <span className="text-xs text-white/60 font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Average Pickup Under 3 Seconds</span>
              </span>
            </div>

            {/* Headline & Description */}
            <div className="max-w-2xl mb-8">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Prefer to book by talking to a human?
              </h2>
              <p className="text-xs sm:text-sm text-white/75 mt-2 leading-relaxed">
                Connect directly with our 24x7 Delhi NCR Fleet Concierge at{" "}
                <strong className="text-emerald-400 font-mono font-bold">8448786016</strong>. Instant
                vehicle lock, customized trip pricing, and fast dispatch across all 6 hubs.
              </p>
            </div>

            {/* Creative Two-Pillar Action Showcase (Call & WhatsApp) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Pillar 1: Direct Instant Call */}
              <a
                href="tel:+918448786016"
                className="group relative overflow-hidden bg-white/10 hover:bg-white/15 active:scale-[0.99] border border-white/20 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-md flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                    <Phone className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-300 block">
                      Tap to Call Immediately
                    </span>
                    <strong className="text-xl sm:text-2xl font-black text-white font-mono block mt-0.5 tracking-wide">
                      8448786016
                    </strong>
                    <span className="text-xs text-white/70 block mt-0.5">
                      Direct line to Delhi NCR Dispatch Desk
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white group-hover:bg-emerald-500 transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </a>

              {/* Pillar 2: WhatsApp VIP Concierge */}
              <a
                href={`https://wa.me/918448786016?text=${encodeURIComponent(
                  "Hello Homie Drives! I would like to book a car directly via WhatsApp concierge."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-emerald-950/40 hover:bg-emerald-950/60 active:scale-[0.99] border border-emerald-500/30 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-md flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-300 block">
                      Chat on WhatsApp
                    </span>
                    <strong className="text-xl sm:text-2xl font-black text-white font-mono block mt-0.5 tracking-wide">
                      Instant Reply
                    </strong>
                    <span className="text-xs text-white/70 block mt-0.5">
                      Share dates &amp; get instant vehicle photos
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white group-hover:bg-[#25D366] transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </a>
            </div>

            {/* Direct Hubs Explorer Bar */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Or explore vehicles at our 6 NCR Station Hubs:</span>
                </span>
                <span className="text-[11px] text-white/50">
                  Includes directions &amp; real-time availability
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {DELHI_NCR_LOCATIONS.map((loc) => (
                  <Link
                    key={loc.id}
                    href={`/hubs/${loc.slug}`}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-all hover:-translate-y-0.5 group"
                  >
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors block truncate">
                      {loc.name}
                    </span>
                    <span className="text-[10px] text-white/60 block truncate">
                      {loc.city} Station →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          Featured Fleet Section with 3-Tier Condition Badges
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#50644E]">
              Handcrafted Fleet & Conditions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172016] tracking-tight">
              Featured Cars in Delhi NCR
            </h2>
            <p className="text-xs text-[#5C6B5A] mt-1">
              Select between Showroom Pristine, Executive Mint, and Touring Value tiers with live dynamic pricing.
            </p>
          </div>

          <Link
            href="/plan?tab=cars"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#50644E] hover:text-[#3F503D] transition-colors"
          >
            <span>View All Fleet ({vehicles.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Featured Car Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredCars.map((car) => (
            <CarCard key={car.id} car={car} showQuickBook={false} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          Everyday Use vs Flexible Long-Term Commitments
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-[#E8EFE5] shadow-homie">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#50644E]">
              Flexible Rental Durations
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172016] tracking-tight mt-1">
              Rent for a day, a month, or an entire season
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6B5A] mt-2 leading-relaxed">
              Whether you need an EV for Delhi NCR weekday commuting, a 4x4 for a Jaipur or Rishikesh weekend getaway, or a 3 to 6-month flexible commitment without long-term bank EMIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {/* Card 1: Daily */}
            <div className="bg-[#F8FAF7] rounded-2xl p-5 border border-[#E8EFE5] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#50644E] bg-[#EAF0E7] px-2.5 py-1 rounded-full">
                  1 to 7 Days
                </span>
                <h3 className="font-extrabold text-lg text-[#172016] mt-3">
                  Daily & Weekend Drives
                </h3>
                <p className="text-xs text-[#5C6B5A] mt-1.5 leading-relaxed">
                  Fast delivery across Delhi NCR hubs. Ideal for celebrations, road trips, and executive airport transfers.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E8EFE5] flex items-center justify-between">
                <span className="text-xs font-bold text-[#172016]">From ₹2,499 / day</span>
                <Link
                  href="/ride?tab=book"
                  className="text-xs font-bold text-[#50644E] hover:underline"
                >
                  Book Daily →
                </Link>
              </div>
            </div>

            {/* Card 2: Monthly */}
            <div className="bg-[#EAF0E7] rounded-2xl p-5 border border-[#D4E0D1] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-3 right-3 text-[10px] font-bold bg-[#50644E] text-white px-2 py-0.5 rounded-full">
                Popular Choice
              </div>
              <div>
                <span className="text-xs font-bold text-[#3D4F3B] bg-white px-2.5 py-1 rounded-full shadow-sm">
                  1 to 3 Months
                </span>
                <h3 className="font-extrabold text-lg text-[#172016] mt-3">
                  Monthly Subscription
                </h3>
                <p className="text-xs text-[#5C6B5A] mt-1.5 leading-relaxed">
                  Save up to 25% compared to daily rental rates. Includes zero maintenance liability and free monthly detailing.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#D4E0D1] flex items-center justify-between">
                <span className="text-xs font-bold text-[#172016]">From ₹42,000 / mo</span>
                <Link
                  href="/plan?tab=cars"
                  className="text-xs font-bold text-[#50644E] hover:underline"
                >
                  View Plans →
                </Link>
              </div>
            </div>

            {/* Card 3: Long-term */}
            <div className="bg-[#F8FAF7] rounded-2xl p-5 border border-[#E8EFE5] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#50644E] bg-[#EAF0E7] px-2.5 py-1 rounded-full">
                  3 to 6 Months
                </span>
                <h3 className="font-extrabold text-lg text-[#172016] mt-3">
                  Custom Fleet Lease
                </h3>
                <p className="text-xs text-[#5C6B5A] mt-1.5 leading-relaxed">
                  Tailored corporate and personal contracts with dedicated fleet manager assignment and vehicle replacement guarantee.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E8EFE5] flex items-center justify-between">
                <span className="text-xs font-bold text-[#172016]">Custom Quotes</span>
                <Link
                  href="/profile"
                  className="text-xs font-bold text-[#50644E] hover:underline"
                >
                  Contact Concierge →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          Assurances & Workflow
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#50644E]">
            Why Homie Drives
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172016] tracking-tight mt-1">
            Reimagining self-drive in Delhi NCR
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E8EFE5] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EAF0E7] text-[#50644E] flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#172016] mb-1">
              Transparent INR Pricing
            </h3>
            <p className="text-xs text-[#5C6B5A] leading-relaxed">
              No hidden fees, no surge spikes. Pricing is explicitly calculated with insurance and tax breakdowns.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8EFE5] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EAF0E7] text-[#50644E] flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#172016] mb-1">
              Delhi NCR Operating Hubs
            </h3>
            <p className="text-xs text-[#5C6B5A] leading-relaxed">
              Pick up and return at your preferred regional hub in Ghaziabad, Faridabad, Gurugram, Noida, Greater Noida, or Meerut.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8EFE5] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EAF0E7] text-[#50644E] flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#172016] mb-1">
              Immaculate Detailing
            </h3>
            <p className="text-xs text-[#5C6B5A] leading-relaxed">
              Every car undergoes an 80-point mechanical check and interior deep sanitization before every trip.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8EFE5] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EAF0E7] text-[#50644E] flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#172016] mb-1">
              24x7 Roadside Assurance
            </h3>
            <p className="text-xs text-[#5C6B5A] leading-relaxed">
              Dedicated Delhi NCR concierge and roadside dispatch on standby throughout your entire journey.
            </p>
          </div>
        </div>
      </section>

      {/* How Booking & Pickup Work (3 Simple Steps) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-4">
        <div className="bg-[#EAF0E7] rounded-[32px] p-6 sm:p-10 border border-[#D4E0D1]">
          <div className="text-center max-w-lg mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#50644E]">
              Seamless Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172016] tracking-tight mt-1">
              How Homie Drives Works
            </h2>
            <p className="text-xs text-[#5C6B5A] mt-1">
              Three effortless steps from discovery to the open highway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="bg-white rounded-2xl p-6 border border-[#DFE6DC] shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-[#50644E] text-white text-xs font-extrabold flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="font-bold text-base text-[#172016] mb-1">
                Choose Your Machine
              </h3>
              <p className="text-xs text-[#5C6B5A] leading-relaxed">
                Filter by performance, seating, or fuel type across our Delhi NCR fleet. Select your dates and preferred pickup hub.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#DFE6DC] shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-[#50644E] text-white text-xs font-extrabold flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="font-bold text-base text-[#172016] mb-1">
                Hub Handover or Doorstep
              </h3>
              <p className="text-xs text-[#5C6B5A] leading-relaxed">
                Meet your assigned Homie agent at the designated Delhi NCR hub or have the vehicle delivered directly to your doorstep.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#DFE6DC] shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-[#50644E] text-white text-xs font-extrabold flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="font-bold text-base text-[#172016] mb-1">
                Drive Beyond Limits
              </h3>
              <p className="text-xs text-[#5C6B5A] leading-relaxed">
                Enjoy your drive with complete peace of mind. Simply return the vehicle to the same hub at the end of your rental.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
