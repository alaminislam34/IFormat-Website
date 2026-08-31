import React from "react";

interface PricingHeaderProps {
  billingInterval?: "MONTHLY" | "YEARLY";
  setBillingInterval?: (interval: "MONTHLY" | "YEARLY") => void;
}

export function PricingHeader({
  billingInterval,
  setBillingInterval,
}: PricingHeaderProps) {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-4">
      <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
        Our Best Pricing Options
      </h2>

      <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
        Choose a comprehensive package tailored to your career stage, or select individual services
        to target specific needs.
      </p>

      {billingInterval && setBillingInterval && (
        <div className="pt-2 flex items-center justify-center">
          <div className="p-1 bg-slate-100 rounded-2xl inline-flex items-center border border-slate-200">
            <button
              onClick={() => setBillingInterval("MONTHLY")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                billingInterval === "MONTHLY"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("YEARLY")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingInterval === "YEARLY"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-sky-100 text-[#0A54B1]">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
