"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Ticket,
  QrCode,
  MapPin,
  Calendar,
  AlertCircle,
  Car,
  User,
} from "lucide-react";

export const PassTab: React.FC = () => {
  const [showDemoPass, setShowDemoPass] = useState(true);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Switcher to view either Demo Pass or Empty State */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#E8EFE5] shadow-sm text-xs">
        <span className="font-semibold text-[#172016]">
          Pass Preview Mode:
        </span>
        <div className="flex items-center gap-1.5 bg-[#F3F6F1] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setShowDemoPass(true)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              showDemoPass
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016]"
            }`}
          >
            Sample Demo Pass
          </button>
          <button
            type="button"
            onClick={() => setShowDemoPass(false)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              !showDemoPass
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016]"
            }`}
          >
            Empty State View
          </button>
        </div>
      </div>

      {showDemoPass ? (
        /* Representative Demo Booking Pass Card */
        <div className="bg-white rounded-[32px] overflow-hidden border border-[#E1E8DF] shadow-homie relative">
          {/* Top Banner with Demo Warning */}
          <div className="bg-[#50644E] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#D4E0D1]" />
              <div>
                <p className="font-extrabold text-sm tracking-wide">
                  DIGITAL RENTAL PASS
                </p>
                <p className="text-[11px] text-[#D4E0D1]">
                  Homie Drives • Delhi NCR
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full border border-white/30">
              Sample Data Only
            </span>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            {/* Vehicle & Status Row */}
            <div className="flex items-center gap-4 pb-5 border-b border-[#F0F4ED]">
              <div className="relative w-24 h-16 bg-[#F8FAF7] rounded-2xl overflow-hidden shrink-0 border border-[#E8EFE5] p-1">
                <Image
                  src="/images/cars/homie_vantage_sage.jpg"
                  alt="Aston Martin Vantage V8"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base sm:text-lg text-[#172016] truncate">
                    Aston Martin Vantage V8
                  </h3>
                </div>
                <p className="text-xs text-[#5C6B5A]">
                  Sage Green • 2025 • Reg: DL-01-HD-2025 (Demo)
                </p>
                <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ready for Handover at Hub</span>
                </div>
              </div>
            </div>

            {/* QR Code and Security Code Box */}
            <div className="bg-[#F8FAF7] rounded-2xl p-5 border border-[#E8EFE5] flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
              <div>
                <span className="text-[11px] font-bold text-[#829280] uppercase tracking-wider block">
                  Simulated Booking Ref
                </span>
                <span className="text-xl font-black text-[#172016] tracking-tight block">
                  #HD-DEL-8924
                </span>
                <span className="text-xs text-[#5C6B5A] mt-1 block">
                  Agent PIN: <strong className="font-mono text-sm text-[#50644E]">8924</strong>
                </span>
              </div>

              {/* QR Code Graphic Mockup */}
              <div className="bg-white p-3 rounded-2xl border border-[#DFE6DC] shadow-sm flex flex-col items-center">
                <QrCode className="w-20 h-20 text-[#172016]" />
                <span className="text-[10px] font-medium text-[#829280] mt-1">
                  Scan at Handover Hub
                </span>
              </div>
            </div>

            {/* Hub & Schedule Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F8FAF7] p-3.5 rounded-xl border border-[#E8EFE5]">
                <span className="text-[11px] font-bold text-[#829280] uppercase tracking-wider block flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#50644E]" />
                  Pickup & Return Hub
                </span>
                <p className="font-bold text-[#172016]">
                  Aerocity Hub (IGI Airport)
                </p>
                <p className="text-[11px] text-[#5C6B5A]">
                  T3 Hospitality District, New Delhi
                </p>
              </div>

              <div className="bg-[#F8FAF7] p-3.5 rounded-xl border border-[#E8EFE5]">
                <span className="text-[11px] font-bold text-[#829280] uppercase tracking-wider block flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#50644E]" />
                  Rental Schedule
                </span>
                <p className="font-bold text-[#172016]">
                  Fri, 14 Nov – Mon, 17 Nov (3 Days)
                </p>
                <p className="text-[11px] text-[#5C6B5A]">
                  Pickup from 10:00 AM • Return by 08:00 PM
                </p>
              </div>
            </div>

            {/* Handover Agent Assignment */}
            <div className="flex items-center justify-between p-3.5 bg-[#EAF0E7] rounded-xl text-xs text-[#3D4F3B]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#50644E]" />
                <span>
                  Assigned Agent: <strong>Kabir Mehta</strong> (+91 98XXX X8924)
                </span>
              </div>
              <span className="text-[11px] bg-white px-2 py-0.5 rounded-md font-semibold text-[#50644E]">
                Delhi Central
              </span>
            </div>

            {/* Demo Notice Warning */}
            <div className="bg-[#FFFBEB] border border-[#FDE68A] p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-[#92400E]">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Sample Booking Card:</strong> This is a visual representation of the digital pass experience for Phase 1. No booking or identity verification has been performed.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-[32px] p-8 sm:p-12 text-center border border-[#E8EFE5] shadow-homie space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#EAF0E7] text-[#50644E] flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-[#172016]">
            No Confirmed Rental Passes Yet
          </h3>

          <p className="text-xs text-[#5C6B5A] max-w-md mx-auto leading-relaxed">
            When you complete a booking in Homie Drives, your digital rental pass, pickup QR code, assigned agent contact, and vehicle lock status will appear right here.
          </p>

          <div className="pt-2">
            <Link
              href="/plan?tab=cars"
              className="inline-flex items-center gap-2 bg-[#50644E] hover:bg-[#3F503D] text-white text-xs font-bold py-3.5 px-6 rounded-full transition-all shadow-sm"
            >
              <Car className="w-4 h-4" />
              <span>Browse Fleet & Rates</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-[#F0F4ED] text-[11px] text-[#829280]">
            Digital pass verification and live reservation sync will be enabled in Phase 2.
          </div>
        </div>
      )}
    </div>
  );
};
