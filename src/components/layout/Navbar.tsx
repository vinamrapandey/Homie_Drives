"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { DELHI_NCR_LOCATIONS } from "@/data/locations";
import { MapPin, ChevronDown, Check } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [selectedHub, setSelectedHub] = useState(DELHI_NCR_LOCATIONS[0]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Plan", href: "/plan" },
    { name: "Ride", href: "/ride" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E1E8DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Logo size="md" />

        {/* Delhi NCR Location Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            className="hidden sm:flex items-center gap-2 bg-[#F3F6F1] hover:bg-[#EAF0E7] text-[#172016] px-3.5 py-1.5 rounded-full border border-[#DFE6DC] text-xs font-medium transition-colors"
            aria-expanded={isLocationDropdownOpen}
            aria-haspopup="listbox"
          >
            <MapPin className="w-3.5 h-3.5 text-[#50644E]" />
            <span className="truncate max-w-[150px] md:max-w-[180px]">
              {selectedHub.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5C6B5A]" />
          </button>

          {/* Location Dropdown Modal */}
          {isLocationDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsLocationDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-homie-lg border border-[#E1E8DF] p-2 z-20">
                <div className="px-3 py-2 border-b border-[#F0F4ED]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6B5A]">
                    Delhi NCR Pickup Hubs
                  </p>
                  <p className="text-xs text-[#829280]">
                    Same pickup & return location applies
                  </p>
                </div>
                <div className="py-1 max-h-64 overflow-y-auto" role="listbox">
                  {DELHI_NCR_LOCATIONS.map((loc) => {
                    const isSelected = loc.id === selectedHub.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setSelectedHub(loc);
                          setIsLocationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-[#EAF0E7] text-[#172016] font-semibold"
                            : "hover:bg-[#F7F9F5] text-[#5C6B5A]"
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div>
                          <p className="font-medium text-[#172016]">{loc.name}</p>
                          <p className="text-[11px] text-[#829280]">{loc.area}</p>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#50644E]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#50644E] text-white shadow-sm"
                    : "text-[#5C6B5A] hover:text-[#172016] hover:bg-[#F3F6F1]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Quick Action */}
        <div className="flex items-center gap-2">
          <Link
            href="/plan?tab=cars"
            className="bg-[#50644E] hover:bg-[#3F503D] text-white text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 shadow-sm"
          >
            Explore Fleet
          </Link>
        </div>
      </div>
    </header>
  );
};
