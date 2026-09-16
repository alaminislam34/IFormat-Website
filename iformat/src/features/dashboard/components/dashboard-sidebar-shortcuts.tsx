"use client";

import Link from "next/link";
import {
  Sparkles,
  ExternalLink,
  Briefcase,
  UserCheck,
  Building,
  Bot,
  PlusCircle,
  CreditCard,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface DashboardSidebarShortcutsProps {
  isEmployer?: boolean;
  onPostJobClick?: () => void;
}

export function DashboardSidebarShortcuts({
  isEmployer = false,
  onPostJobClick,
}: DashboardSidebarShortcutsProps) {
  if (isEmployer) {
    return (
      <div className="space-y-6">
        {/* Employer AI Suite Card */}
        <div className="bg-linear-to-br from-blue-50/70 via-white to-sky-50/50 border border-blue-100/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0A54B1] text-white rounded-2xl shadow-md shadow-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">AI Talent & ATS Hub</h3>
              <p className="text-xs text-slate-500 font-medium">Smart Candidate Screening</p>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/job-portal"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 transition-all border border-slate-200/80 group shadow-xs hover:border-blue-300"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#0A54B1] block">
                  AI Applicant Screening
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Auto match score & gap analysis
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0A54B1] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {onPostJobClick ? (
              <button
                type="button"
                onClick={onPostJobClick}
                className="w-full text-left flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 transition-all border border-slate-200/80 group shadow-xs hover:border-blue-300 cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#0A54B1] block">
                    Post a Job Opening
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Publish openings to top talent
                  </span>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-[#0A54B1]" />
              </button>
            ) : (
              <Link
                href="/job-portal"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 transition-all border border-slate-200/80 group shadow-xs hover:border-blue-300"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#0A54B1] block">
                    Post a Job Opening
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Publish openings to top talent
                  </span>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-[#0A54B1]" />
              </Link>
            )}

            <Link
              href="/company-details"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 transition-all border border-slate-200/80 group shadow-xs hover:border-blue-300"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#0A54B1] block">
                  Company Profile & Brand
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Verified employer credentials
                </span>
              </div>
              <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-[#0A54B1]" />
            </Link>
          </div>
        </div>

        {/* Employer Quick Navigation */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Employer Quick Links
          </h3>
          <div className="space-y-1.5 text-xs font-semibold">
            <Link
              href="/job-portal"
              className="flex items-center gap-2 text-slate-600 hover:text-[#0A54B1] p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Briefcase className="w-4 h-4 text-[#0A54B1]" />
              <span>Company Job Postings</span>
            </Link>
            <Link
              href="/company-details"
              className="flex items-center gap-2 text-slate-600 hover:text-[#0A54B1] p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Building className="w-4 h-4 text-[#0A54B1]" />
              <span>Company Details & Logo</span>
            </Link>
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-2 text-slate-600 hover:text-[#0A54B1] p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-[#0A54B1]" />
              <span>Membership & AI Screening Quota</span>
            </Link>
            <Link
              href="/services"
              className="flex items-center gap-2 text-slate-600 hover:text-[#0A54B1] p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-[#0A54B1]" />
              <span>Book Talent Advisory</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Candidate Side: Career Suite
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

      {/* Candidate Quick Links Card */}
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
