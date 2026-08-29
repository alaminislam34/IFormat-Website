"use client";

import React from "react";
import { Briefcase, Search, Plus } from "lucide-react";

interface JobPortalHeaderProps {
  searchQuery: string;
  isEmployerOrAdmin: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onPostJobClick: () => void;
}

export function JobPortalHeader({
  searchQuery,
  isEmployerOrAdmin,
  onSearchChange,
  onClearSearch,
  onPostJobClick,
}: JobPortalHeaderProps) {
  return (
    <div className="space-y-10">
      {/* Title Section */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-sky-50/70 text-[#0ea5e9] rounded-2xl flex items-center justify-center mx-auto border border-sky-100">
          <Briefcase className="w-6 h-6" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Find Your Dream Job
        </h1>
        <p className="text-slate-500 font-semibold text-sm max-w-md mx-auto">
          Explore opportunities across industries, tailored to your skills
        </p>
      </div>

      {/* Search and Add Job Row */}
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search job title or company..."
            value={searchQuery}
            onChange={onSearchChange}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 shadow-xs transition-all placeholder:text-slate-400 font-medium"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {isEmployerOrAdmin && (
          <button
            onClick={onPostJobClick}
            className="h-12 px-6 rounded-xl bg-[#0A54B1] hover:bg-[#0A54B1]/90 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Job</span>
          </button>
        )}
      </div>
    </div>
  );
}
