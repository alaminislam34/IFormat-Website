"use client";

import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  variant?: "dark" | "light";
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function BrandLogo({
  variant = "light",
  subtitle = "Branding",
  size = "md",
  href = "/",
}: BrandLogoProps) {
  const isDark = variant === "dark";
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const content = (
    <div className="inline-flex flex-col group cursor-pointer select-none">
      <div className="flex items-center gap-0.5 leading-none">
        <span className={`font-extrabold tracking-tight text-[#52CEDE] transition-transform duration-200 group-hover:scale-105 ${sizeClasses[size]}`}>
          i
        </span>
        <span
          className={`font-extrabold tracking-tight transition-colors ${sizeClasses[size]} ${
            isDark ? "text-white" : "text-[#0A54B1]"
          }`}
        >
          Format
        </span>
      </div>
      {subtitle && (
        <span
          className={`text-[7.5px] tracking-[0.28em] font-extrabold uppercase -mt-0.5 pl-0.5 ${
            isDark ? "text-white/80" : "text-[#0A54B1]/80"
          }`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
