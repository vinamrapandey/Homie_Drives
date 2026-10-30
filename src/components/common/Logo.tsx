import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  dark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = "md", dark = false }) => {
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 group transition-opacity hover:opacity-90 ${className}`}
      aria-label="Homie Drives Home"
    >
      {/* Stylized Modern Car Silhouette Motif */}
      <div
        className={`flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${
          dark ? "bg-white text-[#172016]" : "bg-[#50644E] text-white"
        } ${size === "sm" ? "p-1.5" : size === "md" ? "p-2" : "p-2.5"}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={iconSizes[size]}
        >
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={`font-black tracking-tight font-sans ${textSizes[size]} ${
            dark ? "text-white" : "text-[#172016]"
          }`}
        >
          homie<span className="text-[#50644E]">.</span>
        </span>
        <span
          className={`text-[9px] uppercase tracking-widest font-semibold ${
            dark ? "text-[#D4E0D1]" : "text-[#5C6B5A]"
          }`}
        >
          Delhi NCR • Self-Drive
        </span>
      </div>
    </Link>
  );
};
