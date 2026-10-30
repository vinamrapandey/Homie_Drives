"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Car, Ticket, User } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  matchPrefix?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Plan", href: "/plan", icon: Compass, matchPrefix: "/plan" },
  { name: "Ride", href: "/ride?tab=book", icon: Car, matchPrefix: "/ride" },
  { name: "Pass", href: "/ride?tab=pass", icon: Ticket },
  { name: "Profile", href: "/profile", icon: User, matchPrefix: "/profile" },
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
      className="fixed bottom-3.5 left-0 right-0 z-50 px-4 md:hidden flex justify-center pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center justify-around bg-white/95 backdrop-blur-2xl border border-white/90 shadow-[0_14px_36px_rgba(23,32,22,0.12)] rounded-full px-2 py-1.5 w-full max-w-[370px] transition-all">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : item.matchPrefix
              ? pathname.startsWith(item.matchPrefix)
              : false;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center py-0.5 px-2.5 transition-all duration-200 group active:scale-95"
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? "bg-[#EAF0E7] text-[#172016] font-bold shadow-2xs"
                    : "text-[#738271] group-hover:text-[#172016] group-hover:bg-[#F3F6F1]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? "stroke-[2.4]" : "stroke-[1.8]"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                  isActive
                    ? "font-bold text-[#172016]"
                    : "font-medium text-[#738271] group-hover:text-[#172016]"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
