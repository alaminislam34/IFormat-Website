import React from "react";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanDTO } from "@/types/api";

interface PricingCardProps {
  plan: PlanDTO;
  billingInterval: "MONTHLY" | "YEARLY";
  loadingPlanId: string | null;
  onSelectPlan: (plan: PlanDTO) => void;
}

export function PricingCard({
  plan,
  billingInterval,
  loadingPlanId,
  onSelectPlan,
}: PricingCardProps) {
  const isPro = plan.code.includes("PRO") || plan.code.includes("STARTER");
  const isEnterprise = plan.code.includes("ENTERPRISE");
  const isFree = plan.priceInCents === 0;

  // Calculate annual discount if yearly
  let displayPrice = plan.priceInCents / 100;
  if (billingInterval === "YEARLY" && !isFree) {
    displayPrice = Math.round(displayPrice * 0.8);
  }

  const features: string[] = [];
  if (plan.maxActiveJobs !== null) {
    features.push(
      plan.maxActiveJobs === 0
        ? "No job postings"
        : `${plan.maxActiveJobs === 999999 ? "Unlimited" : plan.maxActiveJobs} Active Job Postings`
    );
  }
  if (plan.maxApplicationsPerMonth !== null) {
    features.push(
      plan.maxApplicationsPerMonth === 999999
        ? "Unlimited Monthly Job Applications"
        : `${plan.maxApplicationsPerMonth} Applications / Month`
    );
  }
  if (plan.aiScreeningEnabled) {
    features.push("AI Candidate Screening & Match Scoring");
  }
  if (plan.featuredJobPlacement) {
    features.push("Priority Featured Job Placement");
  }
  if (plan.unmaskedApplicantProfiles) {
    features.push("Full Unmasked Candidate Contact Info");
  } else if (plan.targetAudience === "EMPLOYER") {
    features.push("Standard Applicant Inbox (Masked Contact)");
  }
  if (plan.unlimitedCvTemplates) {
    features.push("Unlimited Professional CV Templates");
  }
  if (plan.consultationDiscountPercent > 0) {
    features.push(`${plan.consultationDiscountPercent}% Off 1-on-1 Career Consultations`);
  }

  return (
    <div
      className={`w-full rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 relative ${
        isPro
          ? "bg-slate-900 text-white border-sky-500 ring-2 ring-sky-500/20 shadow-2xl scale-[1.02]"
          : "bg-white text-slate-900 border-slate-200/80 hover:border-slate-300 shadow-sm"
      }`}
    >
      {isPro && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-linear-to-r from-sky-500 to-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-md">
          Most Popular
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isPro ? "text-sky-400" : "text-slate-500"
            }`}
          >
            {plan.targetAudience === "EMPLOYER" ? "For Employers" : "For Candidates"}
          </span>
          {isEnterprise && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700">
              Enterprise
            </span>
          )}
        </div>

        <h3 className="text-2xl font-black">{plan.name}</h3>
        <p className={`text-xs mt-1.5 min-h-9 ${isPro ? "text-slate-300" : "text-slate-500"}`}>
          {plan.description || "Everything you need to advance your goals."}
        </p>

        <div className="my-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black">
              {isFree ? "Free" : `$${displayPrice}`}
            </span>
            {!isFree && (
              <span className={`text-xs font-semibold ${isPro ? "text-slate-400" : "text-slate-500"}`}>
                /month
              </span>
            )}
          </div>
          {billingInterval === "YEARLY" && !isFree && (
            <p className={`text-[11px] mt-1 font-medium ${isPro ? "text-sky-400" : "text-[#0A54B1]"}`}>
              Billed annually (${displayPrice * 12}/yr)
            </p>
          )}
        </div>

        {/* Feature List */}
        <div className={`space-y-3 pt-6 border-t ${isPro ? "border-slate-800" : "border-slate-100"}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isPro ? "text-slate-400" : "text-slate-500"}`}>
            Included Features:
          </p>

          <ul className="space-y-2.5">
            {features.map((feat, fIdx) => (
              <li key={`feat-${fIdx}-${feat.slice(0, 15)}`} className="flex items-start gap-2.5 text-xs">
                <Check
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isPro ? "text-sky-400" : "text-[#0A54B1]"
                  }`}
                />
                <span className={isPro ? "text-slate-200" : "text-slate-700"}>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-8">
        <Button
          onClick={() => onSelectPlan(plan)}
          disabled={loadingPlanId === plan.id}
          className={`w-full h-12 rounded-xl text-sm font-bold shadow-lg transition-all ${
            isPro
              ? "bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/25"
              : isFree
              ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
              : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
          }`}
        >
          {loadingPlanId === plan.id ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting...
            </span>
          ) : isFree ? (
            "Get Started Free"
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-1.5" />
              Upgrade to {plan.name}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
