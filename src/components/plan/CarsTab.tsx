"use client";

import React, { useState, useMemo } from "react";
import { DEMO_CARS } from "@/data/cars";
import { Car, CarFiltersState } from "@/types/car";
import { CarCard } from "@/components/cars/CarCard";
import { CarFilters } from "@/components/cars/CarFilters";
import { CarDetailView } from "@/components/cars/CarDetailView";
import { Search, X } from "lucide-react";

export const CarsTab: React.FC = () => {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [filters, setFilters] = useState<CarFiltersState>({
    searchQuery: "",
    selectedBrand: "All",
    fuelType: "all",
    transmission: "all",
    seatingCapacity: "all",
    priceRange: "all",
    duration: "daily",
  });

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      selectedBrand: "All",
      fuelType: "all",
      transmission: "all",
      seatingCapacity: "all",
      priceRange: "all",
      duration: "daily",
    });
  };

  const filteredCars = useMemo(() => {
    return DEMO_CARS.filter((car) => {
      // Search Query
      if (
        filters.searchQuery &&
        !car.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !car.brand.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !car.hubLocation.toLowerCase().includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Brand Filter
      if (filters.selectedBrand !== "All" && car.brand !== filters.selectedBrand) {
        return false;
      }

      // Fuel Type Filter
      if (filters.fuelType !== "all" && car.specs.fuelType !== filters.fuelType) {
        return false;
      }

      // Transmission Filter
      if (
        filters.transmission !== "all" &&
        car.specs.transmission !== filters.transmission
      ) {
        return false;
      }

      // Seating Capacity Filter
      if (
        filters.seatingCapacity !== "all" &&
        car.specs.seats !== parseInt(filters.seatingCapacity, 10)
      ) {
        return false;
      }

      // Price Range Filter
      if (filters.priceRange === "under-5k" && car.dailyPriceINR >= 5000) {
        return false;
      }
      if (
        filters.priceRange === "5k-10k" &&
        (car.dailyPriceINR < 5000 || car.dailyPriceINR > 10000)
      ) {
        return false;
      }
      if (filters.priceRange === "above-10k" && car.dailyPriceINR <= 10000) {
        return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <div>
      {/* Search Input Bar matching Screen 2 */}
      <div className="mb-4">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-[#5C6B5A] absolute left-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by car model, brand, or Delhi NCR hub..."
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters({ ...filters, searchQuery: e.target.value })
            }
            className="w-full bg-white rounded-full py-3.5 pl-12 pr-10 text-sm font-medium text-[#172016] placeholder:text-[#829280] border border-[#DFE6DC] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#50644E]/30"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => setFilters({ ...filters, searchQuery: "" })}
              className="absolute right-4 text-[#829280] hover:text-[#172016]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Practical Filters Bar */}
      <CarFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={resetFilters}
        resultCount={filteredCars.length}
      />

      {/* Fleet Grid */}
      {filteredCars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onSelect={(selected) => setSelectedCar(selected)}
              showQuickBook={true}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[26px] p-10 text-center border border-[#E8EFE5] my-6">
          <p className="text-base font-bold text-[#172016] mb-1">
            No cars match your selected filters
          </p>
          <p className="text-xs text-[#5C6B5A] max-w-sm mx-auto mb-4">
            Try adjusting your price range, fuel type, or brand filter to see available fleet in Delhi NCR.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="bg-[#50644E] text-white text-xs font-bold py-2.5 px-5 rounded-full hover:bg-[#3F503D] transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Vehicle Detail Overlay Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full py-6">
            <CarDetailView
              car={selectedCar}
              onBack={() => setSelectedCar(null)}
              showBackLink={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
