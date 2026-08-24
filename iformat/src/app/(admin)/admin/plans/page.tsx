"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Sparkles,
  Check,
  Shield,
  Briefcase,
  Bot,
  Eye,
  Loader2,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { membershipService } from "@/services/membership.service";
import { PlanDTO } from "@/types/api";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [audienceTab, setAudienceTab] = useState<"EMPLOYER" | "CANDIDATE">("EMPLOYER");

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await membershipService.getPlans();
      if (res) setPlans(Array.isArray(res) ? res : (res as any).plans || []);
    } catch (err: any) {
      console.warn("Could not load plans:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const filteredPlans = plans.filter(
    (p) => p.targetAudience === audienceTab || p.targetAudience === "BOTH"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Membership Plans & Entitlements
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Configure subscription tiers, feature quotas, active job caps, and AI screening permissions.
          </p>
        </div>

        {/* Audience Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          <button
            onClick={() => setAudienceTab("EMPLOYER")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              audienceTab === "EMPLOYER"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Employer Plans
          </button>
          <button
            onClick={() => setAudienceTab("CANDIDATE")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              audienceTab === "CANDIDATE"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Candidate Plans
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 font-medium">
          No plans found for {audienceTab}.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPlans.map((plan) => {
            const isFree = plan.priceInCents === 0;

            return (
              <div
                key={plan.id}
                className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-sky-400 border border-slate-700">
                      {plan.code}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      {plan.billingInterval}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
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
                    {plan.maxActiveJobs !== null && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Briefcase className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>
                          {plan.maxActiveJobs === 0
                            ? "No job postings"
                            : `${plan.maxActiveJobs} Active Job Limit`}
                        </span>
                      </div>
                    )}

                    {plan.maxApplicationsPerMonth !== null && (
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
                      <Bot className={`w-3.5 h-3.5 ${plan.aiScreeningEnabled ? "text-emerald-400" : "text-slate-600"}`} />
                      <span className={plan.aiScreeningEnabled ? "font-semibold text-white" : "text-slate-500"}>
                        AI Candidate Screening: {plan.aiScreeningEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Eye className={`w-3.5 h-3.5 ${plan.unmaskedApplicantProfiles ? "text-emerald-400" : "text-slate-600"}`} />
                      <span className={plan.unmaskedApplicantProfiles ? "font-semibold text-white" : "text-slate-500"}>
                        Contact Masking: {plan.unmaskedApplicantProfiles ? "Unmasked" : "Masked"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="block w-full py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-center text-[11px] font-bold">
                    System Tier Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
