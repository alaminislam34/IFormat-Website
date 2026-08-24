"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSelectionCardProps {
  id: "candidate" | "employer";
  title: string;
  description?: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  selected: boolean;
  onSelect: (id: "candidate" | "employer") => void;
}

export function RoleSelectionCard({
  id,
  title,
  description,
  icon: Icon,
  iconBgColor,
  iconColor,
  selected,
  onSelect,
}: RoleSelectionCardProps) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onSelect(id);
        }
      }}
      className={cn(
        "relative flex flex-col justify-between p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A54B1]/50 group select-none",
        selected
          ? "border-[#0A54B1] bg-sky-50/40 shadow-md shadow-blue-500/10"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
      )}
    >
      {/* Radio Indicator */}
      <div className="flex items-start justify-between w-full mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105",
            iconBgColor
          )}
        >
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>

        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5",
            selected
              ? "border-[#0A54B1] bg-[#0A54B1]"
              : "border-slate-300 group-hover:border-slate-400"
          )}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>

      {/* Content */}
      <div>
        <h4
          className={cn(
            "text-base font-bold transition-colors leading-snug",
            selected ? "text-slate-900" : "text-slate-700"
          )}
        >
          {title}
        </h4>
        {description && (
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
