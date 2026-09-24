"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
  LogIn,
} from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/api-client";
import { AuthPromptModal } from "@/components/auth/auth-prompt-modal";

interface BookConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle?: string;
  defaultSlotId?: string;
}

export function BookConsultationModal({
  isOpen,
  onClose,
  serviceTitle = "Free 1-on-1 Career Strategy Consultation",
}: BookConsultationModalProps) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill user data when authenticated
  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!phone.trim() || phone.trim().length < 6) {
      toast.error("Please enter a valid contact phone number");
      return;
    }

    if (!address.trim() || address.trim().length < 2) {
      toast.error("Please enter your address or location");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      toast.error("Please provide at least 10 characters describing your consultation focus");
      return;
    }

    if (!isAuthenticated) {
      toast.error("You must be logged in to book a consultation");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post("/bookings/free-consult", {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        description: description.trim(),
      });

      setIsSuccess(true);
      toast.success("Free consultation request submitted successfully!");

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        // Reset non-user fields
        setAddress("");
        setDescription("");
      }, 3000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit consultation request. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (!isAuthenticated) {
    const returnUrl =
      typeof window !== "undefined"
        ? window.location.search.includes("consult=open")
          ? `${window.location.pathname}${window.location.search}`
          : `${window.location.pathname}${window.location.search ? `${window.location.search}&` : "?"}consult=open`
        : "/?consult=open";

    return (
      <AuthPromptModal
        isOpen={isOpen}
        onClose={onClose}
        title="Sign In to Book a Free Consult"
        description="Please sign in or create an account to book your free career consultation session."
        redirectUrl={returnUrl}
      />
    );
  }

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-100000 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
        >
          {/* Backdrop click-away */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 overflow-hidden border border-slate-100 my-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-[#0A54B1] bg-sky-50 px-2.5 py-1 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-[#52CEDE]" /> Free 1-on-1 Consultation
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">{serviceTitle}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Share your career goals. An executive advisor will review and contact you directly.
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>


            {isSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Consultation Request Received!</h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong>{fullName}</strong>. Our senior consultant will contact you via phone or email within 24 hours to conduct your strategy session.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                    />
                  </div>
                </div>

                {/* Contact Phone & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 234-5678"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Address / Location <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. London, UK or New York, NY"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                    />
                  </div>
                </div>

                {/* Consultation Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> Description / Focus of Consultation <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about your target role, industry transition, CV review needs, or executive personal branding goals..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Book Free Consultation</span>
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
