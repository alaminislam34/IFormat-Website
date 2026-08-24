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
          className="rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 h-11 px-4 shadow-xs cursor-pointer transition-all hover:border-slate-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-sky-500" : "text-slate-400"}`} />
          <span>{refreshing ? "Updating..." : "Refresh"}</span>
        </Button>

        <a href="#available-plans">
          <Button className="bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 h-11 px-5 shadow-lg shadow-sky-500/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore Plans</span>
          </Button>
        </a>
      </div>
    </div>
  );
}
