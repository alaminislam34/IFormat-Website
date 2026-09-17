"use client";

import React, { useState } from "react";
import {
  Video,
  Clock,
  User,
  CalendarCheck,
  AlertCircle,
  Plus,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  ShoppingBag,
  FileText,
  CreditCard,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { useCancelBooking } from "@/hooks";
import Link from "next/link";
import { BookingDTO } from "@/types/api";
import { CancelBookingModal } from "./cancel-booking-modal";

interface CandidateBookingsListProps {
  bookings: BookingDTO[];
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
  const cancelBookingMutation = useCancelBooking();
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<BookingDTO | null>(null);

  const handleCancelBooking = async (bookingId: string, reason: string) => {
    try {
      await cancelBookingMutation.mutateAsync({ bookingId, reason });
      toast.success("Cancellation request submitted! Awaiting administrator confirmation.");
      setSelectedBookingForCancel(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit cancellation request.");
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            My Service Orders & Consultations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your purchased career packages, project briefs, and advisory sessions.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200/60">
          {bookings.length} {bookings.length === 1 ? "Order" : "Orders"}
        </span>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm animate-pulse flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#0A54B1] border-t-transparent animate-spin" />
          <span className="font-semibold text-slate-500">Loading your service orders...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
          <p className="text-xs font-semibold">Failed to load orders.</p>
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
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800">No Service Orders Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              You haven&apos;t ordered any professional career services or booked sessions yet.
              Explore our ATS resume and personal branding packages to accelerate your job search.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#0A54B1] hover:bg-[#0A54B1]/95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" /> Explore Career Packages
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {bookings.map((booking) => {
            const isPackageOrder = !booking.slotId;
            const title = booking.serviceTitle || booking.slot?.title || "Career Service Package";

            const isConfirmed = booking.status === "CONFIRMED";
            const isCompleted = booking.status === "COMPLETED";
            const isCancelled = booking.status === "CANCELLED";
            const isPending = booking.status === "PENDING";

            const priceNum = booking.priceInCents ?? booking.slot?.priceInCents;
            const priceFormatted = priceNum
              ? `$${(priceNum / 100).toFixed(2)} USD`
              : "Paid";

            return (
              <div
                key={booking.id}
                className="py-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        isConfirmed
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isPending
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : isCompleted
                          ? "bg-blue-50 text-[#0A54B1] border-blue-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {isConfirmed
                        ? "In Progress"
                        : isPending
                        ? "Cancellation Pending"
                        : booking.status}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {isPackageOrder ? "Service Package" : "Consultation Slot"}
                    </span>

                    <span className="text-xs text-slate-400 font-medium">
                      Ordered on {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {isPackageOrder ? (
                      <ShoppingBag className="w-4 h-4 text-[#0A54B1] shrink-0" />
                    ) : (
                      <Video className="w-4 h-4 text-[#0A54B1] shrink-0" />
                    )}
                    <span>{title}</span>
                  </h3>

                  {/* Pending Cancellation Alert Banner */}
                  {isPending && (
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 font-medium">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Cancellation request submitted. Awaiting administrator review and confirmation.
                      </span>
                    </div>
                  )}

                  {/* Contact Phone & Advisor */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    {booking.clientPhone && (
                      <div className="flex items-center gap-1.5 text-cyan-800 font-medium">
                        <Phone className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Phone: {booking.clientPhone}</span>
                      </div>
                    )}
                    {booking.slot?.advisor && (
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <User className="w-3.5 h-3.5" />
                        <span>Advisor: {booking.slot.advisor.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Requirements / Brief */}
                  {booking.requirements && (
                    <div className="text-xs text-slate-700 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100/80 leading-relaxed font-medium space-y-1">
                      <div className="font-bold text-[#0A54B1] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Project Brief & Requirements:
                      </div>
                      <p className="whitespace-pre-wrap text-slate-600">{booking.requirements}</p>
                    </div>
                  )}

                  {/* Session Notes */}
                  {booking.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 leading-relaxed font-medium">
                      <span className="font-bold text-slate-800">Notes:</span> {booking.notes}
                    </p>
                  )}
                </div>

                {/* Price & Action */}
                <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-emerald-700 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200">
                      {priceFormatted}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">
                      {booking.paymentStatus || "PAID"}
                    </span>
                  </div>

                  {isConfirmed && (
                    <button
                      onClick={() => setSelectedBookingForCancel(booking)}
                      className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-slate-200/80 hover:border-rose-200 transition-colors cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}

                  {isPending && (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> Pending Admin Review
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Professional Cancellation Modal */}
      <CancelBookingModal
        isOpen={Boolean(selectedBookingForCancel)}
        onClose={() => setSelectedBookingForCancel(null)}
        booking={selectedBookingForCancel}
        onConfirm={handleCancelBooking}
        isLoading={cancelBookingMutation.isPending}
      />
    </div>
  );
}
