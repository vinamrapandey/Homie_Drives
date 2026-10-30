"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { CarGalleryItem } from "@/types/car";
import { ArrowLeft, Share2, Camera, ChevronLeft, ChevronRight } from "lucide-react";

interface CarImageCarouselProps {
  carName: string;
  gallery: CarGalleryItem[];
  fallbackImage: string;
  onBack?: () => void;
  showBackLink?: boolean;
}

export const CarImageCarousel: React.FC<CarImageCarouselProps> = ({
  carName,
  gallery,
  fallbackImage,
  onBack,
  showBackLink = true,
}) => {
  const items = gallery && gallery.length > 0
    ? gallery
    : [{ label: "Exterior View", url: fallbackImage }];

  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Touch Swipe Handlers (Zero external dependencies)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  return (
    <div className="relative w-full bg-[#EAEFE8] overflow-hidden select-none">
      {/* Top Floating Glass Navigation (Mobbin reference style) */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between pointer-events-none">
        {showBackLink ? (
          <button
            type="button"
            onClick={onBack ? onBack : () => window.history.back()}
            className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-white/70 flex items-center justify-center text-[#172016] hover:bg-white shadow-sm active:scale-90 transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10" />
        )}

        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `${carName} — Homie Drives Delhi NCR`,
                url: window.location.href,
              }).catch(() => {});
            } else {
              navigator.clipboard?.writeText(window.location.href);
              alert("Vehicle link copied to clipboard!");
            }
          }}
          className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-white/70 flex items-center justify-center text-[#172016] hover:bg-white shadow-sm active:scale-90 transition-all cursor-pointer"
          aria-label="Share vehicle"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Swipeable Viewport */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center max-w-4xl mx-auto cursor-grab active:cursor-grabbing"
      >
        <Image
          key={items[currentIndex]?.url}
          src={items[currentIndex]?.url || fallbackImage}
          alt={`${carName} - ${items[currentIndex]?.label}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-contain p-4 sm:p-6 drop-shadow-2xl transition-all duration-300 animate-in fade-in"
        />

        {/* Desktop Left/Right Navigation Chevrons */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-white/60 items-center justify-center text-[#172016] hover:bg-white shadow-sm active:scale-90 transition-all cursor-pointer z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-white/60 items-center justify-center text-[#172016] hover:bg-white shadow-sm active:scale-90 transition-all cursor-pointer z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Floating Angle & Pagination Badge */}
        <div className="absolute bottom-12 left-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          <span>{items[currentIndex]?.label}</span>
          <span className="text-white/60 ml-0.5">
            ({currentIndex + 1}/{items.length})
          </span>
        </div>

        {/* Pagination Dots (Mobbin style) */}
        {items.length > 1 && (
          <div className="absolute bottom-12 right-4 z-10 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-full">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-200 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? "w-4 h-1.5 bg-emerald-400"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
