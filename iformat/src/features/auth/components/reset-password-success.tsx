"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ResetPasswordSuccess() {
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
      <h3 className="text-xl font-bold text-slate-900 mb-2">Password reset successful</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-sm">
        Your password has been successfully updated. You can now log in with your new credentials.
      </p>
      <button
        onClick={() => router.push("/login")}
        className="w-full h-12 bg-[#0A54B1] text-white text-sm font-bold rounded-xl flex items-center justify-center shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
      >
        Back to login
      </button>
    </motion.div>
  );
}
