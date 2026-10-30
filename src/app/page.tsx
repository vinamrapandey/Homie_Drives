import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchPanel } from "@/components/booking/SearchPanel";
import { CarCard } from "@/components/cars/CarCard";
import { DEMO_CARS } from "@/data/cars";
import { ArrowRight, ShieldCheck, Sparkles, MapPin, Clock } from "lucide-react";

export default function HomePage() {
  const featuredCars = DEMO_CARS.slice(0, 4);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section matching Screen 1 visual aesthetic */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Headline & Content matching Screen 1 */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Regional Badge */}
              <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#DFE6DC] shadow-sm text-xs font-semibold text-[#50644E]">
                <MapPin className="w-3.5 h-3.5 text-[#50644E]" />
                <span>Delhi NCR • Same Pickup & Return Hubs</span>
              </div>

              {/* Punchy Bold Title from Screen 1: DRIVE BEYOND LIMITS. */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#172016] leading-[0.95]">
                  Drive
                  <br />
                  Beyond
                  <br />
                  <span className="inline-flex items-center gap-3">
                    <span className="inline-flex items-center justify-center p-2 rounded-2xl bg-[#50644E] text-white">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-7 h-7 sm:w-10 sm:h-10"
                      >
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
                        <circle cx="7" cy="17" r="2" />
                        <path d="M9 17h6" />
                        <circle cx="17" cy="17" r="2" />
                      </svg>
                    </span>
                    <span>Limits.</span>
                  </span>
                </h1>
              </div>

              {/* Subheading from Screen 1 */}
              <p className="text-base sm:text-lg text-[#5C6B5A] max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
                Premium cars on demand. From city cruisers to supercar experiences — your ride awaits in Delhi NCR.
              </p>

              {/* Pricing Range Tag */}
              <div className="inline-block bg-[#EAF0E7] text-[#3D4F3B] px-4 py-2 rounded-2xl text-xs font-semibold">
                Affordable Rentals from <strong className="text-[#172016]">₹2,499</strong> to <strong className="text-[#172016]">₹24,999 / day</strong>
              </div>

              {/* Action Buttons matching Screen 1 Pill Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 max-w-md mx-auto lg:mx-0">
                <Link
                  href="/plan?tab=cars"
                  className="w-full sm:w-auto flex-1 text-center bg-[#50644E] hover:bg-[#3F503D] active:scale-[0.99] text-white font-bold text-sm py-4 px-8 rounded-full transition-all duration-200 shadow-homie"
                >
                  Get Started
                </Link>
                <Link
                  href="/plan?tab=trips"
                  className="w-full sm:w-auto flex-1 text-center bg-[#D4E0D1] hover:bg-[#C5D5C1] active:scale-[0.99] text-[#172016] font-bold text-sm py-4 px-8 rounded-full transition-all duration-200"
                >
                  Plan a Trip
                </Link>
              </div>
            </div>

            {/* Right Hero Image matching Screen 1 */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full aspect-[4/3] max-w-lg mx-auto">
                <Image
                  src="/images/cars/homie_vantage_sage.jpg"
                  alt="Homie Drives Sage Green Sports Car"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Search Panel */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-4">
        <SearchPanel />
      </section>

      {/* Featured Fleet Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#50644E]">
              Handcrafted Fleet
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172016] tracking-tight">
              Featured Cars in Delhi NCR
            </h2>
            <p className="text-xs text-[#5C6B5A] mt-1">
              Maintained with meticulous standards. Sample fleet with configurable INR pricing.
            </p>
          </div>

          <Link
            href="/plan?tab=cars"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#50644E] hover:text-[#3F503D] transition-colors"
          >
            <span>View All Fleet ({DEMO_CARS.length})</span>
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

      {/* Everyday Use vs Flexible Long-Term Commitments */}
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
              Whether you need an EV for Delhi NCR weekday commuting, an SUV for an Agra or Jaipur weekend getaway, or a 3 to 6-month flexible commitment without long-term bank EMIs.
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

      {/* Main Benefits / Value Propositions */}
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
              Pick up and return at your preferred regional hub in Aerocity, Gurugram Cyber Hub, Connaught Place, or Noida.
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
            {/* Step 1 */}
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

            {/* Step 2 */}
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

            {/* Step 3 */}
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
