"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  ArrowRight,
  X,
  Briefcase,
  Bot,
  Users,
  Award,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  currentLimit?: number;
  activeCount?: number;
  title?: string;
  description?: string;
}

export function UpgradePlanModal({
  isOpen,
  onClose,
  onUpgrade,
  currentLimit = 1,
  activeCount = 1,
  title = "Active Job Posting Limit Reached",
  description,
}: UpgradePlanModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle ESC key when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const handleGoToUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    }
    onClose();
    router.push("/dashboard/billing");
  };

  const handleManageJobs = () => {
    onClose();
    router.push("/dashboard");
  };

  const percentage = Math.min(100, Math.round((activeCount / Math.max(currentLimit, 1)) * 100));

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100005 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 my-auto text-left flex flex-col"
          >
            {/* Top Glowing Ambient Header */}
            <div className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-900 to-[#0A54B1] p-6 sm:p-7 text-white">
              {/* Subtle background glow effect */}
              <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#52CEDE]/20 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Badge & Icon */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#52CEDE] to-[#0A54B1] p-0.5 shadow-lg shadow-sky-500/30 flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-slate-950/40 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-cyan-300" />
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Employer Plan Limit
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5 font-medium">
                    Free Tier: {currentLimit} Active Job Posting Allowed
                  </p>
                </div>
              </div>

              {/* Main Heading */}
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
                {description ||
                  `You've reached your limit of ${currentLimit} simultaneous active job posting. Upgrade your plan to publish multiple listings, screen candidates with AI, and scale your hiring team.`}
              </p>

              {/* Real-time Usage Progress Track */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-300" />
                    Active Job Slots Used
                  </span>
                  <span className="text-amber-300 font-extrabold">
                    {activeCount} of {currentLimit} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-linear-to-r from-amber-400 to-rose-400 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Modal Body: Feature Value Highlights */}
            <div className="p-6 sm:p-7 space-y-4 bg-white">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                What you unlock when you upgrade:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Benefit 1 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50/50 border border-slate-100 hover:border-sky-100 transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#0A54B1] flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Post 10+ Jobs Simultaneously
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Never pause existing campaigns to hire for multiple roles.
                    </p>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-100 hover:border-cyan-100 transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      AI Candidate Screening
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Auto-score applicants & shortlist top fits in seconds.
                    </p>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Unmasked Full Profiles
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Access verified direct emails, phone numbers & CVs.
                    </p>
                  </div>
                </div>

                {/* Benefit 4 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/50 border border-slate-100 hover:border-amber-100 transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Featured Portal Badging
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Get 2.5x more views and higher qualified applicant flow.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pro Plan Suggestion Card */}
              <div className="p-4 rounded-2xl bg-linear-to-r from-sky-50 via-indigo-50 to-purple-50 border border-sky-100/80 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">
                      Recommended: Employer Pro Plan
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-blue-600 text-white">
                      Popular
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    10 Active Job Postings • Full AI Candidate Screening • Unmasked Portfolios
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-slate-900">$149</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">/month</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <Button
                  onClick={handleGoToUpgrade}
                  className="w-full h-12 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-sky-500/20 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View Employer Plans & Upgrade</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleManageJobs}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#0A54B1] transition-colors cursor-pointer py-1.5"
                  >
                    <span>Manage or archive existing jobs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer py-1.5"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
