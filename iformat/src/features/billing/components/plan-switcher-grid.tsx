"use client";

import React, { useState } from "react";
import { Check, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanDTO, UserSubscriptionDetailsDTO } from "@/types/api";
import { BookConsultationModal } from "@/features/services/components/book-consultation-modal";

interface PlanSwitcherGridProps {
  plans: PlanDTO[];
  subscription: UserSubscriptionDetailsDTO | null;
  userRole?: string;
  actionLoading: string | null;
  onUpgradePlan: (planId: string) => void;
}

const EXACT_BRANDING_PLANS = [
  {
    code: "BRANDING_STARTER",
    name: "Starter",
    subtitle: "Maintain brand activity and engagement.",
    price: "$149",
    priceSuffix: "/month",
    isPopular: false,
    buttonText: "Get Started",
    features: [
      "Weekly engagement (4)",
      "Email/Whatsapp support",
      "Connections Strategy",
      "Reporting & analytics",
      "Job market advise",
    ],
  },
  {
    code: "BRANDING_PROFESSIONAL",
    name: "Professional",
    subtitle: "High-touch leadership advisory & brand authority",
    price: "$449",
    priceSuffix: "/month",
    isPopular: true,
    buttonText: "Get Started",
    features: [
      "Dedicated consultant",
      "1:1 Brand Strategy",
      "Recruiter Engagement",
      "Brand Updates/Edits",
      "Interview Coaching",
      "Salary Negotiation",
    ],
  },
  {
    code: "BRANDING_GROW",
    name: "Grow",
    subtitle: "For career pivoters and specialized Brand visibility and job market alignment",
    price: "$299",
    priceSuffix: "/package",
    isPopular: false,
    buttonText: "Get Started",
    features: [
      "Weekly engagement (4)",
      "Email/Whatsapp support",
      "Connections Strategy",
      "Reporting & analytics",
      "Recruiter messaging",
      "Quarterly Linkdin Optimization",
    ],
  },
  {
    code: "BRANDING_ENTERPRISE",
    name: "Enterprise Solutions",
    subtitle: "Designed for career changers and niche pros to boost your brand and meet market needs",
    price: "",
    isPopular: false,
    buttonText: "Contact US",
    isContactUs: true,
    features: [
      "Outplacement Support",
      "Startup Brand Equity",
      "Stakeholder Brand Equity",
      "Investor Brand Engagement",
      "Workforce Transitions",
      "Corporate Brand Advisory",
    ],
  },
];

export function PlanSwitcherGrid({
  plans,
  subscription,
  actionLoading,
  onUpgradePlan,
}: PlanSwitcherGridProps) {
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const currentPlan = subscription?.plan;

  return (
    <div id="available-plans" className="space-y-8 pt-6">
      <div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B1528] tracking-tight">
          Available Membership & Branding Tiers
        </h3>
        <p className="text-xs text-[#64748B] mt-1 max-w-xl">
          Choose the membership that fits your career or hiring roadmap. Upgrade anytime with instant activation.
        </p>
      </div>

      {/* 4 Cards Exactly Matching Website & Figma Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {EXACT_BRANDING_PLANS.map((pkg) => {
          const isPopular = pkg.isPopular;
          const matchedDbPlan = plans.find(
            (p) =>
              p.code === pkg.code ||
              p.code?.replace("BRANDING_", "") === pkg.code.replace("BRANDING_", "") ||
              p.name.toLowerCase().trim() === pkg.name.toLowerCase().trim()
          );

          const isCurrent = Boolean(
            currentPlan &&
              (currentPlan.code === pkg.code ||
                currentPlan.code?.replace("BRANDING_", "") === pkg.code.replace("BRANDING_", "") ||
                currentPlan.name?.toLowerCase().trim() === pkg.name.toLowerCase().trim() ||
                (matchedDbPlan && currentPlan.id === matchedDbPlan.id))
          );

          const planIdToTrigger = matchedDbPlan?.id || plans.find((p) => p.priceInCents > 0)?.id;
          const isThisLoading = actionLoading === planIdToTrigger || actionLoading === pkg.code;

          return (
            <div
              key={pkg.code}
              className={`w-full rounded-[24px] p-8 flex flex-col justify-between transition-all duration-300 relative bg-white ${
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
                <p className="text-xs text-[#64748B] mt-2 mb-6 min-h-[38px] leading-relaxed">
                  {pkg.subtitle}
                </p>

                {/* Price Tag */}
                <div className="mb-6 min-h-[44px] flex items-baseline">
                  {pkg.price ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-[#0B1528] tracking-tight">
                        {pkg.price}
                      </span>
                      {pkg.priceSuffix && (
                        <span className="text-xs font-semibold text-[#64748B]">
                          {pkg.priceSuffix}
                        </span>
                      )}
                    </div>
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
