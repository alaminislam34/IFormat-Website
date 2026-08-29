"use client";

import React from "react";
import {
  Video,
  Clock,
  User,
  CalendarCheck,
  AlertCircle,
  Plus,
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Scheduled Appointments</h2>
          <p className="text-xs text-slate-400">
            Your confirmed upcoming & past consultations.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
          {bookings.length} {bookings.length === 1 ? "Session" : "Sessions"}
        </span>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm animate-pulse flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span>Loading your sessions...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <p className="text-xs">Failed to load consultation bookings.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="border-rose-700 text-rose-100 text-xs"
          >
            Retry
          </Button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Scheduled Sessions</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              You don&apos;t have any consultation bookings yet. Book a session with an
              industry advisor to level up your resume and job strategy.
            </p>
          </div>
          <Button
            onClick={onBookClick}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Book Your First Consultation
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
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
                className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isConfirmed
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : isCompleted
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Video className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{booking.slot?.title || "Career Consultation"}</span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{startTime}</span>
                    </div>
                    {booking.slot?.advisor && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <User className="w-3.5 h-3.5" />
                        <span>Advisor: {booking.slot.advisor.name}</span>
                      </div>
                    )}
                  </div>

                  {booking.notes && (
                    <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="font-semibold text-slate-300">Session Notes:</span>{" "}
                      {booking.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-emerald-400 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
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
