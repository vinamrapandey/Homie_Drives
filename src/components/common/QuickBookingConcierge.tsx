"use client";

import React, { useState } from "react";
import { Phone, MessageCircle, X, Sparkles } from "lucide-react";

export const QuickBookingConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = "8448786016";
  const displayPhone = "+91 84487 86016";
  const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
    "Hi Homie Drives! I would like to book a car in Delhi NCR. Could you please assist me with availability and rates?"
  )}`;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5 print:hidden">
      {/* Expanded Quick Contact Card */}
      {isOpen && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E1E8DF] shadow-homie-lg max-w-xs w-72 animate-in fade-in slide-in-from-bottom-3 duration-200 text-[#172016]">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4ED]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-xs font-black uppercase tracking-wider text-[#172016]">
                Instant Booking Concierge
              </strong>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full hover:bg-[#F3F6F1] flex items-center justify-center text-[#5C6B5A] hover:text-[#172016] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-[#5C6B5A] my-3 leading-relaxed">
            Skip the online form! Call directly or chat on WhatsApp to reserve any car in our Delhi NCR fleet instantly.
          </p>

          <div className="space-y-2">
            {/* Direct WhatsApp Action */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20BA5C] text-white text-xs font-extrabold shadow-sm transition-all hover:scale-[1.01]"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Book on WhatsApp</span>
            </a>

            {/* Direct Phone Call Action */}
            <a
              href={`tel:+91${phoneNumber}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#50644E] hover:bg-[#3D4D3B] text-white text-xs font-extrabold shadow-sm transition-all hover:scale-[1.01]"
            >
              <Phone className="w-4 h-4" />
              <span>Call {displayPhone}</span>
            </a>
          </div>

          <div className="mt-3 pt-2 border-t border-[#F0F4ED] text-[10px] text-center text-[#829280]">
            ⚡ Average response time: under 2 minutes
          </div>
        </div>
      )}

      {/* Floating Trigger Pill */}
      <div className="flex items-center gap-2 shadow-homie bg-white/95 backdrop-blur-xl p-1.5 rounded-full border border-[#D5E1D1]">
        {/* Quick Direct Call Button */}
        <a
          href={`tel:+91${phoneNumber}`}
          className="flex items-center gap-1.5 bg-[#50644E] hover:bg-[#3D4D3B] active:scale-95 text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-xs"
          title="Direct Call to Book"
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Call:</span>
          <span>{phoneNumber}</span>
        </a>

        {/* Quick Direct WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20BA5C] active:scale-95 text-white px-3 py-2 rounded-full text-xs font-bold transition-all shadow-xs"
          title="Instant WhatsApp Booking"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>

        {/* Toggle Info Pill */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-full bg-[#F3F6F1] hover:bg-[#EAF0E7] flex items-center justify-center text-[#50644E] transition-colors cursor-pointer"
          title="Booking Assistance Details"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
