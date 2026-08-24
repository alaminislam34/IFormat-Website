import React from "react";
import { Sparkles } from "lucide-react";

interface PricingHeaderProps {
  audience: "EMPLOYER" | "CANDIDATE";
  setAudience: (audience: "EMPLOYER" | "CANDIDATE") => void;
  billingInterval: "MONTHLY" | "YEARLY";
  setBillingInterval: (interval: "MONTHLY" | "YEARLY") => void;
}

export function PricingHeader({
  audience,
  setAudience,
  billingInterval,
  setBillingInterval,
}: PricingHeaderProps) {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-6">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-bold">
        <Sparkles className="w-3.5 h-3.5" />
        Transparent, Predictable Membership Pricing
      </div>

      <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
        Empower Your Career or Hiring with iFormat
      </h2>

      <p className="text-slate-600 text-base sm:text-lg">
        Whether you are seeking your next role or sourcing elite talent, choose the plan built for
        your exact growth trajectory.
      </p>

      {/* Toggles Container */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Audience Toggle */}
        <div className="p-1 bg-slate-100 rounded-2xl flex items-center border border-slate-200">
          <button
            onClick={() => setAudience("EMPLOYER")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              audience === "EMPLOYER"
                ? "bg-white text-slate-900 shadow-md shadow-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            For Companies & Employers
          </button>
          <button
            onClick={() => setAudience("CANDIDATE")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              audience === "CANDIDATE"
                ? "bg-white text-slate-900 shadow-md shadow-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            For Candidates & Job Seekers
          </button>
        </div>

        {/* Billing Interval Toggle */}
        <div className="p-1 bg-slate-100 rounded-2xl flex items-center border border-slate-200">
          <button
            onClick={() => setBillingInterval("MONTHLY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              billingInterval === "MONTHLY"
                ? "bg-white text-slate-900 shadow-md shadow-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("YEARLY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingInterval === "YEARLY"
                ? "bg-white text-slate-900 shadow-md shadow-slate-200"
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
    </div>
  );
}
