"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CompanyOnboardingSuccess() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-6"
    >
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">
        Onboarding Complete!
      </h3>
      <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
        Your company details have been successfully saved. Let&apos;s go to your new workspace.
      </p>
      <div className="space-y-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full h-12 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-sm font-bold rounded-xl shadow-md hover:opacity-95 transition-all cursor-pointer"
        >
          Go to Employer Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/job-portal"
          className="inline-flex items-center justify-center gap-2 w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl transition-all cursor-pointer"
        >
          Post a Job Now
        </Link>
      </div>
    </motion.div>
  );
}
