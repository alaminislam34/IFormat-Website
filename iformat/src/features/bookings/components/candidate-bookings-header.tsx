"use client";

import React from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CandidateBookingsHeaderProps {
  onBookClick: () => void;
  onRefresh: () => void;
}

export function CandidateBookingsHeader({
  onBookClick,
  onRefresh,
}: CandidateBookingsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
            1-on-1 Advisory
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          My Consultations & Coaching
        </h1>
        <p className="text-sm text-slate-400">
          Manage your upcoming career strategy sessions, CV reviews, and live executive coaching appointments.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onBookClick}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 rounded-xl h-10 px-5 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" /> Book New Session
        </Button>
        <Button
          variant="outline"
          onClick={onRefresh}
          className="border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl h-10 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>
    </div>
  );
}
