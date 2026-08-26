"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Loader2,
  DollarSign,
  Send,
  Sparkles,
} from "lucide-react";
import { useAvailableSlots, useBookSlot } from "@/hooks";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BookConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle?: string;
}

export function BookConsultationModal({
  isOpen,
  onClose,
  serviceTitle = "1-on-1 Career Strategy Consultation",
}: BookConsultationModalProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { data: slots, isLoading: loadingSlots } = useAvailableSlots();
  const bookSlotMutation = useBookSlot();

  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to book a consultation session");
      router.push("/login?redirect=/services");
      return;
    }

    if (!selectedSlotId && (!slots || slots.length === 0)) {
      toast.error("No consultation slots currently open. Please check back soon!");
      return;
    }

    const slotToBook = selectedSlotId || (slots && slots[0]?.id);
    if (!slotToBook) {
      toast.error("Please select a valid consultation time slot");
      return;
    }

    bookSlotMutation.mutate(
      {
        slotId: slotToBook,
        notes: notes || `Requested consultation for ${serviceTitle}`,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success("Consultation session confirmed!");
          setTimeout(() => {
            setIsSuccess(false);
            onClose();
          }, 2500);
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to confirm booking. Please try again.");
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="consultation-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            key="consultation-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          <motion.div
            key="consultation-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 z-10 overflow-hidden border border-slate-100"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0A54B1]">
                  Expert Consultation
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{serviceTitle}</h3>
                <p className="text-xs text-slate-500">Book a personalized 1-on-1 strategy session with an industry executive.</p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Session Confirmed!</h4>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  A confirmation email with session links has been sent to <strong>{user?.email}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                {/* Available Slots */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0A54B1]" /> Select Time Slot
                    </span>
                    {slots && slots.length > 0 && (
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                        {slots.length} available
                      </span>
                    )}
                  </label>

                  {loadingSlots ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Loading available schedule...
                    </div>
                  ) : !slots || slots.length === 0 ? (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">Next Available Live Session: Tomorrow, 3:00 PM (EST)</p>
                      <p className="text-slate-500">Live booking queue is active. Your request will be instantly locked in.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {slots.map((slot) => {
                        const isSelected = selectedSlotId === slot.id;
                        return (
                          <div
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                              isSelected
                                ? "bg-blue-50/80 border-[#0A54B1] text-slate-900 font-semibold"
                                : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900">{slot.title}</div>
                              <div className="flex items-center gap-2 text-slate-500">
                                <span>{new Date(slot.startTime).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>
                                  {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-[#0A54B1]">
                                ${(slot.priceInCents / 100).toFixed(0)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Consultation Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    What would you like to focus on? (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Preparing for Senior Full-Stack technical interview, review portfolio and resume structure..."
                    className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <Button
                    type="submit"
                    disabled={bookSlotMutation.isPending}
                    className="bg-[#0A54B1] hover:bg-[#0A54B1]/95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {bookSlotMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Confirming...
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" /> Confirm Consultation
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
