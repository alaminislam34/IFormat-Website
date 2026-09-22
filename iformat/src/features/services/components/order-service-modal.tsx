"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Clock,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Phone,
  FileText,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { useCheckoutServiceOrder } from "@/hooks/mutations/use-booking-mutations";
import { ServiceProduct } from "./product-detail-modal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OrderServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceProduct | null;
}

export function OrderServiceModal({
  isOpen,
  onClose,
  service,
}: OrderServiceModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const checkoutMutation = useCheckoutServiceOrder();

  const [clientPhone, setClientPhone] = useState("");
  const [requirements, setRequirements] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill phone if user profile has it
  useEffect(() => {
    if (user?.phone && !clientPhone) {
      setClientPhone(user.phone);
    }
  }, [user, clientPhone]);

  if (!mounted || !service) return null;

  const priceFormatted = service.price || `$${service.priceNum || 299}`;
  const priceInCents = service.priceNum ? Math.round(service.priceNum * 100) : 29900;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in or register to place a service order");
      router.push(`/login?redirect=/services`);
      return;
    }

    if (!requirements.trim() || requirements.trim().length < 10) {
      toast.error("Please provide at least 10 characters detailing your project requirements or goals.");
      return;
    }

    try {
      await checkoutMutation.mutateAsync({
        serviceId: service.id,
        serviceTitle: service.title,
        priceInCents: priceInCents,
        clientPhone: clientPhone.trim() || undefined,
        requirements: requirements.trim(),
        notes: notes.trim() || undefined,
      });
    } catch (err: any) {
      // Toast handled by mutation
    }
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-99999 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
        >
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 my-8 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-linear-to-r from-slate-900 via-[#004AAD] to-slate-900 text-white shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(93,224,230,0.25),transparent_70%)]" />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-cyan-200 backdrop-blur-xs">
                      {service.category || "Service Package"}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-cyan-200">
                      <Clock className="w-3.5 h-3.5" /> {service.deliveryTime || "3-5 Days Turnaround"}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">{service.title}</h3>
                  <p className="text-xs text-slate-200 mt-1 line-clamp-1">{service.tagline}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Tag Pill */}
              <div className="relative z-10 mt-4 flex items-center justify-between pt-3 border-t border-white/15">
                <span className="text-xs text-slate-200 font-medium">One-Time Package Price</span>
                <span className="text-2xl font-black text-cyan-300">{priceFormatted}</span>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Authenticated Client Info Summary */}
              {isAuthenticated && user ? (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-[#004AAD] flex items-center justify-center font-black text-xs shrink-0">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">
                        {user.name}
                      </p>
                      <p className="text-slate-500 text-[11px]">{user.email}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Signed In
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/70 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-amber-900">Not Signed In</p>
                    <p className="text-amber-700 text-[11px] mt-0.5">
                      You will be asked to sign in or create an account before checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/login?redirect=/services`)}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shrink-0"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Client Contact Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#004AAD]" /> Contact Phone Number
                  <span className="text-slate-400 font-normal text-[11px]">(Optional for direct updates)</span>
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#004AAD] text-xs text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Project Brief / Requirements */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#004AAD]" /> Project Brief & Target Roles
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Min 10 characters</span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="E.g., Target industry: Fintech / AI Product Lead. Current resume link: linkedin.com/in/..., specific executive goals, or career transition timeline..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#004AAD] text-xs text-slate-800 placeholder:text-slate-400 leading-relaxed resize-none"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Additional Notes or File Links
                  <span className="text-slate-400 font-normal text-[11px] ml-1">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Google Drive, Dropbox, or any specific constraints..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#004AAD] text-xs text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Guarantee & Deliverables Preview */}
              <div className="p-3.5 rounded-2xl bg-cyan-50/50 border border-cyan-100 text-xs text-cyan-950 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#004AAD]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Satisfaction & ATS Compatibility Guarantee</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                  Our career specialists directly handle your order. You can track deliverables and status from your client dashboard at any time.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit Encrypted Stripe Payment</span>
                </div>

                <button
                  type="submit"
                  disabled={checkoutMutation.isPending}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-linear-to-r from-[#5DE0E6] to-[#004AAD] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Redirecting to Stripe Checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay {priceFormatted} & Place Order
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
