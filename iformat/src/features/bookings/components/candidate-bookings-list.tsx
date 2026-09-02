"use client";

import React from "react";
import {
  Video,
  Clock,
  User,
  CalendarCheck,
  AlertCircle,
  Plus,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CandidateBookingsListProps {
  bookings: any[];
  isLoading: boolean;
  error: any;
  onBookClick: () => void;
  onRetry: () => void;
}

export function CandidateBookingsList({
  bookings,
  isLoading,
  error,
  onBookClick,
  onRetry,
}: CandidateBookingsListProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Scheduled Appointments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your confirmed upcoming & past consultations.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200/60">
          {bookings.length} {bookings.length === 1 ? "Session" : "Sessions"}
        </span>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm animate-pulse flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#0A54B1] border-t-transparent animate-spin" />
          <span className="font-semibold text-slate-500">Loading your sessions...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
          <p className="text-xs font-semibold">Failed to load consultation bookings.</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50/80 border border-blue-100/80 text-[#0A54B1] flex items-center justify-center mx-auto shadow-sm">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800">No Scheduled Sessions</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              You don&apos;t have any consultation bookings yet. Book a session with an
              industry advisor to level up your resume and executive job strategy.
            </p>
          </div>
          <button
            onClick={onBookClick}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#0A54B1] hover:bg-[#0A54B1]/95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Book Your First Consultation
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {bookings.map((booking) => {
            const startTime = booking.slot?.startTime
              ? new Date(booking.slot.startTime).toLocaleString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Date TBD";

            const isConfirmed = booking.status === "CONFIRMED";
            const isCompleted = booking.status === "COMPLETED";

            return (
              <div
                key={booking.id}
                className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        isConfirmed
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isCompleted
                          ? "bg-blue-50 text-[#0A54B1] border-blue-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#0A54B1] shrink-0" />
                    <span>{booking.slot?.title || "Career Consultation"}</span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-[#0A54B1] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{startTime}</span>
                    </div>
                    {booking.slot?.advisor && (
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <User className="w-3.5 h-3.5" />
                        <span>Advisor: {booking.slot.advisor.name}</span>
                      </div>
                    )}
                  </div>

                  {booking.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 leading-relaxed font-medium">
                      <span className="font-bold text-slate-800">Session Notes:</span>{" "}
                      {booking.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-extrabold text-emerald-700 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    {booking.slot?.priceInCents
                      ? `$${(booking.slot.priceInCents / 100).toFixed(0)} USD`
                      : "Free"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
