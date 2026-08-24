"use client";

import React, { useState } from "react";
import { Check, Sparkles, Loader2, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanDTO, UserSubscriptionDetailsDTO } from "@/types/api";

interface PlanSwitcherGridProps {
  plans: PlanDTO[];
  subscription: UserSubscriptionDetailsDTO | null;
  userRole?: string;
  actionLoading: string | null;
  onUpgradePlan: (planId: string) => void;
}

export function PlanSwitcherGrid({
  plans,
  subscription,
  userRole,
  actionLoading,
  onUpgradePlan,
}: PlanSwitcherGridProps) {
  const currentPlan = subscription?.plan;
  const initialAudience = userRole?.toUpperCase() === "EMPLOYER" ? "EMPLOYER" : "CANDIDATE";
  const [selectedAudience, setSelectedAudience] = useState<"CANDIDATE" | "EMPLOYER">(initialAudience);

  const availablePlans = plans.filter(
    (p) => p.targetAudience === selectedAudience || p.targetAudience === "BOTH"
  );

  return (
    <div id="available-plans" className="space-y-6 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Available Membership Tiers
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Choose the membership that fits your career or hiring roadmap. Upgrade anytime with instant activation.
          </p>
        </div>

        {/* Audience Toggle */}
        <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 shrink-0">
          <button
            onClick={() => setSelectedAudience("CANDIDATE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedAudience === "CANDIDATE"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Candidate Plans
          </button>
          <button
            onClick={() => setSelectedAudience("EMPLOYER")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedAudience === "EMPLOYER"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Employer Plans
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availablePlans.map((plan) => {
          const isCurrent = currentPlan?.code === plan.code;
          const isFree = plan.priceInCents === 0;
          const isPro = plan.code.includes("PRO") || plan.code.includes("CAREER") || plan.code.includes("STARTER");
          const isEnterprise = plan.code.includes("ENTERPRISE");

          const features: string[] = [];
          if (typeof plan.maxActiveJobs === "number" && plan.maxActiveJobs > 0) {
            features.push(`${plan.maxActiveJobs === 999999 ? "Unlimited" : plan.maxActiveJobs} Active Job Listings`);
          }
          if (typeof plan.maxApplicationsPerMonth === "number") {
            features.push(
              plan.maxApplicationsPerMonth === 999999
                ? "Unlimited Job Applications"
                : `${plan.maxApplicationsPerMonth} Monthly Applications`
            );
          }
          if (plan.aiScreeningEnabled) {
            features.push("AI Candidate Screening & Match Scoring");
          }
          if (plan.featuredJobPlacement) {
            features.push("Priority Featured Job Placement");
          }
          if (plan.unmaskedApplicantProfiles) {
            features.push("Full Unmasked Contact Details");
          }
          if (plan.unlimitedCvTemplates) {
            features.push("Unlimited Professional CV Templates");
          }
          if (typeof plan.consultationDiscountPercent === "number" && plan.consultationDiscountPercent > 0) {
            features.push(`${plan.consultationDiscountPercent}% Off 1-on-1 Consultations`);
          }

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 relative ${
                isCurrent
                  ? "bg-white border-sky-500 ring-2 ring-sky-500/20 shadow-xl"
                  : isPro
                  ? "bg-slate-900 text-white border-slate-800 shadow-xl hover:shadow-2xl hover:scale-[1.01]"
                  : "bg-white border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Popular Badge */}
              {isPro && !isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-linear-to-r from-sky-500 to-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[11px] font-extrabold uppercase tracking-wider ${
                      isPro ? "text-sky-400" : "text-slate-500"
                    }`}
                  >
                    {plan.targetAudience === "EMPLOYER" ? "For Employers" : "For Candidates"}
                  </span>
                  {isCurrent && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200">
                      Current Plan
                    </span>
                  )}
                  {isEnterprise && !isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700">
                      Enterprise
                    </span>
                  )}
                </div>

                <h4 className={`text-2xl font-black tracking-tight ${isPro ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h4>
                <p className={`text-xs mt-1.5 min-h-8.5 leading-relaxed ${isPro ? "text-slate-300" : "text-slate-500"}`}>
                  {plan.description || "Comprehensive tools to elevate your outcomes."}
                </p>

                {/* Price Display */}
                <div className="my-6 flex items-baseline gap-1">
                  <span className={`text-4xl sm:text-5xl font-black tracking-tight ${isPro ? "text-white" : "text-slate-900"}`}>
                    {isFree ? "Free" : `$${(plan.priceInCents / 100).toFixed(0)}`}
                  </span>
                  {!isFree && (
                    <span className={`text-xs font-bold ${isPro ? "text-slate-400" : "text-slate-500"}`}>
                      /month
                    </span>
                  )}
                </div>

                {/* Features Checklist */}
                <div className={`space-y-3 pt-6 border-t ${isPro ? "border-slate-800" : "border-slate-100"}`}>
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isPro ? "text-sky-400" : "text-[#0A54B1]"
                        }`}
                      />
                      <span className={isPro ? "text-slate-200 font-medium" : "text-slate-700 font-medium"}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTA Button */}
              <div className="pt-8 mt-6">
                {isCurrent ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full h-12 rounded-2xl text-xs font-bold border-sky-200 bg-sky-50 text-sky-700 cursor-default"
                  >
                    Active Plan
                  </Button>
                ) : isFree ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full h-12 rounded-2xl text-xs font-bold text-slate-400 border-slate-200"
                  >
                    Default Free
                  </Button>
                ) : (
                  <Button
                    onClick={() => onUpgradePlan(plan.id)}
                    disabled={actionLoading === plan.id}
                    className={`w-full h-12 rounded-2xl text-xs font-extrabold shadow-lg cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                      isPro
                        ? "bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/25"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
                    }`}
                  >
                    {actionLoading === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Upgrade to {plan.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
