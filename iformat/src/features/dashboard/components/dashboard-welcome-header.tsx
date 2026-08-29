"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, Sparkles, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardWelcomeHeaderProps {
  userName?: string;
  isEmployer: boolean;
  emailVerified?: boolean;
}

export function DashboardWelcomeHeader({
  userName,
  isEmployer,
  emailVerified,
}: DashboardWelcomeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {isEmployer ? "Employer Workspace" : "Candidate Hub"}
          </span>
          {emailVerified && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Welcome back, {userName || "Professional"}!
        </h1>
        <p className="text-sm text-slate-400">
          {isEmployer
            ? "Manage your active job postings, review top candidates, and screen talent with AI."
            : "Track your job applications, enhance your CV, and generate tailored cover letters."}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {isEmployer ? (
          <Link href="/company-details">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 cursor-pointer">
              <PlusCircle className="w-4 h-4 mr-2" /> Post New Job
            </Button>
          </Link>
        ) : (
          <Link href="/job-assistant">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 cursor-pointer">
              <Sparkles className="w-4 h-4 mr-2" /> AI Career Assistant
            </Button>
          </Link>
        )}
        <Link href="/dashboard/billing">
          <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-200 cursor-pointer">
            <CreditCard className="w-4 h-4 mr-2" /> Billing & Plan
          </Button>
        </Link>
      </div>
    </div>
  );
}
