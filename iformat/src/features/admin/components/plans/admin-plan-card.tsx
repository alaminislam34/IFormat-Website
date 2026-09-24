"use client";

import React from "react";
import { Briefcase, Check, Bot, Eye, Edit3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanDTO } from "@/types/api";

interface AdminPlanCardProps {
  plan: PlanDTO;
  onEdit: (plan: PlanDTO) => void;
  onToggleActive: (plan: PlanDTO) => void;
}

export function AdminPlanCard({ plan, onEdit, onToggleActive }: AdminPlanCardProps) {
  const isEnterprise =
    plan.code?.toUpperCase().includes("ENTERPRISE") ||
    plan.name?.toLowerCase().includes("enterprise");
  const isFree = plan.priceInCents === 0 && !isEnterprise;

  return (
    <div
      className={`rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all ${
        plan.isActive
          ? "bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md"
          : "bg-slate-50/80 border border-slate-200 opacity-60 shadow-xs"
      }`}
    >
      <div>
        {/* Top Bar with Badges & Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
              {plan.code}
            </span>
            {plan.code === "FREE_TIER" && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                ⭐ Default Free Plan
              </span>
            )}
            {isEnterprise && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                🏢 Enterprise Tier
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 capitalize">
              {plan.billingInterval?.toLowerCase()}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                plan.isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {plan.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
        <p className="text-slate-500 text-xs mt-1 leading-relaxed min-h-8">
          {plan.description || "Platform access tier"}
        </p>

        <div className="my-5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">
              {isEnterprise
                ? "Custom Quote"
                : isFree
                ? "Free"
                : `$${(plan.priceInCents / 100).toFixed(0)}`}
            </span>
            {!isFree && !isEnterprise && (
              <span className="text-xs text-slate-500 font-medium">
                /{plan.billingInterval === "YEARLY" ? "yr" : "mo"}
              </span>
            )}
            {isEnterprise && (
              <span className="text-xs text-slate-500 font-medium ml-1">
                (Contact Sales)
              </span>
            )}
          </div>
        </div>

        {/* Stripe Sync Badge */}
        {plan.stripePriceId && (
          <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-xs font-medium text-sky-700">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            <span>Stripe Live: {plan.stripePriceId}</span>
          </div>
        )}

        {/* Entitlements & Features Checklist */}
        <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs">
          {(() => {
            const rawFeat = plan.customFeatures as any;
            const featuresList = Array.isArray(rawFeat)
              ? rawFeat
              : Array.isArray(rawFeat?.features)
              ? rawFeat.features
              : [];
            const maxAi = rawFeat?.maxAiGenerations;

            return (
              <>
                {maxAi !== undefined && (
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>
                      {maxAi === null
                        ? "Unlimited AI Generations"
                        : `${maxAi} AI Generations / mo`}
                    </span>
                  </div>
                )}
                {featuresList.length > 0 ? (
                  featuresList.map((feat: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{typeof feat === "string" ? feat : String(feat)}</span>
                    </div>
                  ))
                ) : (
                  <>
                    {plan.maxActiveJobs !== null && plan.maxActiveJobs !== undefined && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Briefcase className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>
                          {plan.maxActiveJobs === 0
                            ? "No job postings"
                            : `${plan.maxActiveJobs} Active Job Limit`}
                        </span>
                      </div>
                    )}

                    {plan.maxApplicationsPerMonth !== null && plan.maxApplicationsPerMonth !== undefined && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          {plan.maxApplicationsPerMonth === 999999
                            ? "Unlimited Applications"
                            : `${plan.maxApplicationsPerMonth} Apps / Month`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-600">
                      <Bot
                        className={`w-3.5 h-3.5 ${
                          plan.aiScreeningEnabled ? "text-emerald-600" : "text-slate-400"
                        }`}
                      />
                      <span className={plan.aiScreeningEnabled ? "font-semibold text-slate-800" : "text-slate-500"}>
                        AI Screening: {plan.aiScreeningEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Eye
                        className={`w-3.5 h-3.5 ${
                          plan.unmaskedApplicantProfiles ? "text-emerald-600" : "text-slate-400"
                        }`}
                      />
                      <span className={plan.unmaskedApplicantProfiles ? "font-semibold text-slate-800" : "text-slate-500"}>
                        Contact Masking: {plan.unmaskedApplicantProfiles ? "Unmasked" : "Masked"}
                      </span>
                    </div>
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
        <Button
          onClick={() => onEdit(plan)}
          variant="outline"
          size="sm"
          className="flex-1 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold h-8 rounded-xl cursor-pointer shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
          <span>Edit Plan</span>
        </Button>
        <Button
          onClick={() => onToggleActive(plan)}
          variant="ghost"
          size="sm"
          className={`h-8 px-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
            plan.isActive
              ? "text-rose-600 hover:bg-rose-50"
              : "text-emerald-600 hover:bg-emerald-50"
          }`}
          title={plan.isActive ? "Deactivate Plan" : "Activate Plan"}
        >
          {plan.isActive ? "Disable" : "Enable"}
        </Button>
      </div>
    </div>
  );
}
