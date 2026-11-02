"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { useHubLocations } from "@/lib/supabase/fleet";
import { useAuth } from "@/lib/supabase/auth";
import { AuthModal } from "@/components/auth/AuthModal";
import { MapPin, ChevronDown, Check, User as UserIcon, Phone, MessageCircle } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { hubs } = useHubLocations();
  const { user } = useAuth();
  const [selectedHub, setSelectedHub] = useState(hubs[0]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync selectedHub if hubs loads asynchronously and initial hub wasn't set
  React.useEffect(() => {
    if (hubs.length > 0 && (!selectedHub || !hubs.find((h) => h.id === selectedHub.id))) {
      setSelectedHub(hubs[0]);
    }
  }, [hubs, selectedHub]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Plan", href: "/plan" },
    { name: "Ride", href: "/ride" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#E1E8DF]/70 shadow-[0_2px_12px_rgba(23,32,22,0.03)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[76px] sm:min-h-[88px] py-2 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Logo size="md" />

          {/* Delhi NCR Location Selector with Frosted Glass */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="hidden sm:flex items-center gap-2 bg-[#F3F6F1]/80 hover:bg-[#EAF0E7] text-[#172016] px-3.5 py-1.5 rounded-full border border-[#DFE6DC] text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:scale-[1.01]"
              aria-expanded={isLocationDropdownOpen}
              aria-haspopup="listbox"
            >
              <MapPin className="w-3.5 h-3.5 text-[#50644E]" />
              <span className="truncate max-w-[150px] md:max-w-[190px]">
                {selectedHub?.name || "Delhi NCR Hub"}
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
                <div className="absolute left-0 mt-2 w-72 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-homie-lg border border-[#E1E8DF] p-2 z-20 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#F0F4ED]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#5C6B5A]">
                      Delhi NCR Operating Hubs
                    </p>
                    <p className="text-xs text-[#829280]">
                      Same pickup & return hub required
                    </p>
                  </div>
                  <div className="py-1 max-h-64 overflow-y-auto" role="listbox">
                    {hubs.map((loc) => {
                      const isSelected = loc.id === selectedHub?.id;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            setSelectedHub(loc);
                            setIsLocationDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#EAF0E7] text-[#172016] font-bold"
                              : "hover:bg-[#F7F9F5] text-[#5C6B5A]"
                          }`}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <div>
                            <p className="font-semibold text-[#172016]">{loc.name}</p>
                            <p className="text-[11px] text-[#829280]">{loc.area}</p>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#50644E]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-2 px-3 pb-1 border-t border-[#F0F4ED] flex items-center justify-between text-[11px]">
                    <span className="text-[#829280]">Station details</span>
                    <Link
                      href={`/hubs/${selectedHub?.slug || "ghaziabad-hub"}`}
                      onClick={() => setIsLocationDropdownOpen(false)}
                      className="font-bold text-[#50644E] hover:underline"
                    >
                      Open Station Page →
                    </Link>
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
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${
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

          {/* User Auth Action & Fleet CTA */}
          <div className="flex items-center gap-2">
            {/* Quick Call Direct Booking */}
            <a
              href="tel:+918448786016"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-[#172016] bg-[#F3F6F1] hover:bg-[#EAF0E7] px-3 py-1.5 rounded-full border border-[#DFE6DC] transition-all hover:scale-[1.01]"
              title="Call for Instant Car Booking"
            >
              <Phone className="w-3.5 h-3.5 text-[#50644E]" />
              <span>8448786016</span>
            </a>

            {/* Quick WhatsApp Direct Booking */}
            <a
              href="https://wa.me/918448786016?text=Hi%20Homie%20Drives%2C%20I%20would%20like%20to%20book%20a%20car%20in%20Delhi%20NCR."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 text-xs font-bold text-[#075E54] bg-[#25D366]/15 hover:bg-[#25D366]/25 px-3 py-1.5 rounded-full border border-[#25D366]/30 transition-all hover:scale-[1.01]"
              title="WhatsApp for Instant Car Booking"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-[#25D366]" />
              <span>WhatsApp</span>
            </a>

            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF0E7] hover:bg-[#DFE6DC] text-[#172016] text-xs font-bold transition-all"
                title={user.user_metadata?.full_name || user.email || user.phone || "Profile"}
              >
                <div className="w-5 h-5 rounded-full bg-[#50644E] text-white flex items-center justify-center text-[10px]">
                  {user.user_metadata?.full_name
                    ? user.user_metadata.full_name[0].toUpperCase()
                    : user.email
                    ? user.email.charAt(0).toUpperCase()
                    : user.phone
                    ? user.phone.slice(-1)
                    : "U"}
                </div>
                <span className="hidden sm:inline max-w-[110px] truncate">
                  {user.user_metadata?.full_name?.split(" ")[0] ||
                    (user.email ? user.email.split("@")[0] : user.phone ? `+91 ${user.phone.slice(-4)}` : "Member")}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#50644E] hover:text-[#172016] px-3 py-1.5 rounded-full hover:bg-[#F3F6F1] transition-all cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <Link
              href="/plan?tab=cars"
              className="bg-[#50644E] hover:bg-[#3F503D] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 shadow-sm"
            >
              Explore Fleet
            </Link>
          </div>
        </div>
      </header>

      {/* Auth Modal for Passwordless Login */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
