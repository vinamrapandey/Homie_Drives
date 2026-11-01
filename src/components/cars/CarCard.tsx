"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Car } from "@/types/car";
import { formatINR } from "@/lib/formatters";
import { Heart, MapPin, Gauge, Fuel, Users, Star, ShieldCheck } from "lucide-react";

interface CarCardProps {
  car: Car;
  onSelect?: (car: Car) => void;
  showQuickBook?: boolean;
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  onSelect,
  showQuickBook = false,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group relative bg-white rounded-[26px] p-3.5 sm:p-4 shadow-homie hover:shadow-homie-lg transition-all duration-300 hover:-translate-y-1 border border-[#E8EFE5] flex flex-col justify-between">
      {/* Top Image Showcase */}
      <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-[#F7FAF6] to-[#EDF2EB] rounded-[22px] overflow-hidden flex items-center justify-center p-2 mb-3 border border-[#E5ECE3]">
        {/* Floating Tag with Glassmorphism */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          {!car.isAvailableDemo ? (
            <span className="bg-amber-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
              Not Available
            </span>
          ) : (
            <span className="bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-white/70 text-xs font-bold text-[#172016]">
              {car.badgeTag}
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs active:scale-90 ${
            isFavorite
              ? "bg-[#50644E] text-white"
              : "bg-white/85 backdrop-blur-md text-[#5C6B5A] hover:text-[#172016] hover:bg-white"
          }`}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
          />
        </button>

        {/* Car Studio Image */}
        <Link
          href={`/cars/${car.slug}`}
          onClick={(e) => {
            if (onSelect) {
              e.preventDefault();
              onSelect(car);
            }
          }}
          className="relative w-full h-full flex items-center justify-center cursor-pointer transform group-hover:scale-[1.04] transition-transform duration-300"
        >
          <Image
            src={car.image}
            alt={car.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-2 drop-shadow-md"
            priority={false}
          />
        </Link>

        {/* Telematics Chip or Not Available Banner */}
        {!car.isAvailableDemo ? (
          <div className="absolute bottom-0 inset-x-0 bg-amber-600/95 text-white py-1 px-2.5 text-[10px] font-bold text-center backdrop-blur-xs truncate">
            {car.unavailableReason || "Not Available • Reserved"}
          </div>
        ) : (
          car.telematicsStatus && (
            <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 bg-white/85 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/70 shadow-2xs text-[10px] font-semibold text-[#3F503D]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{car.telematicsStatus.keylessReady ? "Keyless Ready" : "Delhi Fastag"}</span>
            </div>
          )
        )}
      </div>

      {/* Info Details Section */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <Link
              href={`/cars/${car.slug}`}
              onClick={(e) => {
                if (onSelect) {
                  e.preventDefault();
                  onSelect(car);
                }
              }}
              className="hover:text-[#50644E] transition-colors"
            >
              <h3 className="font-bold text-base sm:text-lg text-[#172016] tracking-tight leading-snug">
                {car.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1 text-xs text-[#5C6B5A] mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#50644E] shrink-0" />
              <span className="truncate max-w-[170px]">{car.hubLocation}</span>
            </div>
          </div>

          {/* Bold Daily Price */}
          <div className="text-right shrink-0">
            <span className="font-black text-lg sm:text-xl text-[#172016] block leading-none">
              {formatINR(car.dailyPriceINR)}
            </span>
            <span className="text-[11px] font-medium text-[#829280]">/ day</span>
          </div>
        </div>

        {/* Key Specification Chips */}
        <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-[#F0F4ED] text-[11px] text-[#5C6B5A]">
          <span className="inline-flex items-center gap-1 bg-[#F5F8F4] px-2 py-0.5 rounded-md font-medium border border-[#E8EFE5]">
            <Fuel className="w-3 h-3 text-[#50644E]" />
            {car.specs.fuelType}
          </span>
          <span className="inline-flex items-center gap-1 bg-[#F5F8F4] px-2 py-0.5 rounded-md font-medium border border-[#E8EFE5]">
            <Gauge className="w-3 h-3 text-[#50644E]" />
            {car.specs.transmission}
          </span>
          <span className="inline-flex items-center gap-1 bg-[#F5F8F4] px-2 py-0.5 rounded-md font-medium border border-[#E8EFE5]">
            <Users className="w-3 h-3 text-[#50644E]" />
            {car.specs.seats} Seats
          </span>
          <span className="inline-flex items-center gap-1 text-[#E89619] ml-auto font-bold bg-[#FFF9ED] px-1.5 py-0.5 rounded-md border border-[#FDE68A]">
            <Star className="w-3 h-3 fill-current" />
            {car.rating.toFixed(1)}
          </span>
        </div>

        {/* Condition Tiers Availability Ribbon */}
        {car.conditionOptions && car.conditionOptions.length > 0 && (
          <div className="mt-2.5 flex items-center justify-between bg-[#F8FAF7] px-2.5 py-1.5 rounded-xl border border-[#E3ECE0] text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#3D4F3B]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#50644E]" />
              3 Condition Grades
            </span>
            <span className="text-[#647462] font-medium">
              From <strong className="text-[#172016] font-bold">{formatINR(Math.round(car.dailyPriceINR * 0.85))}</strong>/d
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-3.5 flex items-center gap-2">
          <Link
            href={`/cars/${car.slug}`}
            onClick={(e) => {
              if (onSelect) {
                e.preventDefault();
                onSelect(car);
              }
            }}
            className="flex-1 text-center bg-[#F3F6F1] hover:bg-[#50644E] hover:text-white active:scale-[0.98] text-[#172016] font-bold text-xs py-2.5 rounded-xl transition-all duration-200 border border-[#DFE6DC]"
          >
            View Details
          </Link>

          {showQuickBook && (
            <button
              type="button"
              onClick={() => onSelect && onSelect(car)}
              className="bg-[#50644E] hover:bg-[#3F503D] active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all duration-200 shadow-xs cursor-pointer"
            >
              Reserve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
