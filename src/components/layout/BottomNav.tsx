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

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-4 left-0 right-0 z-50 px-4 md:hidden flex justify-center pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center justify-between gap-1 bg-white/95 backdrop-blur-lg border border-[#DFE6DC] shadow-homie-lg rounded-full px-3 py-2 w-full max-w-[340px]">
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
              className={`relative flex items-center justify-center transition-all duration-300 rounded-full ${
                isActive
                  ? "bg-[#50644E] text-white px-4 py-2.5 shadow-sm"
                  : "text-[#6C7C6A] hover:text-[#172016] hover:bg-[#F0F4ED] p-2.5"
              }`}
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-5 h-5 transition-transform duration-200" />
              {isActive && (
                <span className="ml-1.5 text-xs font-semibold tracking-wide">
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
