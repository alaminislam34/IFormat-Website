"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Video,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CalendarCheck,
  DollarSign,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { useMyBookings, useAvailableSlots } from "@/hooks";
import { BookConsultationModal } from "@/features/services/components/book-consultation-modal";

export default function CandidateBookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const {
    data: bookings = [],
    isLoading: loadingBookings,
    error: bookingsError,
    refetch: refetchBookings,
  } = useMyBookings();

  const {
    data: availableSlots = [],
    isLoading: loadingSlots,
    refetch: refetchSlots,
  } = useAvailableSlots();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/dashboard/bookings");
    }
  }, [isAuthenticated, router]);

  const handleRefresh = async () => {
    await Promise.all([refetchBookings(), refetchSlots()]);
    toast.success("Consultations updated.");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
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
              onClick={() => setIsBookModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 rounded-xl h-10 px-5 cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" /> Book New Session
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl h-10 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Scheduled Sessions (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
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

              {loadingBookings ? (
                <div className="py-16 text-center text-slate-400 text-sm animate-pulse flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <span>Loading your sessions...</span>
                </div>
              ) : bookingsError ? (
                <div className="p-6 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-center space-y-3">
                  <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
                  <p className="text-xs">Failed to load consultation bookings.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refetchBookings()}
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
                      You don&apos;t have any consultation bookings yet. Book a session with an industry advisor to level up your resume and job strategy.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsBookModalOpen(true)}
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
                              Booked on{" "}
                              {new Date(booking.createdAt).toLocaleDateString()}
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
          </div>

          {/* Right Column: Available Open Slots & Info (1 col) */}
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
                          onClick={() => setIsBookModalOpen(true)}
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
        </div>
      </div>

      {/* Book Consultation Modal */}
      {isBookModalOpen && (
        <BookConsultationModal
          isOpen={isBookModalOpen}
          onClose={() => {
            setIsBookModalOpen(false);
            refetchBookings();
            refetchSlots();
          }}
        />
      )}
    </main>
  );
}
