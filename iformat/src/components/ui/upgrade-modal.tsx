"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, CheckCircle2, X, Zap, Sparkles, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/use-auth-store";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  features?: string[];
  role?: "candidate" | "employer";
}

export function UpgradeModal({
  isOpen,
  onClose,
  title,
  message,
  features,
  role: propRole,
}: UpgradeModalProps) {
  const { user, role: authRole } = useAuthStore();
  const effectiveRole =
    propRole ||
    (user?.role?.toLowerCase() === "employer" || authRole === "employer"
      ? "employer"
      : "candidate");

  const isEmployer = effectiveRole === "employer";

  // Default content based on user role
  const modalTitle =
    title ||
    (isEmployer
      ? "Scale Your Hiring Pipeline with Pro"
      : "Unlock Unlimited AI Generations & Job Applications");

  const modalMessage =
    message ||
    (isEmployer
      ? "You've reached your free job posting or screening quota. Upgrade to unlock multi-job publishing, automated AI applicant screening, and unmasked candidate reach."
      : "You've reached your free monthly limit of 5 AI generations. Upgrade to unlock unlimited AI resumes, cover letters, and unlimited job submissions.");

  const modalFeatures =
    features && features.length > 0
      ? features
      : isEmployer
      ? [
          "Unlimited Active Job Postings across all categories",
          "AI Applicant Screening & Candidate Match Scoring",
          "Direct Candidate Discovery with Unmasked Email & Phone",
          "Priority Featured Placement in Job Search Results",
        ]
      : [
          "Unlimited AI CV Builder & Resume Tailoring (All Templates)",
          "Unlimited AI Cover Letters & Outreach Messages",
          "Unlimited Direct Job Applications per month",
          "Dedicated Career Advisory, Brand Strategy & Coaching Support",
        ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 sm:p-8 space-y-6 text-center"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Icon */}
            <div
              className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-lg ${
                isEmployer
                  ? "bg-linear-to-tr from-sky-600 to-blue-500 text-white shadow-sky-500/25"
                  : "bg-linear-to-tr from-amber-500 to-amber-300 text-white shadow-amber-500/20"
              }`}
            >
              {isEmployer ? <Briefcase className="w-8 h-8" /> : <Crown className="w-8 h-8" />}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide uppercase bg-sky-50 text-[#0A54B1]">
                <Sparkles className="w-3.5 h-3.5" />
                {isEmployer ? "Employer Recruitment Tier" : "Pro Membership Access"}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                {modalTitle}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                {modalMessage}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2.5 border border-slate-100">
              {modalFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Link href="/dashboard/billing" onClick={onClose} className="block w-full">
                <Button className="w-full h-11 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> View Plans & Upgrade
                </Button>
              </Link>
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer py-1"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
