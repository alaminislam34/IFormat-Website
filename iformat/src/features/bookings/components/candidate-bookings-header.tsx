"use client";

import React from "react";
import { Plus, RefreshCw, Calendar, Sparkles } from "lucide-react";
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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
      {/* Decorative subtle background accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-50 text-[#0A54B1] border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" /> 1-on-1 Executive Advisory
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          My Consultations & Coaching
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
          Manage your upcoming career strategy sessions, CV reviews, and live executive coaching appointments.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 relative z-10">
        <button
          onClick={onBookClick}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Book New Session
        </button>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh
        </button>
      </div>
    </div>
  );
}
