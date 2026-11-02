import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  dark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const dimensionSizes = {
    sm: { width: 68, height: 68, className: "w-16 h-16" },
    md: { width: 88, height: 88, className: "w-20 h-20 sm:w-[88px] sm:h-[88px]" },
    lg: { width: 120, height: 120, className: "w-28 h-28 sm:w-30 sm:h-30" },
  };

  const { width, height, className: sizeClass } = dimensionSizes[size] || dimensionSizes.md;

  return (
    <Link
      href="/"
      className={`inline-flex items-center group transition-all duration-300 hover:opacity-95 ${className}`}
      aria-label="Homie Drives Home"
    >
      <div
        className={`relative ${sizeClass} rounded-2xl overflow-hidden transition-transform duration-300 group-hover:scale-105 shrink-0 shadow-2xs`}
      >
        <Image
          src="/images/logo/homie_drives.png"
          alt="Homie Drives"
          width={width}
          height={height}
          priority
          className="w-full h-full object-contain"
        />
      </div>
    </Link>
  );
};
