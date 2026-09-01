"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  variant?: "dark" | "light" | "color" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  variant = "light",
  size = "md",
  href = "/",
  className = "",
  priority = true,
}: BrandLogoProps) {
  const isDark = variant === "dark" || variant === "white";

  const sizeDimensions = {
    sm: { width: 104, height: 36, className: "h-8 w-auto" },
    md: { width: 128, height: 44, className: "h-10 w-auto" },
    lg: { width: 156, height: 54, className: "h-12 w-auto" },
    xl: { width: 196, height: 68, className: "h-16 w-auto" },
  };

  const currentSize = sizeDimensions[size] || sizeDimensions.md;
  const logoSrc = isDark ? "/logo-white.png" : "/logo-horizontal.png";

  const content = (
    <div
      className={`inline-flex items-center group cursor-pointer select-none transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <Image
        src={logoSrc}
        alt="iFormat Branding"
        width={currentSize.width}
        height={currentSize.height}
        className={`${currentSize.className} object-contain transition-opacity duration-200 group-hover:opacity-95`}
        priority={priority}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
