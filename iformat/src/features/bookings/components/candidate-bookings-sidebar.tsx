"use client";

import React from "react";
import { CheckCircle2, Clock, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CandidateBookingsSidebarProps {
  availableSlots: any[];
  loadingSlots: boolean;
  onBookSlot: () => void;
}

export function CandidateBookingsSidebar({
  availableSlots,
  loadingSlots,
  onBookSlot,
}: CandidateBookingsSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Open Slots Widget */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#0A54B1]" /> Available Open Slots
          </h3>
          <span className="text-[11px] text-[#0A54B1] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100">
            {availableSlots.length} open
          </span>
        </div>

        {loadingSlots ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium animate-pulse">
            Checking open calendar slots...
          </div>
        ) : availableSlots.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center font-medium leading-relaxed">
            No public slots open right now. Click &quot;Book New Session&quot; to request priority timing.
          </p>
        ) : (
          <div className="space-y-2.5">
            {availableSlots.slice(0, 4).map((slot) => {
              const timeFormatted = new Date(slot.startTime).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={slot.id}
                  className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">{slot.title}</p>
                    <p className="text-[11px] text-[#0A54B1] font-extrabold">{timeFormatted}</p>
                  </div>
                  <button
                    onClick={onBookSlot}
                    className="bg-[#0A54B1] hover:bg-[#0A54B1]/90 text-white text-xs font-bold h-8 px-3 rounded-xl shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    Book
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preparation Checklist */}
      <div className="bg-linear-to-br from-blue-50/60 via-white to-slate-50/50 border border-blue-100/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Session Preparation
        </h3>
        <ul className="space-y-2.5 text-xs text-slate-600 font-medium leading-relaxed">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A54B1] mt-1.5 shrink-0" />
            <span>Have your latest CV or portfolio link ready to share.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A54B1] mt-1.5 shrink-0" />
            <span>Prepare 2-3 specific target job descriptions you wish to optimize for.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A54B1] mt-1.5 shrink-0" />
            <span>Review session notes emailed directly to your inbox prior to start.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
