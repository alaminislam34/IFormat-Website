"use client";

import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  variant?: "dark" | "light";
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export function BrandLogo({
  variant = "light",
  subtitle = "BRANDING",
  size = "md",
  href = "/",
  className = "",
}: BrandLogoProps) {
  const isDark = variant === "dark";

  const sizeStyles = {
    sm: {
      brand: "text-lg tracking-tight font-extrabold",
      subtitle: "text-[10px] tracking-[0.2em] font-medium ml-2.5",
    },
    md: {
      brand: "text-2xl tracking-tight font-extrabold",
      subtitle: "text-xs tracking-[0.24em] font-medium ml-3",
    },
    lg: {
      brand: "text-3xl tracking-tight font-extrabold",
      subtitle: "text-sm tracking-[0.28em] font-medium ml-3.5",
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const content = (
    <div
      className={`inline-flex items-baseline group cursor-pointer select-none transition-opacity hover:opacity-95 ${className}`}
    >
      <span
        className={`${currentSize.brand} transition-colors duration-200 ${
          isDark ? "text-white" : "text-[#0A54B1]"
        }`}
      >
        iFormat
      </span>
      {subtitle && (
        <span
          className={`${currentSize.subtitle} uppercase transition-colors duration-200 ${
            isDark ? "text-white/85" : "text-[#0A54B1]/80"
          }`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-flex items-center">{content}</Link>;
  }

  return content;
}
