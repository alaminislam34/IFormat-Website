"use client";

import React from "react";
import {
  Briefcase,
  FileText,
  Bot,
  Eye,
  Sparkles,
  CheckCircle2,
  Percent,
  Layers,
  Crown,
} from "lucide-react";
import { UserSubscriptionDetailsDTO } from "@/types/api";
import { useAuthStore } from "@/stores/use-auth-store";

interface QuotaMetersProps {
  subscription: UserSubscriptionDetailsDTO | null;
  userRole?: string;
}

export function QuotaMeters({ subscription, userRole }: QuotaMetersProps) {
  const { user, role: authRole } = useAuthStore();
  const effectiveRole = (userRole || user?.role || authRole || "candidate").toLowerCase();
  const isEmployer = effectiveRole === "employer";

  const currentPlan = subscription?.plan;
  const usage = subscription?.usage;
  const isPaid = subscription?.isPaidActive || false;

  // Employer Quotas
  const maxJobs = currentPlan?.maxActiveJobs ?? 1;
  const activeJobs = usage?.jobsPostedCount ?? 0;
  const jobPercentage =
    maxJobs === 999999 ? 10 : Math.min(100, Math.round((activeJobs / maxJobs) * 100));

  // Candidate Quotas
  const aiUsed = usage?.aiGenerationsCount ?? 0;
  const maxAi = isPaid ? 999999 : 5;
  const aiPercentage =
    maxAi === 999999 ? 10 : Math.min(100, Math.round((aiUsed / maxAi) * 100));

  const maxApps = currentPlan?.maxApplicationsPerMonth ?? (isPaid ? 999999 : 10);
  const monthlyApps = usage?.applicationsCount ?? 0;
  const appPercentage =
    maxApps === 999999 ? 10 : Math.min(100, Math.round((monthlyApps / maxApps) * 100));

  const discountPercent = currentPlan?.consultationDiscountPercent ?? 0;
  const hasUnlimitedVault = Boolean(currentPlan?.unlimitedCvTemplates || isPaid);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Entitlement & Quota Usage
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEmployer
              ? "Real-time tracking of job listings, candidate screening, and recruitment limits."
              : "Real-time tracking of AI career generation tokens, monthly applications, and tier benefits."}
          </p>
        </div>
      </div>

      {isEmployer ? (
        /* EMPLOYER METERS */
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
                {maxJobs === 999999
                  ? "Unlimited active jobs enabled"
                  : `${Math.max(0, maxJobs - activeJobs)} remaining slots`}
              </p>
            </div>
          </div>

          {/* AI Screening Engine */}
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
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
              Automated resume ranking, match scoring & candidate summaries.
            </p>
          </div>

          {/* Contact Discovery */}
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

          {/* Featured Job Placement */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Featured Placement
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Crown className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-1">
                {currentPlan?.featuredJobPlacement ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Priority Boost Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    Standard Placement
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-medium mt-5 leading-relaxed">
              Top rank on job feeds and candidate recommendations.
            </p>
          </div>
        </div>
      ) : (
        /* CANDIDATE METERS */
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* AI Career Generations */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  AI Career Assistant
                </span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0A54B1] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-black text-slate-900">{aiUsed}</span>
                <span className="text-xs text-slate-400 font-bold">
                  / {maxAi === 999999 ? "∞ Unlimited" : `${maxAi}/mo`}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-1.5">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    aiPercentage >= 90
                      ? "bg-linear-to-r from-amber-500 to-rose-500"
                      : "bg-linear-to-r from-[#52CEDE] to-[#0A54B1]"
                  }`}
                  style={{ width: `${Math.max(5, aiPercentage)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {maxAi === 999999
                  ? "Unlimited AI resumes & cover letters"
                  : `${Math.max(0, maxAi - aiUsed)} generations left this cycle`}
              </p>
            </div>
          </div>

          {/* Monthly Submissions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Job Applications
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
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
                      : "bg-linear-to-r from-emerald-400 to-teal-600"
                  }`}
                  style={{ width: `${Math.max(5, appPercentage)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {maxApps === 999999
                  ? "Unlimited direct job applications"
                  : "Resets every 30-day billing cycle"}
              </p>
            </div>
          </div>

          {/* 1:1 Consultation Discount */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Advisory Discount
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Percent className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-1">
                {discountPercent > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    {discountPercent}% Off All Sessions
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    Standard Rates
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-medium mt-5 leading-relaxed">
              {discountPercent > 0
                ? "Applied to 1:1 executive coaching and strategy."
                : "Upgrade to Pro to save up to 20% on career consultations."}
            </p>
          </div>

          {/* Resume Cloud Vault */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Cloud Resume Vault
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-1">
                {hasUnlimitedVault ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Unlimited Versions
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    1 Active Draft
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-medium mt-5 leading-relaxed">
              {hasUnlimitedVault
                ? "Multiple tailored resume drafts with ATS export."
                : "Save 1 draft at a time. Upgrade for unlimited resumes."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
