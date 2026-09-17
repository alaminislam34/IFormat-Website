"use client";

import React from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { ApplicationStatus } from "@/types/api";

export type ApplicantSortOption = "RECENT" | "SCORE_DESC" | "SCORE_ASC" | "NAME_ASC";

export const STATUS_FILTERS: Array<{ label: string; value: ApplicationStatus | "ALL" }> = [
  { label: "All Applicants", value: "ALL" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Screened", value: "SCREENED" },
  { label: "Shortlisted", value: "SHORTLISTED" },
  { label: "Interviewing", value: "INTERVIEWING" },
  { label: "Offered", value: "OFFERED" },
  { label: "Hired", value: "HIRED" },
  { label: "Rejected", value: "REJECTED" },
];

interface ApplicantsFilterToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: ApplicationStatus | "ALL";
  setSelectedStatus: (status: ApplicationStatus | "ALL") => void;
  sortBy: ApplicantSortOption;
  setSortBy: (sort: ApplicantSortOption) => void;
}

export function ApplicantsFilterToolbar({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
}: ApplicantsFilterToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Search & Sort Row */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by candidate name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#0A54B1] transition-all"
          />
        </div>

        {/* Sort Select */}
        <div className="relative shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ApplicantSortOption)}
              className="bg-transparent text-xs text-slate-700 focus:outline-hidden cursor-pointer pr-1"
            >
              <option value="RECENT" className="bg-white text-slate-800">Most Recent</option>
              <option value="SCORE_DESC" className="bg-white text-slate-800">Highest AI Match</option>
              <option value="SCORE_ASC" className="bg-white text-slate-800">Lowest AI Match</option>
              <option value="NAME_ASC" className="bg-white text-slate-800">Candidate Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setSelectedStatus(f.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === f.value
                ? "bg-[#0A54B1] text-white shadow-xs shadow-blue-500/20"
                : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
