"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, LogIn, UserPlus, X, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  redirectUrl?: string;
}

export function AuthPromptModal({
  isOpen,
  onClose,
  title = "Sign in to Generate with AI",
  description = "Create a free account or sign in to generate and save your customized AI resume, cover letter, or outreach email.",
  redirectUrl = "/job-assistant",
}: AuthPromptModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
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
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0A54B1] flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                {description}
              </p>
            </div>

            {/* Perks */}
            <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>5 free AI generations every month</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Auto-save all your tailored CVs and cover letters</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant ATS keyword optimization & formatting</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <Link
                href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`}
                onClick={onClose}
                className="block w-full"
              >
                <Button className="w-full h-11 bg-[#0A54B1] hover:bg-[#08428C] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" /> Create Free Account
                </Button>
              </Link>
              <Link
                href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
                onClick={onClose}
                className="block w-full"
              >
                <Button
                  variant="outline"
                  className="w-full h-11 border-slate-200 bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-900 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-slate-600" /> Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
