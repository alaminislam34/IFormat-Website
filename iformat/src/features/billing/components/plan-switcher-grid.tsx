"use client";

import React, { useState } from "react";
import { Check, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanDTO, UserSubscriptionDetailsDTO } from "@/types/api";
import { BookConsultationModal } from "@/features/services/components/book-consultation-modal";
import { buildBrandingPlanCards, findDbPlanFor } from "@/features/billing/utils/branding-plans";

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
  actionLoading,
  onUpgradePlan,
}: PlanSwitcherGridProps) {
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [commitmentInterval, setCommitmentInterval] = useState<"6_MONTHS" | "12_MONTHS">("6_MONTHS");
  const currentPlan = subscription?.plan;

  return (
    <div id="available-plans" className="space-y-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B1528] tracking-tight">
            Available Membership & Branding Tiers
          </h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-xl">
            Choose the membership that fits your career or hiring roadmap. Upgrade anytime with instant activation.
          </p>
        </div>

        {/* 6 vs 12 Months Commitment Switcher */}
        <div className="p-1 bg-slate-100 rounded-2xl inline-flex items-center border border-slate-200 self-start sm:self-auto shrink-0 shadow-xs">
          <button
            type="button"
            onClick={() => setCommitmentInterval("6_MONTHS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              commitmentInterval === "6_MONTHS"
                ? "bg-white text-[#0A54B1] shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            6 Months
          </button>
          <button
            type="button"
            onClick={() => setCommitmentInterval("12_MONTHS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              commitmentInterval === "12_MONTHS"
                ? "bg-white text-[#0A54B1] shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            12 Months
          </button>
        </div>
      </div>

      {/* 4 Cards Exactly Matching Website & Figma Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {buildBrandingPlanCards(plans).map((pkg) => {
          const isPopular = pkg.isPopular;
          const matchedDbPlan = findDbPlanFor(pkg, plans);

          const isCurrent = Boolean(
            subscription?.isPaidActive &&
              currentPlan &&
              (currentPlan.code === pkg.code ||
                currentPlan.code?.replace("BRANDING_", "") === pkg.code.replace("BRANDING_", "") ||
                currentPlan.name?.toLowerCase().trim() === pkg.name.toLowerCase().trim() ||
                (matchedDbPlan && currentPlan.id === matchedDbPlan.id))
          );

          const planIdToTrigger = matchedDbPlan?.id || plans.find((p) => p.priceInCents > 0)?.id;
          const isThisLoading = actionLoading === planIdToTrigger || actionLoading === pkg.code;

          // Same monthly price for 6 and 12 months commitment (admin-managed DB price)
          const displayPrice = pkg.price;

          return (
            <div
              key={pkg.code}
              className={`w-full rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative bg-white ${
                isCurrent
                  ? "border-2 border-[#0A54B1] shadow-[0_0_30px_rgba(10,84,177,0.18)] ring-2 ring-[#0A54B1]/30"
                  : isPopular
                  ? "border-2 border-[#00D2EE] shadow-[0_0_30px_rgba(0,210,238,0.22)] ring-1 ring-[#00D2EE]/40"
                  : "border border-slate-100 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Badge */}
              {isCurrent ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#0A54B1] text-white text-xs font-bold tracking-wide shadow-xs whitespace-nowrap flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Current Plan</span>
                </div>
              ) : isPopular ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00D2EE] text-white text-xs font-bold tracking-wide shadow-xs whitespace-nowrap">
                  Most Popular
                </div>
              ) : null}

              <div>
                {/* Title */}
                <h4 className="text-2xl font-bold text-[#0B1528] tracking-tight">{pkg.name}</h4>

                {/* Subtitle */}
                <p className="text-xs text-[#64748B] mt-2 mb-6 min-h-9.5 leading-relaxed">
                  {pkg.subtitle}
                </p>

                {/* Price Tag */}
                <div className="mb-6 min-h-16 flex flex-col justify-start">
                  {displayPrice ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-[#0B1528] tracking-tight">
                          {displayPrice}
                        </span>
                        {pkg.priceSuffix && (
                          <span className="text-xs font-semibold text-[#64748B]">
                            {pkg.priceSuffix}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#0A54B1] border border-sky-200/60">
                          {commitmentInterval === "12_MONTHS" ? "12 Months Commitment" : "6 Months Commitment"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="h-10" />
                  )}
                </div>

                {/* Feature List */}
                <div>
                  <ul className="space-y-3.5">
                    {pkg.features.map((feature, fIdx) => (
                      <li key={`feat-${fIdx}`} className="flex items-start gap-2.5 text-xs leading-snug">
                        <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#0099FF] stroke-[2.5]" />
                        <span className="text-[#334155] font-medium leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Button */}
              <div className="pt-8 mt-auto">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full h-11 rounded-xl text-xs font-extrabold bg-sky-50 text-[#0A54B1] border border-sky-200/80 flex items-center justify-center gap-1.5 cursor-default shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#0A54B1]" />
                    <span>Current Active Plan</span>
                  </button>
                ) : pkg.isContactUs ? (
                  <button
                    onClick={() => setIsConsultModalOpen(true)}
                    className="w-full h-11 rounded-xl text-xs font-bold transition-all bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white shadow-md shadow-sky-500/20 cursor-pointer active:scale-98"
                  >
                    {pkg.buttonText}
                  </button>
                ) : (
                  <Button
                    onClick={() => {
                      if (planIdToTrigger) {
                        onUpgradePlan(planIdToTrigger);
                      }
                    }}
                    disabled={isThisLoading}
                    className={`w-full h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isPopular
                        ? "bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white shadow-md shadow-sky-500/20 border-0 active:scale-95"
                        : "bg-[#0B1528] hover:bg-[#16233B] text-white active:scale-95"
                    }`}
                  >
                    {isThisLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      pkg.buttonText || "Get Started"
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Consultation Modal for Contact Us */}
      {isConsultModalOpen && (
        <BookConsultationModal
          isOpen={isConsultModalOpen}
          onClose={() => setIsConsultModalOpen(false)}
        />
      )}
    </div>
  );
}
