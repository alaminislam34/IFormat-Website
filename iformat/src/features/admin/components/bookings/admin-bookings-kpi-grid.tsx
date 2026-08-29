"use client";

import React from "react";

interface AdminBookingsKpiGridProps {
  totalCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
}

export function AdminBookingsKpiGrid({
  totalCount,
  confirmedCount,
  completedCount,
  cancelledCount,
}: AdminBookingsKpiGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
        <div className="text-xs text-slate-400 font-medium">Total Bookings</div>
        <div className="text-2xl font-bold text-white mt-1">{totalCount}</div>
      </div>
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
        <div className="text-xs text-emerald-400 font-medium">Confirmed</div>
        <div className="text-2xl font-bold text-emerald-400 mt-1">{confirmedCount}</div>
      </div>
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
        <div className="text-xs text-blue-400 font-medium">Completed</div>
        <div className="text-2xl font-bold text-blue-400 mt-1">{completedCount}</div>
      </div>
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
        <div className="text-xs text-rose-400 font-medium">Cancelled</div>
        <div className="text-2xl font-bold text-rose-400 mt-1">{cancelledCount}</div>
      </div>
    </div>
  );
}
