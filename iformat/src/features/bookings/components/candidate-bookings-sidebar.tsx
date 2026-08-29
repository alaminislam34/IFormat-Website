"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Available Open Slots</h3>
          <span className="text-[11px] text-indigo-400 font-semibold">
            {availableSlots.length} open
          </span>
        </div>

        {loadingSlots ? (
          <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
            Checking open calendar slots...
          </div>
        ) : availableSlots.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No slots open right now. Click &quot;Book New Session&quot; to request one.
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
                  className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 hover:border-indigo-500/40 transition-colors"
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{slot.title}</p>
                    <p className="text-[11px] text-indigo-300 font-medium">{timeFormatted}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={onBookSlot}
                    className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs h-7 px-3 rounded-lg shrink-0 cursor-pointer"
                  >
                    Book
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preparation Checklist */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Session Preparation
        </h3>
        <ul className="space-y-2 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">•</span>
            <span>Have your latest CV or portfolio link ready to share.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">•</span>
            <span>Prepare 2-3 specific target job descriptions you wish to optimize for.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">•</span>
            <span>Review session notes emailed directly to your inbox.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
