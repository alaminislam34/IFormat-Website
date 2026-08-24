"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  name: string;
  count: number;
  icon?: string;
}

interface JobFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (name: string) => void;
}

export function JobFilters({
  categories,
  selectedCategory,
  onSelectCategory,
}: JobFiltersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollAmount = 250;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full flex items-center gap-2 group/filters py-2">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 z-10 p-2 rounded-full bg-white border border-slate-100 shadow-md hover:bg-slate-50 transition-all opacity-0 group-hover/filters:opacity-100 -translate-x-1/2 cursor-pointer focus:outline-none"
      >
        <ChevronLeft className="w-4 h-4 text-slate-600" />
      </button>

      {/* Categories Scroll Area */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1.5 px-1 w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category.name;
          return (
            <button
              key={category.name}
              onClick={() => onSelectCategory(category.name)}
              className={cn(
                "relative flex items-center gap-2 shrink-0 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 border focus:outline-none cursor-pointer overflow-hidden",
                isActive
                  ? "text-white border-transparent bg-[#0ea5e9]"
                  : "text-slate-600 border-slate-100 bg-white hover:border-slate-300 hover:text-slate-800"
              )}
            >
              {/* Animated active pill background */}
              {isActive && (
                <motion.div
                  layoutId="active-filter-pill"
                  className="absolute inset-0 bg-[#0ea5e9] rounded-2xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              <span className="relative z-10 flex items-center gap-2">
                {category.icon && <span className="text-base">{category.icon}</span>}
                <span>{category.name}</span>
              </span>
              <span
                className={cn(
                  "relative z-10 text-xs font-semibold px-2 py-0.5 rounded-lg ml-1",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {category.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 z-10 p-2 rounded-full bg-white border border-slate-100 shadow-md hover:bg-slate-50 transition-all opacity-100 md:opacity-0 md:group-hover/filters:opacity-100 translate-x-1/2 cursor-pointer focus:outline-none"
      >
        <ChevronRight className="w-4 h-4 text-slate-600" />
      </button>
    </div>
  );
}
