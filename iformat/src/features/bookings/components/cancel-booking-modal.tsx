"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ShoppingBag,
  Video,
  X,
  Loader2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingDTO } from "@/types/api";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDTO | null;
  onConfirm: (bookingId: string, reason: string) => Promise<void>;
  isLoading: boolean;
}

export function CancelBookingModal({
  isOpen,
  onClose,
  booking,
  onConfirm,
  isLoading,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const isPackageOrder = !booking.slotId;
  const title = booking.serviceTitle || booking.slot?.title || "Service Order";
  const priceNum = booking.priceInCents ?? booking.slot?.priceInCents;
  const priceFormatted = priceNum
    ? `$${(priceNum / 100).toFixed(2)} USD`
    : "Paid";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim() || reason.trim().length < 5) {
      setValidationError("Please enter a valid reason (at least 5 characters).");
      return;
    }

    setValidationError(null);
    await onConfirm(booking.id, reason.trim());
    setReason("");
  };

  const handleClose = () => {
    if (isLoading) return;
    setReason("");
    setValidationError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 uppercase tracking-wider">
                Order Cancellation
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Request Cancellation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit your cancellation request for administrator review.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details Brief Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Item / Service:</span>
            <span className="font-bold text-slate-800 text-xs">{priceFormatted}</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
            {isPackageOrder ? (
              <ShoppingBag className="w-4 h-4 text-[#0A54B1] shrink-0" />
            ) : (
              <Video className="w-4 h-4 text-[#0A54B1] shrink-0" />
            )}
            <span className="truncate">{title}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Ordered on {new Date(booking.createdAt).toLocaleDateString()} • Payment Status: {booking.paymentStatus || "PAID"}
          </p>
        </div>

        {/* Process Notice Box */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Pending Admin Confirmation:</span> Upon submission, your order status will be updated to <span className="font-bold text-amber-800">&quot;Cancellation Pending&quot;</span> while our administration team reviews your reason and confirms the cancellation.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="cancel-reason" className="text-slate-700 font-semibold block">
                Reason for Cancellation <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {reason.length}/500
              </span>
            </div>
            <textarea
              id="cancel-reason"
              rows={3}
              maxLength={500}
              required
              disabled={isLoading}
              placeholder="Please explain why you need to cancel (e.g., schedule conflict, ordered wrong package, personal emergency)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (validationError) setValidationError(null);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#0A54B1] resize-none transition-all leading-relaxed"
            />
            {validationError && (
              <p className="text-rose-600 text-[11px] font-medium mt-1">
                {validationError}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={handleClose}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer text-xs h-9 px-4 rounded-xl"
            >
              Keep Order
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Submit Cancellation Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
