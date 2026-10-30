"use client";

import React from "react";
import { BRANDS } from "@/data/cars";
import { CarFiltersState } from "@/types/car";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface CarFiltersProps {
  filters: CarFiltersState;
  onFilterChange: (newFilters: CarFiltersState) => void;
  onReset: () => void;
  resultCount: number;
}

export const CarFilters: React.FC<CarFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  resultCount,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Brand Filter Pills matching Screen 2 */}
      <div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {BRANDS.map((brand) => {
            const isSelected = filters.selectedBrand === brand;
            return (
              <button
                key={brand}
                type="button"
                onClick={() =>
                  onFilterChange({ ...filters, selectedBrand: brand })
                }
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? "bg-[#50644E] text-white shadow-sm"
                    : "bg-white text-[#5C6B5A] border border-[#DFE6DC] hover:border-[#50644E] hover:text-[#172016]"
                }`}
              >
                {brand}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Control Row */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8EFE5] shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Price Range Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-[#172016] flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#50644E]" />
            Price:
          </span>
          {[
            { label: "All Rates", value: "all" },
            { label: "< ₹5,000", value: "under-5k" },
            { label: "₹5k – ₹10k", value: "5k-10k" },
            { label: "₹10k+", value: "above-10k" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                onFilterChange({
                  ...filters,
                  priceRange: item.value as CarFiltersState["priceRange"],
                })
              }
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                filters.priceRange === item.value
                  ? "bg-[#EAF0E7] text-[#172016] font-bold border border-[#50644E]/30"
                  : "bg-[#F8FAF7] text-[#5C6B5A] hover:bg-[#F0F4ED]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dropdowns for Fuel, Transmission, Seats */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Fuel */}
          <select
            value={filters.fuelType}
            onChange={(e) =>
              onFilterChange({ ...filters, fuelType: e.target.value })
            }
            className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-xl px-3 py-1.5 text-xs font-medium text-[#172016] focus:outline-none"
            aria-label="Filter by fuel type"
          >
            <option value="all">All Fuels</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric (EV)</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          {/* Transmission */}
          <select
            value={filters.transmission}
            onChange={(e) =>
              onFilterChange({ ...filters, transmission: e.target.value })
            }
            className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-xl px-3 py-1.5 text-xs font-medium text-[#172016] focus:outline-none"
            aria-label="Filter by transmission"
          >
            <option value="all">Transmission</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>

          {/* Seats */}
          <select
            value={filters.seatingCapacity}
            onChange={(e) =>
              onFilterChange({ ...filters, seatingCapacity: e.target.value })
            }
            className="bg-[#F8FAF7] border border-[#E8EFE5] rounded-xl px-3 py-1.5 text-xs font-medium text-[#172016] focus:outline-none"
            aria-label="Filter by seating capacity"
          >
            <option value="all">Seats</option>
            <option value="4">4-Seater</option>
            <option value="5">5-Seater</option>
            <option value="7">7-Seater Tourer</option>
          </select>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={onReset}
            className="text-[#829280] hover:text-[#172016] p-1.5 rounded-lg hover:bg-[#F3F6F1] transition-colors"
            title="Reset Filters"
            aria-label="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Result Count and Applied Feedback */}
      <div className="flex items-center justify-between text-xs text-[#5C6B5A] px-1">
        <span>
          Showing <strong className="text-[#172016]">{resultCount}</strong> vehicles in Delhi NCR
        </span>
        <span className="text-[11px] text-[#829280]">
          Prices include comprehensive insurance
        </span>
      </div>
    </div>
  );
};
