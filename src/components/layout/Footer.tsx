import React from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { DELHI_NCR_LOCATIONS } from "@/data/locations";
import { ShieldCheck, MapPin, Phone, Clock, Fuel, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E1E8DF] pt-12 pb-24 md:pb-12 text-[#5C6B5A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#F0F4ED]">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <Logo size="md" />
            <p className="text-xs text-[#5C6B5A] leading-relaxed">
              Homie Drives is Delhi NCR&apos;s mobile-first car rental platform offering premium city cruisers, tourers, and supercar experiences with flexible daily to multi-month commitments.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#F3F6F1] px-3 py-1.5 rounded-xl text-xs font-medium text-[#172016]">
              <ShieldCheck className="w-4 h-4 text-[#50644E]" />
              <span>Zero hidden fees • Same pickup & return</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172016] mb-3">
              Explore Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-[#172016] transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/plan?tab=cars" className="hover:text-[#172016] transition-colors">
                  Browse Cars & Filters
                </Link>
              </li>
              <li>
                <Link href="/plan?tab=trips" className="hover:text-[#172016] transition-colors">
                  Trip Planner (Delhi NCR)
                </Link>
              </li>
              <li>
                <Link href="/ride?tab=book" className="hover:text-[#172016] transition-colors">
                  Availability-Driven Booking
                </Link>
              </li>
              <li>
                <Link href="/ride?tab=pass" className="hover:text-[#172016] transition-colors">
                  Digital Rental Pass Demo
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#172016] transition-colors">
                  Customer Profile & Documents
                </Link>
              </li>
            </ul>
          </div>

          {/* Delhi NCR Hubs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172016] mb-3">
              Delhi NCR Hubs
            </h4>
            <ul className="space-y-2 text-xs">
              {DELHI_NCR_LOCATIONS.slice(0, 5).map((hub) => (
                <li key={hub.id} className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#50644E] shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-[#172016]">{hub.name}</strong>
                    <br />
                    <span className="text-[11px] text-[#829280]">{hub.area}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Value Highlights */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172016] mb-3">
              Homie Commitments
            </h4>
            <div className="bg-[#F8FAF7] p-3.5 rounded-2xl border border-[#E8EFE5] space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#50644E]" />
                <span>Flexible 1-day to 6-month tenures</span>
              </div>
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-[#50644E]" />
                <span>Full-to-full transparent fuel policy</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#50644E]" />
                <span>Sanitized vehicle doorstep delivery</span>
              </div>
              <div className="pt-2 border-t border-[#E8EFE5] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#829280] block">Instant Booking Hotline</span>
                <a
                  href="tel:+918448786016"
                  className="font-bold text-xs text-[#172016] hover:text-[#50644E] flex items-center gap-1.5 transition-colors font-mono"
                >
                  <Phone className="w-3.5 h-3.5 text-[#50644E]" />
                  <span>+91 84487 86016</span>
                </a>
                <a
                  href="https://wa.me/918448786016?text=Hi%20Homie%20Drives%2C%20I%20would%20like%20to%20book%20a%20car."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-[#075E54] hover:underline flex items-center gap-1"
                >
                  <span>Chat on WhatsApp →</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Prototype Legal Disclaimer */}
        <div className="pt-6 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#829280]">
          <p>
            © 2026 Homie Drives India Private Limited. All rights reserved. Built for Delhi NCR.
          </p>
          <p className="bg-[#EAF0E7] text-[#3D4F3B] px-3 py-1 rounded-full text-[11px] font-medium">
            Phase 1 Technical Foundation: Simulated demo data only.
          </p>
        </div>
      </div>
    </footer>
  );
};
