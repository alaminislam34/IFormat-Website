import React from "react";
import { SectionHeader } from "@/components/ui/section-header";

interface PricingHeaderProps {
  billingInterval?: "MONTHLY" | "YEARLY";
  setBillingInterval?: (interval: "MONTHLY" | "YEARLY") => void;
}

export function PricingHeader({
  billingInterval,
  setBillingInterval,
}: PricingHeaderProps) {
  return (
    <SectionHeader
      title="Our Best Pricing Options"
      description="Choose a comprehensive package tailored to your career stage, or select individual services to target specific needs."
      maxWidth="max-w-3xl"
    >
      {billingInterval && setBillingInterval && (
        <div className="flex items-center justify-center">
          <div className="p-1 bg-slate-100 rounded-2xl inline-flex items-center border border-slate-200">
            <button
              onClick={() => setBillingInterval("MONTHLY")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingInterval === "MONTHLY"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("YEARLY")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingInterval === "YEARLY"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-sky-100 text-[#004AAD]">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      )}
    </SectionHeader>
  );
}
