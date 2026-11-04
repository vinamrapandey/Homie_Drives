"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Phone, MessageCircle, X, Sparkles } from "lucide-react";

export const QuickBookingConcierge: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = "8448786016";
  const displayPhone = "+91 84487 86016";
  const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
    "Hi Homie Drives! I would like to book a car in Delhi NCR. Could you please assist me with availability and rates?"
  )}`;

  // Hide entirely on admin and agent operational dashboards
  if (pathname.startsWith("/admin") || pathname.startsWith("/agent")) {
    return null;
  }

  // On car detail pages, mobile already has a dedicated sticky bottom bar with call & WhatsApp
  const isCarDetailPage = pathname.startsWith("/cars/");

  return (
    <div
      className={`fixed right-3 sm:right-6 z-40 flex flex-col items-end gap-2.5 print:hidden transition-all duration-200 ${
        isCarDetailPage
          ? "hidden sm:flex bottom-6"
          : "bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-6"
      }`}
    >
      {/* Expanded Quick Contact Card */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-0 sm:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-3xl p-4 sm:p-5 border border-[#E1E8DF] shadow-[0_16px_40px_rgba(23,32,22,0.18)] max-w-xs w-72 animate-in fade-in slide-in-from-bottom-3 duration-200 text-[#172016]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4ED]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <strong className="text-xs font-black uppercase tracking-wider text-[#172016]">
                  Instant Concierge
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-[#F3F6F1] flex items-center justify-center text-[#5C6B5A] hover:text-[#172016] transition-colors cursor-pointer"
                aria-label="Close concierge"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5C6B5A] my-3 leading-relaxed">
              Skip the forms! Call or WhatsApp directly to confirm any car in our Delhi NCR fleet within 2 minutes.
            </p>

            <div className="space-y-2">
              {/* Direct WhatsApp Action */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20BA5C] text-white text-xs font-extrabold shadow-sm transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Book on WhatsApp</span>
              </a>

              {/* Direct Phone Call Action */}
              <a
                href={`tel:+91${phoneNumber}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#50644E] hover:bg-[#3D4D3B] text-white text-xs font-extrabold shadow-sm transition-all active:scale-[0.98]"
              >
                <Phone className="w-4 h-4" />
                <span>Call {displayPhone}</span>
              </a>
            </div>
          </div>
        </>
      )}

      {/* Primary Floating Action Pill / Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Instant Booking Concierge"
        className={`group flex items-center gap-2 py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-full shadow-[0_12px_28px_rgba(37,211,102,0.28)] border transition-all duration-200 active:scale-95 cursor-pointer ${
          isOpen
            ? "bg-[#172016] text-white border-[#2A3828]"
            : "bg-[#25D366] hover:bg-[#20BA5C] text-white border-[#1EAE53]"
        }`}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        <MessageCircle className="w-4 h-4 fill-white" />
        <span className="text-xs font-black tracking-wide">
          {isOpen ? "Close" : "Concierge"}
        </span>
      </button>
    </div>
  );
};
