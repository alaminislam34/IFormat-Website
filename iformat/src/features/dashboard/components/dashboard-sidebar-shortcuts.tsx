"use client";

import Link from "next/link";
import { Sparkles, ExternalLink, Briefcase, UserCheck, Building } from "lucide-react";

export function DashboardSidebarShortcuts() {
  return (
    <div className="space-y-6">
      <div className="bg-linear-to-br from-blue-50/60 via-white to-slate-50/50 border border-blue-100/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0A54B1] text-white rounded-2xl shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">AI Career Suite</h3>
            <p className="text-xs text-slate-500 font-medium">ATS Resume & Document AI</p>
          </div>
        </div>

        <div className="space-y-2">
          <Link
            href="/job-assistant"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 transition-all border border-slate-200/80 group shadow-xs hover:border-blue-300"
          >
            <span className="text-xs font-bold text-slate-800 group-hover:text-[#0A54B1]">
              Generate Cover Letter
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0A54B1]" />
          </Link>
          <Link
            href="/job-assistant"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 transition-all border border-slate-200/80 group shadow-xs hover:border-blue-300"
          >
            <span className="text-xs font-bold text-slate-800 group-hover:text-[#0A54B1]">
              AI Outreach Email Generator
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0A54B1]" />
          </Link>
          <Link
            href="/job-assistant"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 transition-all border border-slate-200/80 group shadow-xs hover:border-blue-300"
          >
            <span className="text-xs font-bold text-slate-800 group-hover:text-[#0A54B1]">
              ATS Resume Optimizer & Builder
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0A54B1]" />
          </Link>
        </div>
      </div>

      {/* Quick Links Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100">
          Quick Navigation
        </h3>
        <div className="space-y-1.5 text-xs font-semibold">
          <Link
            href="/job-portal"
            className="flex items-center gap-2 text-slate-600 hover:text-[#0A54B1] p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Briefcase className="w-4 h-4 text-[#0A54B1]" />
            <span>Search & Explore Jobs</span>
          </Link>
          <Link
            href="/dashboard/bookings"
            className="flex items-center gap-2 text-slate-600 hover:text-[#0A54B1] p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-[#0A54B1]" />
            <span>My Consultations & Bookings</span>
          </Link>
          <Link
            href="/services"
            className="flex items-center gap-2 text-slate-600 hover:text-[#0A54B1] p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Building className="w-4 h-4 text-[#0A54B1]" />
            <span>Professional Branding Services</span>
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 text-slate-600 hover:text-[#0A54B1] p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#0A54B1]" />
            <span>Profile & Account Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
