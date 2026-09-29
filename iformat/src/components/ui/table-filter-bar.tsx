"use client";

import * as React from "react";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

export interface FilterTabOption {
  key: string;
  label: string;
  count?: number | string;
  icon?: React.ElementType;
}

export interface FilterDropdownOption {
  value: string;
  label: string;
}

export interface FilterDropdown {
  id: string;
  label?: string;
  value: string;
  placeholder?: string;
  options: FilterDropdownOption[];
  onChange: (value: string) => void;
  className?: string;
}

export interface TableFilterBarProps {
  /** Search value */
  search?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Optional search form submit handler */
  onSearchSubmit?: (e: React.FormEvent) => void;
  /** Tabs/Pill filter options */
  tabs?: FilterTabOption[];
  /** Active selected tab key */
  activeTab?: string;
  /** Tab change handler */
  onTabChange?: (tabKey: string) => void;
  /** Optional dropdown select filters */
  dropdowns?: FilterDropdown[];
  /** Extra action buttons or controls on the right */
  actions?: React.ReactNode;
  /** Whether to wrap in card background */
  card?: boolean;
  /** Custom container className */
  className?: string;
}

export function TableFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search records...",
  onSearchSubmit,
  tabs,
  activeTab,
  onTabChange,
  dropdowns,
  actions,
  card = true,
  className,
}: TableFilterBarProps) {
  const handleClearSearch = () => {
    if (onSearchChange) onSearchChange("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit(e);
  };

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between",
        card &&
          "bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs",
        className
      )}
    >
      {/* Left Area: Tabs & Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Pill/Tab Filters */}
        {tabs && tabs.length > 0 && onTabChange && (
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60 overflow-x-auto max-w-full">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer select-none",
                    isActive
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={cn(
                        "px-1.5 py-0.2 rounded-md text-[10px] font-bold ml-0.5",
                        isActive
                          ? "bg-sky-50 text-sky-600 border border-sky-200/60"
                          : "bg-slate-200/70 text-slate-600"
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Dropdown Filters */}
        {dropdowns &&
          dropdowns.map((dd) => (
            <div key={dd.id} className="relative min-w-32.5">
              <select
                value={dd.value}
                onChange={(e) => dd.onChange(e.target.value)}
                className={cn(
                  "w-full h-9 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/60 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer",
                  dd.className
                )}
              >
                {dd.placeholder && (
                  <option value="" disabled>
                    {dd.placeholder}
                  </option>
                )}
                {dd.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
      </div>

      {/* Right Area: Search Box & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input Box */}
        {onSearchChange && (
          <form
            onSubmit={handleFormSubmit}
            className="relative w-full sm:w-72 md:w-80"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={search || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-9 h-10 bg-slate-50/70 border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl focus-visible:ring-sky-500"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        )}

        {/* Extra Action Buttons */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
