"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BillingHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

export function BillingHeader({ onRefresh, refreshing }: BillingHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200/60">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-3 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Home</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 max-w-2xl leading-relaxed">
          Manage your active membership tier, track real-time quota meters, and upgrade to unlock advanced AI screening.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Button
          onClick={onRefresh}
          disabled={refreshing}
          variant="outline"
          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 h-11 px-4 shadow-xs cursor-pointer transition-all hover:border-slate-300 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#0A54B1]" : "text-slate-400"}`} />
          <span>{refreshing ? "Updating..." : "Refresh"}</span>
        </Button>

        <a href="#available-plans">
          <Button className="bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 h-11 px-5 shadow-md shadow-sky-500/15 cursor-pointer transition-all hover:scale-[1.02] active:scale-95">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore Plans</span>
          </Button>
        </a>
      </div>
    </div>
  );
}
