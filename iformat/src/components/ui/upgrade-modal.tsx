"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Crown, CheckCircle2, ArrowRight, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  title = "Unlock Unlimited AI Generations",
  message = "You've reached your free monthly limit of 5 AI generations. Upgrade to Pro for unlimited AI cover letters, resume optimization, and instant interview matching.",
}: UpgradeModalProps) {
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
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Icon */}
            <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-amber-500 to-amber-300 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Crown className="w-8 h-8" />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                {message}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2.5 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited AI CV Builder & Resume Tailoring</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited AI Cover Letters & Cold Outreach Emails</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Priority AI Screening with verified recruiter reach</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Link href="/dashboard/billing" onClick={onClose} className="block w-full">
                <Button className="w-full h-11 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> View Pro Plans & Upgrade
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
