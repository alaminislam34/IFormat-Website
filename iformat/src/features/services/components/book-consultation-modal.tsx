"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { data: slots, isLoading: loadingSlots } = useAvailableSlots();
  const bookSlotMutation = useBookSlot();

  useEffect(() => {
    setMounted(true);
  }, []);

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

    const slotIdToBook = selectedSlotId || (slots && slots[0]?.id);
    if (!slotIdToBook) {
      toast.error("Please select a session timing slot");
      return;
    }

    try {
      await bookSlotMutation.mutateAsync({
        slotId: slotIdToBook,
        notes: notes.trim() || undefined,
      });

      setIsSuccess(true);
      toast.success("Consultation booked successfully!");
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to book session");
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
        >
          {/* Backdrop click-away */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
              <form onSubmit={handleBooking} className="space-y-5">
                {/* Available Slots Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#0A54B1]" /> Select Time Slot
                  </label>

                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-6 text-slate-400 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Checking available advisors...
                    </div>
                  ) : !slots || slots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                      No public open calendar slots at the moment. You can still submit your request below and an advisor will contact you within 24 hours.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
                      {slots.map((slot) => {
                        const dateStr = new Date(slot.startTime).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        });
                        const timeStr = new Date(slot.startTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const isSelected = selectedSlotId === slot.id;

                        return (
                          <div
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? "bg-blue-50/80 border-[#0A54B1] text-[#0A54B1] shadow-xs"
                                : "bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Clock className="w-4 h-4 text-[#0A54B1]" />
                              <div>
                                <div className="text-xs font-bold">{dateStr} at {timeStr}</div>
                                <div className="text-[10px] text-slate-500">Advisor: {slot.advisor?.name || "Career Specialist"}</div>
                              </div>
                            </div>

                            <span className="text-xs font-black">
                              {slot.priceInCents ? `$${(slot.priceInCents / 100).toFixed(0)}` : "Free"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    What would you like to focus on? (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. CV review for Senior Product Manager, salary negotiation strategies, executive presence..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={bookSlotMutation.isPending}
                    className="w-full h-11 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {bookSlotMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming Appointment...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Confirm Consultation Booking</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
