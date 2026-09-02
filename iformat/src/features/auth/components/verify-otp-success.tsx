"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function VerifyOtpSuccess() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center p-6 sm:p-8 pb-8 sm:pb-9 bg-slate-50/70 rounded-3xl border border-slate-100 shadow-xs space-y-5"
    >
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-xs">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Email Verified!</h3>
        <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
          Your account has been verified. Let&apos;s select your account type to customize your experience.
        </p>
      </div>
      <div className="w-full pt-2">
        <button
          onClick={() => router.push("/account-type")}
          className="w-full h-12 bg-[#0A54B1] hover:bg-[#08428c] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 hover:opacity-95 transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Choose Account Type</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
