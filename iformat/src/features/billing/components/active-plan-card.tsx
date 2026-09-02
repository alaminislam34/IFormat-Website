"use client";

import React from "react";
import { Zap, CreditCard, RotateCcw, XCircle, Loader2, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserSubscriptionDetailsDTO } from "@/types/api";

interface ActivePlanCardProps {
  subscription: UserSubscriptionDetailsDTO | null;
  actionLoading: string | null;
  onOpenPortal: () => void;
  onResumeSubscription: () => void;
  onOpenCancelModal: () => void;
}

export function ActivePlanCard({
  subscription,
  actionLoading,
  onOpenPortal,
  onResumeSubscription,
  onOpenCancelModal,
}: ActivePlanCardProps) {
  const currentPlan = subscription?.plan;
  const isFreePlan =
    !currentPlan ||
    (currentPlan.priceInCents ?? 0) === 0 ||
    currentPlan.code?.toLowerCase().includes("free") ||
    currentPlan.name?.toLowerCase().includes("free");
  const isPaidActive = Boolean(subscription?.isPaidActive && !isFreePlan);
  const cancelAtPeriodEnd = Boolean(subscription?.cancelAtPeriodEnd && isPaidActive);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-slate-900 via-[#0B1528] to-slate-950 text-white p-8 md:p-10 shadow-2xl border border-slate-800">
      <div className="absolute top-0 right-0 w-125 h-125 bg-linear-to-bl from-sky-500/15 via-blue-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-linear-to-tr from-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/25 flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Current Membership</span>
            </span>

            {isPaidActive ? (
              <span
                className={`px-3.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 border shadow-xs ${
                  cancelAtPeriodEnd
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    : "bg-sky-500/15 text-sky-300 border-sky-500/30"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cancelAtPeriodEnd ? "bg-amber-400" : "bg-sky-400 animate-pulse"}`} />
                <span>{cancelAtPeriodEnd ? "Cancels at Cycle End" : "Active & Auto-Renewing"}</span>
              </span>
            ) : (
              <span className="px-3.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-800/80 text-slate-300 border border-slate-700">
                Free Forever Tier
              </span>
            )}
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-linear-to-r from-white via-slate-100 to-sky-200 bg-clip-text text-transparent">
              {currentPlan?.name || "Candidate Basic"}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
              {currentPlan?.description ||
                "Standard job application access, professional AI templates, and candidate discovery tools."}
            </p>
          </div>

          {subscription?.currentPeriodEnd && isPaidActive && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>
                {cancelAtPeriodEnd ? "Access expires on: " : "Next scheduled renewal: "}
                <strong className="text-slate-200">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
          {isPaidActive ? (
            <>
              <Button
                onClick={onOpenPortal}
                disabled={actionLoading === "portal"}
                variant="outline"
                className="rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 h-11 px-5 shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border-0"
              >
                {actionLoading === "portal" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0A54B1]" />
                ) : (
                  <CreditCard className="w-4 h-4 text-[#0A54B1]" />
                )}
                <span>Manage Billing & Invoices</span>
              </Button>

              {cancelAtPeriodEnd ? (
                <Button
                  onClick={onResumeSubscription}
                  disabled={actionLoading === "resume"}
                  className="rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white flex items-center justify-center gap-2 text-xs font-bold h-11 px-5 shadow-md shadow-sky-500/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                >
                  {actionLoading === "resume" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  <span>Resume Subscription</span>
                </Button>
              ) : (
                <Button
                  onClick={onOpenCancelModal}
                  variant="ghost"
                  className="rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 text-xs font-bold h-10 px-4 cursor-pointer transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  <span>Cancel Subscription</span>
                </Button>
              )}
            </>
          ) : (
            <a href="#available-plans" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-bold text-xs sm:text-sm h-11 px-6 shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95">
                <Zap className="w-4 h-4 fill-white" />
                <span>Upgrade to Premium</span>
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
