"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Car, User } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Plan", href: "/plan", icon: Compass },
  { name: "Ride", href: "/ride", icon: Car },
  { name: "Profile", href: "/profile", icon: User },
];

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  // On car details pages, hide bottom navigation to let the dedicated booking bar shine
  if (pathname.startsWith("/cars/")) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-4 left-0 right-0 z-50 px-4 md:hidden flex justify-center pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center justify-between gap-1 bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_16px_40px_rgba(23,32,22,0.18)] ring-1 ring-black/5 rounded-full px-2.5 py-1.5 w-full max-w-[340px] transition-all">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center justify-center transition-all duration-300 rounded-full active:scale-95 ${
                isActive
                  ? "bg-[#50644E] text-white px-4 py-2.5 shadow-[0_4px_14px_rgba(80,100,78,0.35)] scale-[1.02]"
                  : "text-[#6C7C6A] hover:text-[#172016] hover:bg-white/60 p-2.5"
              }`}
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-5 h-5 transition-transform duration-200" />
              {isActive && (
                <span className="ml-1.5 text-xs font-bold tracking-wide">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
