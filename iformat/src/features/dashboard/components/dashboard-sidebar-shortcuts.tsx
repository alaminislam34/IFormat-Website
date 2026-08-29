"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ExternalLink, Briefcase, UserCheck, Building } from "lucide-react";

export function DashboardSidebarShortcuts() {
  return (
    <div className="space-y-6">
      {/* AI Assistant Quick Launcher */}
      <div className="bg-linear-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">AI Career Suite</h3>
            <p className="text-xs text-slate-400">Powered by OpenAI GPT-4o</p>
          </div>
        </div>

        <div className="space-y-2">
          <Link
            href="/job-assistant"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors border border-slate-700/50 group"
          >
            <span className="text-xs font-medium text-slate-200 group-hover:text-white">
              Generate Cover Letter
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
          </Link>
          <Link
            href="/job-assistant"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors border border-slate-700/50 group"
          >
            <span className="text-xs font-medium text-slate-200 group-hover:text-white">
              Cold Outreach Email Generator
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
          </Link>
          <Link
            href="/job-assistant"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors border border-slate-700/50 group"
          >
            <span className="text-xs font-medium text-slate-200 group-hover:text-white">
              ATS Resume Optimizer & Builder
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
          </Link>
        </div>
      </div>

      {/* Quick Links Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-white text-sm">Quick Navigation</h3>
        <div className="space-y-2 text-xs">
          <Link
            href="/job-portal"
            className="flex items-center gap-2 text-slate-300 hover:text-white py-1.5 transition-colors"
          >
            <Briefcase className="w-4 h-4 text-indigo-400" /> Browse Available Jobs
          </Link>
          <Link
            href="/dashboard/bookings"
            className="flex items-center gap-2 text-slate-300 hover:text-white py-1.5 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" /> My Consultations & Coaching
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-2 text-slate-300 hover:text-white py-1.5 transition-colors"
          >
            <Building className="w-4 h-4 text-amber-400" /> About iFormat Platform
          </Link>
        </div>
      </div>
    </div>
  );
}
