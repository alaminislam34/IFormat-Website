import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-linear-to-r from-[#5DE0E6] to-[#004AAD] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}

export interface SectionHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  as?: "h1" | "h2" | "h3";
  align?: "center" | "left" | "right";
  theme?: "light" | "dark";
  maxWidth?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeader({
  title,
  description,
  children,
  as: Component = "h2",
  align = "center",
  theme = "light",
  maxWidth = "max-w-3xl",
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        maxWidth,
        align === "center" && "text-center mx-auto",
        align === "left" && "text-left",
        align === "right" && "text-right ml-auto",
        "mb-16",
        className
      )}
    >
      <Component
        className={cn(
          "text-3xl md:text-4xl font-semibold mt-1 mb-5 tracking-tight leading-[1.18]",
          isDark ? "text-white" : "text-slate-900",
          titleClassName
        )}
      >
        {title}
      </Component>

      {description && (
        <p
          className={cn(
            "leading-relaxed text-sm md:text-base",
            isDark ? "text-slate-400" : "text-slate-600",
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}

      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
