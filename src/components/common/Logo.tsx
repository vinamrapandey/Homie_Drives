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
    sm: { width: 52, height: 52, className: "w-10 h-10 sm:w-12 sm:h-12" },
    md: { width: 88, height: 88, className: "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" },
    lg: { width: 120, height: 120, className: "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28" },
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
