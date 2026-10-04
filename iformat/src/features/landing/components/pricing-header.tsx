import React from "react";
import { SectionHeader } from "@/components/ui/section-header";

interface PricingHeaderProps {
  commitmentInterval: "6_MONTHS" | "12_MONTHS";
  setCommitmentInterval: (interval: "6_MONTHS" | "12_MONTHS") => void;
}

export function PricingHeader({
  commitmentInterval,
  setCommitmentInterval,
}: PricingHeaderProps) {
  return (
    <SectionHeader
      title="Our Best Pricing Options"
      description="Choose a comprehensive package tailored to your career stage. All memberships feature flexible 6-month or 12-month commitments for sustained career elevation."
      maxWidth="max-w-3xl"
    >
      <div className="flex items-center justify-center mt-6">
        <div className="p-1.5 bg-slate-100/90 rounded-2xl inline-flex items-center border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => setCommitmentInterval("6_MONTHS")}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              commitmentInterval === "6_MONTHS"
                ? "bg-white text-[#0A54B1] shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            6 Months Commitment
          </button>
          <button
            type="button"
            onClick={() => setCommitmentInterval("12_MONTHS")}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              commitmentInterval === "12_MONTHS"
                ? "bg-white text-[#0A54B1] shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>12 Months Commitment</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-[#004AAD]">
              Save 15%
            </span>
          </button>
        </div>
      </div>
    </SectionHeader>
  );
}
