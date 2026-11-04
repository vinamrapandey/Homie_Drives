"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Phone, MessageCircle, X, GripVertical } from "lucide-react";

export const QuickBookingConcierge: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Position state (x, y coordinates in px)
  // By default, sits on the extreme right, middle of the screen
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    hasMoved: false,
  });

  const pillRef = useRef<HTMLDivElement>(null);

  const phoneNumber = "8448786016";
  const displayPhone = "+91 84487 86016";
  const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
    "Hi Homie Drives! I would like to book a car in Delhi NCR. Could you please assist me with availability and rates?"
  )}`;

  // Default positioning: extreme right middle part of viewport
  const resetToDefaultPosition = useCallback(() => {
    if (typeof window === "undefined") return;
    const pillWidth = pillRef.current?.offsetWidth || 135;
    const defaultX = Math.max(10, window.innerWidth - pillWidth - 10);
    const defaultY = Math.max(80, Math.round(window.innerHeight / 2 - 24));
    setPosition({ x: defaultX, y: defaultY });
  }, []);

  useEffect(() => {
    setMounted(true);
    resetToDefaultPosition();

    const handleResize = () => {
      // Re-bound within new window dimensions
      setPosition((prev) => {
        const pillWidth = pillRef.current?.offsetWidth || 135;
        const newX = Math.min(prev.x, window.innerWidth - pillWidth - 8);
        const newY = Math.min(Math.max(60, prev.y), window.innerHeight - 80);
        return { x: Math.max(8, newX), y: newY };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resetToDefaultPosition]);

  // Pointer drag event handlers (Supports touch and mouse seamlessly)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag with primary pointer (left mouse click or touch)
    if (e.button !== 0 && e.pointerType === "mouse") return;

    // Prevent default touch scrolling while dragging
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
      hasMoved: false,
    };

    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    if (Math.hypot(deltaX, deltaY) > 5) {
      dragRef.current.hasMoved = true;
    }

    const pillWidth = pillRef.current?.offsetWidth || 135;
    const pillHeight = pillRef.current?.offsetHeight || 44;

    const minX = 8;
    const maxX = Math.max(8, window.innerWidth - pillWidth - 8);
    const minY = 60; // Leave space below navbar
    const maxY = Math.max(minY, window.innerHeight - pillHeight - 75); // Leave space above bottom nav

    const nextX = Math.min(Math.max(minX, dragRef.current.originX + deltaX), maxX);
    const nextY = Math.min(Math.max(minY, dragRef.current.originY + deltaY), maxY);

    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if already released
    }

    setIsDragging(false);

    // If user tapped without dragging, toggle expand / collapse
    if (!dragRef.current.hasMoved) {
      setIsOpen((prev) => !prev);
    }
  };

  // Suppress entirely on administrative and operational staff portals
  if (pathname.startsWith("/admin") || pathname.startsWith("/agent")) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  const isNearRightEdge = typeof window !== "undefined" ? position.x > window.innerWidth / 2 : true;

  return (
    <div
      ref={pillRef}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: "none",
      }}
      className="fixed top-0 left-0 z-50 select-none print:hidden transition-transform duration-75"
    >
      {/* Expanded Concierge Quick Contact Card */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-0 bg-black/20 backdrop-blur-2xs"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute z-10 w-72 bg-white rounded-3xl p-4 sm:p-5 border border-[#E1E8DF] shadow-[0_20px_48px_rgba(23,32,22,0.22)] animate-in fade-in zoom-in-95 duration-200 text-[#172016] ${
              isNearRightEdge
                ? "right-0 origin-top-right"
                : "left-0 origin-top-left"
            } ${position.y > 350 ? "bottom-14" : "top-14"}`}
          >
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
              Skip the forms! Call or WhatsApp directly to confirm any vehicle in our Delhi NCR fleet within 2 minutes.
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

            <p className="text-[10px] text-center text-[#829280] mt-3 font-medium flex items-center justify-center gap-1">
              <span>💡 Touch &amp; drag pill anywhere on screen</span>
            </p>
          </div>
        </>
      )}

      {/* Floating & Draggable Pill */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`group flex items-center gap-1.5 py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-full shadow-[0_10px_28px_rgba(37,211,102,0.32)] border border-[#1EAE53] transition-all cursor-grab active:cursor-grabbing ${
          isOpen
            ? "bg-[#172016] text-white border-[#2A3828] scale-105"
            : "bg-gradient-to-r from-[#25D366] to-[#1FB855] text-white hover:brightness-105 active:scale-95"
        }`}
        title="Touch and drag to move • Tap to chat or call"
      >
        <GripVertical className="w-3.5 h-3.5 opacity-70 shrink-0" />
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
        <span className="text-xs font-black tracking-wide shrink-0">
          {isOpen ? "Close" : "Concierge"}
        </span>
      </div>
    </div>
  );
};
