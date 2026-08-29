"use client";

import React from "react";
import { Search } from "lucide-react";
import { ApplicationStatus } from "@/types/api";

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
}

export function ApplicantsFilterToolbar({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
}: ApplicantsFilterToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by candidate name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
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
