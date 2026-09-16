"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Minus,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  Crown,
  Briefcase,
  Bot,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TierPlan {
  code: string;
  name: string;
  price: string;
  cadence: string;
  badge?: string;
  isPopular?: boolean;
}

const TIERS: TierPlan[] = [
  {
    code: "FREE",
    name: "Free Tier",
    price: "$0",
    cadence: "forever",
  },
  {
    code: "BRANDING_STARTER",
    name: "Starter",
    price: "$149",
    cadence: "per month",
  },
  {
    code: "BRANDING_GROW",
    name: "Grow",
    price: "$299",
    cadence: "package / mo",
  },
  {
    code: "BRANDING_PROFESSIONAL",
    name: "Professional",
    price: "$449",
    cadence: "per month",
    badge: "Most Popular",
    isPopular: true,
  },
  {
    code: "BRANDING_ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    cadence: "tailored",
  },
];

interface FeatureRow {
  name: string;
  description?: string;
  free: string | boolean;
  starter: string | boolean;
  grow: string | boolean;
  professional: string | boolean;
  enterprise: string | boolean;
}

interface FeatureSection {
  category: string;
  icon: React.ReactNode;
  features: FeatureRow[];
}

const COMPARISON_SECTIONS: FeatureSection[] = [
  {
    category: "AI Career Assistant & Job Search",
    icon: <Bot className="w-4 h-4 text-[#0A54B1]" />,
    features: [
      {
        name: "AI Resume & CV Tailoring",
        description: "Generate and fine-tune ATS-optimized resumes targeted to job descriptions.",
        free: "5 gens / month",
        starter: "Unlimited",
        grow: "Unlimited",
        professional: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "AI Cover Letter & Outreach Generator",
        description: "Role-specific cover letters and personalized recruiter messaging.",
        free: "5 gens / month",
        starter: "Unlimited",
        grow: "Unlimited",
        professional: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "Cloud Resume Vault & Formats",
        description: "Save drafts, format presets, and export print-ready PDFs.",
        free: "1 Active Draft",
        starter: "Unlimited Vault",
        grow: "Unlimited Vault",
        professional: "Unlimited Vault",
        enterprise: "Unlimited Vault",
      },
      {
        name: "Monthly Job Applications",
        description: "Submit applications directly through the iFormat job portal.",
        free: "10 / month",
        starter: "Unlimited",
        grow: "Unlimited",
        professional: "Unlimited",
        enterprise: "Unlimited",
      },
    ],
  },
  {
    category: "Career Advisory & Personal Branding",
    icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
    features: [
      {
        name: "1:1 Career Consultation Discount",
        description: "Automatic savings on expert career strategy and advisory sessions.",
        free: false,
        starter: "10% Off",
        grow: "15% Off",
        professional: "20% Off",
        enterprise: "Included",
      },
      {
        name: "LinkedIn Profile Optimization",
        description: "Strategic positioning to attract top headhunters and hiring managers.",
        free: false,
        starter: "Strategy Guide",
        grow: "Quarterly Audit",
        professional: "Full Optimization & Edits",
        enterprise: "Executive Advisory",
      },
      {
        name: "Dedicated Consultant & Recruiter Strategy",
        description: "Direct outreach advice and professional connection tactics.",
        free: false,
        starter: "Email / WhatsApp",
        grow: "Connections Strategy",
        professional: "Dedicated 1:1 Advisor",
        enterprise: "Executive Partner",
      },
      {
        name: "Interview Coaching & Salary Negotiation",
        description: "Live behavioral practice, mock interviews, and compensation frameworks.",
        free: false,
        starter: false,
        grow: "Frameworks & Guides",
        professional: "1:1 Live Simulation",
        enterprise: "Executive Suite",
      },
    ],
  },
  {
    category: "Employer & Recruitment Suite",
    icon: <Briefcase className="w-4 h-4 text-sky-600" />,
    features: [
      {
        name: "Active Job Listings",
        description: "Simultaneous open positions published on iFormat job board.",
        free: "1 Active Job",
        starter: "5 Active Jobs",
        grow: "10 Active Jobs",
        professional: "25 Active Jobs",
        enterprise: "Unlimited",
      },
      {
        name: "AI Applicant Screening Engine",
        description: "Automated candidate ranking, resume parsing, and match scoring.",
        free: false,
        starter: true,
        grow: true,
        professional: "Priority AI Engine",
        enterprise: "Custom Algorithms",
      },
      {
        name: "Unmasked Candidate Contacts",
        description: "Instant access to direct email, phone, and unmasked profiles.",
        free: false,
        starter: false,
        grow: true,
        professional: true,
        enterprise: "Full Data Export",
      },
      {
        name: "Featured Job Placement",
        description: "Top-of-feed spotlighting on job search feeds and email digests.",
        free: false,
        starter: false,
        grow: "Standard Boost",
        professional: "High-Priority Boost",
        enterprise: "Dedicated Spotlight",
      },
    ],
  },
];

interface PricingComparisonTableProps {
  currentPlanCode?: string;
  onUpgradePlan?: (planCode: string) => void;
  actionLoading?: string | null;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function PricingComparisonTable({
  currentPlanCode,
  onUpgradePlan,
  actionLoading,
  collapsible = false,
  defaultExpanded = true,
}: PricingComparisonTableProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const renderValue = (val: string | boolean) => {
    if (typeof val === "boolean") {
      return val ? (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300">
          <Minus className="w-3.5 h-3.5" />
        </span>
      );
    }
    return <span className="text-xs font-bold text-slate-800">{val}</span>;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-50 text-[#0A54B1] mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Feature Breakdown
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Compare Platform Plans & Entitlements
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Detailed breakdown of AI tools, career branding perks, and employer recruitment quotas
            across every tier.
          </p>
        </div>

        {collapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                Collapse Table <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                View Full Comparison <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Expandable Comparison Content */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            {/* Table Head: Plans Header */}
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-5 pl-6 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/3">
                  Tier Features
                </th>
                {TIERS.map((tier) => {
                  const isCurrent = currentPlanCode === tier.code;
                  return (
                    <th
                      key={tier.code}
                      className={`p-5 text-center transition-colors ${
                        tier.isPopular ? "bg-sky-50/40 relative" : ""
                      }`}
                    >
                      {tier.badge && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0A54B1] text-white mb-1.5 shadow-xs">
                          <Crown className="w-2.5 h-2.5" /> {tier.badge}
                        </span>
                      )}
                      <div className="text-sm font-extrabold text-slate-900">{tier.name}</div>
                      <div className="text-lg font-black text-slate-900 mt-0.5">
                        {tier.price}
                        <span className="text-[10px] font-medium text-slate-400 ml-1">
                          {tier.cadence}
                        </span>
                      </div>

                      {/* CTA in table header */}
                      <div className="mt-3">
                        {isCurrent ? (
                          <span className="inline-block px-3 py-1 rounded-lg text-[11px] font-black bg-emerald-100 text-emerald-800">
                            Current Plan
                          </span>
                        ) : tier.code === "FREE" ? (
                          <span className="inline-block px-3 py-1 rounded-lg text-[11px] font-bold text-slate-400 bg-slate-100">
                            Free Forever
                          </span>
                        ) : tier.code === "BRANDING_ENTERPRISE" ? (
                          <Link href="/contact">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-[11px] font-bold rounded-lg cursor-pointer hover:bg-slate-100"
                            >
                              Contact Sales
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            size="sm"
                            disabled={actionLoading === tier.code}
                            onClick={() => onUpgradePlan?.(tier.code)}
                            className={`h-8 text-[11px] font-extrabold rounded-lg shadow-xs cursor-pointer ${
                              tier.isPopular
                                ? "bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white hover:opacity-95"
                                : "bg-slate-900 hover:bg-slate-800 text-white"
                            }`}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            {actionLoading === tier.code ? "Loading..." : "Upgrade"}
                          </Button>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body: Sections & Rows */}
            <tbody className="divide-y divide-slate-100">
              {COMPARISON_SECTIONS.map((section, sIdx) => (
                <React.Fragment key={sIdx}>
                  {/* Category Section Header */}
                  <tr className="bg-slate-100/60 font-black text-slate-900">
                    <td
                      colSpan={6}
                      className="py-3 px-6 text-xs uppercase tracking-wider flex items-center gap-2"
                    >
                      {section.icon}
                      <span>{section.category}</span>
                    </td>
                  </tr>

                  {/* Feature Rows */}
                  {section.features.map((feat, fIdx) => (
                    <tr
                      key={fIdx}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="p-4 pl-6 align-middle">
                        <div className="text-xs font-extrabold text-slate-900 group-hover:text-[#0A54B1] transition-colors">
                          {feat.name}
                        </div>
                        {feat.description && (
                          <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {feat.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center align-middle">{renderValue(feat.free)}</td>
                      <td className="p-4 text-center align-middle">{renderValue(feat.starter)}</td>
                      <td className="p-4 text-center align-middle">{renderValue(feat.grow)}</td>
                      <td className="p-4 text-center align-middle bg-sky-50/30 font-bold">
                        {renderValue(feat.professional)}
                      </td>
                      <td className="p-4 text-center align-middle">{renderValue(feat.enterprise)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
