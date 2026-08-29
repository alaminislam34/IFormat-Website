"use client";

import React from "react";
import { Briefcase, Check, Bot, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanDTO } from "@/types/api";

interface AdminPlanCardProps {
  plan: PlanDTO;
  onEdit: (plan: PlanDTO) => void;
  onToggleActive: (plan: PlanDTO) => void;
}

export function AdminPlanCard({ plan, onEdit, onToggleActive }: AdminPlanCardProps) {
  const isFree = plan.priceInCents === 0;

  return (
    <div
      className={`bg-slate-900/90 border rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all ${
        plan.isActive
          ? "border-slate-800/80 hover:border-slate-700"
          : "border-rose-950/60 opacity-60 bg-slate-950/40"
      }`}
    >
      <div>
        {/* Top Bar with Badges & Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-sky-400 border border-slate-700">
            {plan.code}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              {plan.billingInterval}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                plan.isActive
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              {plan.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-black text-white">{plan.name}</h3>
        <p className="text-slate-400 text-xs mt-1 leading-relaxed min-h-8">
          {plan.description || "Platform access tier"}
        </p>

        <div className="my-5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">
              {isFree ? "Free" : `$${(plan.priceInCents / 100).toFixed(0)}`}
            </span>
            {!isFree && (
              <span className="text-xs text-slate-400 font-medium">
                /{plan.billingInterval === "YEARLY" ? "yr" : "mo"}
              </span>
            )}
          </div>
        </div>

        {/* Entitlements Checklist */}
        <div className="space-y-2.5 pt-4 border-t border-slate-800/80 text-xs">
          {plan.maxActiveJobs !== null && plan.maxActiveJobs !== undefined && (
            <div className="flex items-center gap-2 text-slate-300">
              <Briefcase className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>
                {plan.maxActiveJobs === 0
                  ? "No job postings"
                  : `${plan.maxActiveJobs} Active Job Limit`}
              </span>
            </div>
          )}

          {plan.maxApplicationsPerMonth !== null && plan.maxApplicationsPerMonth !== undefined && (
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {plan.maxApplicationsPerMonth === 999999
                  ? "Unlimited Applications"
                  : `${plan.maxApplicationsPerMonth} Apps / Month`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-slate-300">
            <Bot
              className={`w-3.5 h-3.5 ${
                plan.aiScreeningEnabled ? "text-emerald-400" : "text-slate-600"
              }`}
            />
            <span className={plan.aiScreeningEnabled ? "font-semibold text-white" : "text-slate-500"}>
              AI Screening: {plan.aiScreeningEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Eye
              className={`w-3.5 h-3.5 ${
                plan.unmaskedApplicantProfiles ? "text-emerald-400" : "text-slate-600"
              }`}
            />
            <span className={plan.unmaskedApplicantProfiles ? "font-semibold text-white" : "text-slate-500"}>
              Contact Masking: {plan.unmaskedApplicantProfiles ? "Unmasked" : "Masked"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
        <Button
          onClick={() => onEdit(plan)}
          variant="outline"
          size="sm"
          className="flex-1 border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold h-8 rounded-xl cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1.5 text-sky-400" /> Edit Plan
        </Button>
        <Button
          onClick={() => onToggleActive(plan)}
          variant="ghost"
          size="sm"
          className={`h-8 px-2.5 rounded-xl text-xs font-medium cursor-pointer ${
            plan.isActive
              ? "text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
              : "text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300"
          }`}
          title={plan.isActive ? "Deactivate Plan" : "Activate Plan"}
        >
          {plan.isActive ? "Disable" : "Enable"}
        </Button>
      </div>
    </div>
  );
}
