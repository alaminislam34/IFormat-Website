"use client";

import React from "react";
import { Briefcase, FileText, Bot, Eye, Sparkles, CheckCircle2 } from "lucide-react";
import { UserSubscriptionDetailsDTO } from "@/types/api";

interface QuotaMetersProps {
  subscription: UserSubscriptionDetailsDTO | null;
}

export function QuotaMeters({ subscription }: QuotaMetersProps) {
  const currentPlan = subscription?.plan;
  const usage = subscription?.usage;

  const maxJobs = currentPlan?.maxActiveJobs ?? 1;
  const activeJobs = usage?.jobsPostedCount ?? 0;
  const jobPercentage = maxJobs === 999999 ? 10 : Math.min(100, Math.round((activeJobs / maxJobs) * 100));

  const maxApps = currentPlan?.maxApplicationsPerMonth ?? 5;
  const monthlyApps = usage?.applicationsCount ?? 0;
  const appPercentage = maxApps === 999999 ? 10 : Math.min(100, Math.round((monthlyApps / maxApps) * 100));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Entitlement & Quota Usage
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of active resource limits and plan feature entitlements.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Jobs Meter */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Active Job Postings
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-slate-900">{activeJobs}</span>
              <span className="text-xs text-slate-400 font-bold">
                / {maxJobs === 999999 ? "∞ Unlimited" : maxJobs}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-1.5">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  jobPercentage >= 90
                    ? "bg-linear-to-r from-amber-500 to-rose-500"
                    : "bg-linear-to-r from-sky-400 to-blue-600"
                }`}
                style={{ width: `${Math.max(5, jobPercentage)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {maxJobs === 999999 ? "Unlimited active jobs enabled" : `${maxJobs - activeJobs} remaining slots`}
            </p>
          </div>
        </div>

        {/* Monthly Applications Meter */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Monthly Submissions
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0A54B1] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-slate-900">{monthlyApps}</span>
              <span className="text-xs text-slate-400 font-bold">
                / {maxApps === 999999 ? "∞ Unlimited" : `${maxApps}/mo`}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-1.5">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  appPercentage >= 90
                    ? "bg-linear-to-r from-amber-500 to-rose-500"
                    : "bg-linear-to-r from-[#52CEDE] to-[#0A54B1]"
                }`}
                style={{ width: `${Math.max(5, appPercentage)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {maxApps === 999999 ? "Unlimited monthly applications" : "Resets every 30-day billing cycle"}
            </p>
          </div>
        </div>

        {/* AI Screening Meter */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                AI Screening Engine
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-1">
              {currentPlan?.aiScreeningEnabled ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-sky-50 text-[#0A54B1] border border-sky-200">
                  <span className="w-2 h-2 rounded-full bg-[#0A54B1] animate-pulse" />
                  Active & Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                  Free Tier (Disabled)
                </span>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium mt-5 leading-relaxed">
            Automated resume ranking, match scoring & applicant summary.
          </p>
        </div>

        {/* Candidate Contact Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Contact Discovery
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Eye className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-1">
              {currentPlan?.unmaskedApplicantProfiles ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Full Unmasked Access
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                  Masked (jo***@mail)
                </span>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium mt-5 leading-relaxed">
            Direct candidate email, phone & verified portfolio links.
          </p>
        </div>
      </div>
    </div>
  );
}
