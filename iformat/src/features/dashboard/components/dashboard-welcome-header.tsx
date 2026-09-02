"use client";

import Link from "next/link";
import { PlusCircle, Sparkles, CreditCard, ShieldCheck } from "lucide-react";

interface DashboardWelcomeHeaderProps {
  userName?: string;
  isEmployer: boolean;
  emailVerified?: boolean;
  onPostJobClick?: () => void;
}

export function DashboardWelcomeHeader({
  userName,
  isEmployer,
  emailVerified,
  onPostJobClick,
}: DashboardWelcomeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
      {/* Decorative subtle background accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-50 text-[#0A54B1] border border-blue-100">
            {isEmployer ? "Employer Workspace" : "Candidate Hub"}
          </span>
          {emailVerified && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome back, {userName || "Professional"}!
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
          {isEmployer
            ? "Manage your active job postings, review top candidates, and screen talent with AI."
            : "Track your job applications, enhance your CV, and generate tailored cover letters."}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap shrink-0 relative z-10">
        {isEmployer ? (
          <button
            onClick={onPostJobClick}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Post New Job
          </button>
        ) : (
          <Link href="/job-assistant">
            <button className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer">
              <Sparkles className="w-4 h-4" /> AI Career Assistant
            </button>
          </Link>
        )}
        <Link href="/dashboard/billing">
          <button className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer">
            <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Billing & Plan
          </button>
        </Link>
      </div>
    </div>
  );
}
