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
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
      {/* Search & Sort Row */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by candidate name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Sort Select */}
        <div className="relative shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ApplicantSortOption)}
              className="bg-transparent text-xs text-slate-200 focus:outline-hidden cursor-pointer pr-1"
            >
              <option value="RECENT" className="bg-slate-900 text-white">Most Recent</option>
              <option value="SCORE_DESC" className="bg-slate-900 text-white">Highest AI Match</option>
              <option value="SCORE_ASC" className="bg-slate-900 text-white">Lowest AI Match</option>
              <option value="NAME_ASC" className="bg-slate-900 text-white">Candidate Name (A-Z)</option>
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
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-950/40 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
