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
      className="flex flex-col items-center text-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100"
    >
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Email Verified!</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-sm">
        Your account has been successfully verified. You can now proceed to set up your profile.
      </p>
      <button
        onClick={() => router.push("/account-type")}
        className="w-full h-12 bg-[#0A54B1] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
      >
        Continue to Dashboard <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
