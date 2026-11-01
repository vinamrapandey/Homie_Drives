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
    sm: { width: 34, height: 34, className: "w-8.5 h-8.5" },
    md: { width: 44, height: 44, className: "w-11 h-11" },
    lg: { width: 60, height: 60, className: "w-15 h-15" },
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
