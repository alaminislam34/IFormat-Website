"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiService } from "@/services/ai.service";
import { JobFitAnalysisDTO } from "@/types/api";
import { toast } from "sonner";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

interface JobAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: string;
    description?: string;
  };
  onApplyNow?: () => void;
  onRequireUpgrade?: (message?: string) => void;
}

export function JobAnalyzerModal({
  isOpen,
  onClose,
  job,
  onApplyNow,
  onRequireUpgrade,
}: JobAnalyzerModalProps) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<JobFitAnalysisDTO | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !job?.id) return;

    let isMounted = true;
    setLoading(true);
    setAnalysis(null);

    aiService
      .analyzeJobFit({ jobId: job.id })
      .then((data) => {
        if (isMounted) {
          setAnalysis(data);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setLoading(false);

        const isQuotaOrSubError =
          err?.code === "SUBSCRIPTION_REQUIRED" ||
          err?.statusCode === 403 ||
          err?.status === 403 ||
          err?.message?.includes("free monthly limit") ||
          err?.message?.includes("SUBSCRIPTION_REQUIRED") ||
          err?.message?.includes("Upgrade to Pro") ||
          err?.message?.includes("quota") ||
          err?.message?.includes("limit");

        if (isQuotaOrSubError) {
          const message =
            err?.message ||
            "You have reached your free monthly limit of 5 AI generations. Upgrade to Pro for unlimited real-time job match analysis, tailored cover letters, and resume optimization.";

          setUpgradeMessage(message);

          if (onRequireUpgrade) {
            onRequireUpgrade(message);
          } else {
            setShowUpgradeModal(true);
          }
        } else {
          toast.error(err?.message || "Failed to analyze job fit. Please try again.");
          onClose();
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, job?.id, onClose, onRequireUpgrade]);

  const score = analysis?.score ?? 0;
  const scoreColor =
    score >= 75
      ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
      : score >= 50
      ? "text-amber-500 border-amber-500/30 bg-amber-500/10"
      : "text-rose-500 border-rose-500/30 bg-rose-500/10";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-100000 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            {/* Backdrop Click-away */}
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-linear-to-r from-slate-50 to-sky-50/40">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-100 text-[#0A54B1]">
                  <Sparkles className="w-3.5 h-3.5 text-[#0A54B1]" />
                  AI Candidate Fit & Match Report
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {job.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.company}</span>
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loading ? (
                /* Scanning Loading State */
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative w-20 h-20 rounded-3xl bg-sky-50 flex items-center justify-center border border-sky-100 shadow-inner">
                    <Brain className="w-10 h-10 text-[#0A54B1] animate-pulse" />
                    <span className="absolute inset-0 rounded-3xl border-2 border-sky-400 animate-ping opacity-25" />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="text-base font-extrabold text-slate-900">
                      Analyzing Your Profile & Resume...
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Our AI engine is evaluating your technical skills, work experience, and domain
                      alignment against the requirements of {job.company}.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-slate-400 bg-slate-50">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0A54B1]" />
                    <span>Processing live LLM evaluation</span>
                  </div>
                </div>
              ) : !analysis?.hasResume ? (
                /* Missing Resume State */
                <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-amber-900">
                      Resume Profile Required
                    </h4>
                    <p className="text-xs text-amber-800/80 max-w-md mx-auto leading-relaxed">
                      {analysis?.summary ||
                        "Please create or upload a resume in the AI Career Assistant so our engine can evaluate your profile against this role."}
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link href="/job-assistant" onClick={onClose}>
                      <Button className="bg-[#0A54B1] hover:bg-[#08428C] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Create Resume in AI Assistant
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Analysis Result */
                <div className="space-y-6">
                  {/* Score & Recommendation Banner */}
                  <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center gap-6 shadow-lg border border-slate-800">
                    <div
                      className={`w-24 h-24 rounded-3xl border-2 flex flex-col items-center justify-center shrink-0 ${scoreColor}`}
                    >
                      <span className="text-3xl font-black tracking-tight">{score}%</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider mt-0.5">
                        Match Score
                      </span>
                    </div>

                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 text-sky-300">
                        <ShieldCheck className="w-3 h-3" />
                        Recommendation
                      </div>
                      <h4 className="text-sm font-extrabold text-white leading-snug">
                        {analysis.recommendation}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                        {analysis.summary}
                      </p>
                    </div>
                  </div>

                  {/* 4 Pillars Score Breakdown */}
                  {analysis.scoreBreakdown && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                        <span>Core Evaluation Pillars</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white rounded-xl p-3 border border-slate-100 text-center space-y-1">
                          <span className="text-[11px] font-bold text-slate-400">Skills Match</span>
                          <div className="text-lg font-black text-slate-900">
                            {analysis.scoreBreakdown.skills}%
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-3 border border-slate-100 text-center space-y-1">
                          <span className="text-[11px] font-bold text-slate-400">Experience</span>
                          <div className="text-lg font-black text-slate-900">
                            {analysis.scoreBreakdown.experience}%
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-3 border border-slate-100 text-center space-y-1">
                          <span className="text-[11px] font-bold text-slate-400">Education</span>
                          <div className="text-lg font-black text-slate-900">
                            {analysis.scoreBreakdown.education}%
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-3 border border-slate-100 text-center space-y-1">
                          <span className="text-[11px] font-bold text-slate-400">Domain Fit</span>
                          <div className="text-lg font-black text-slate-900">
                            {analysis.scoreBreakdown.domainMatch}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Strengths & Missing Keywords */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 uppercase tracking-wide">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Profile Strengths ({analysis.strengths.length})</span>
                      </div>
                      <ul className="space-y-1.5">
                        {analysis.strengths.map((str, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-700 flex items-start gap-1.5 leading-snug"
                          >
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Gaps / Advice */}
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 uppercase tracking-wide">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Recommended Improvements ({analysis.gaps.length})</span>
                      </div>
                      <ul className="space-y-1.5">
                        {analysis.gaps.map((gap, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-700 flex items-start gap-1.5 leading-snug"
                          >
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {analysis?.hasResume && (
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                  href={`/job-assistant?tab=cover-letter&role=${encodeURIComponent(
                    job.title
                  )}&company=${encodeURIComponent(job.company)}`}
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-11 rounded-xl text-xs font-bold border-slate-200 hover:bg-white cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#0A54B1]" />
                    Generate Tailored Cover Letter
                  </Button>
                </Link>

                {onApplyNow && (
                  <Button
                    onClick={() => {
                      onClose();
                      onApplyNow();
                    }}
                    className="w-full sm:w-auto h-11 px-6 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/15 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
        )}
      </AnimatePresence>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          onClose();
        }}
        role="candidate"
        title="AI Career Assistant Quota Reached"
        message={
          upgradeMessage ||
          "You have reached your free monthly limit of 5 AI generations. Upgrade to Pro for unlimited real-time job match analysis, tailored cover letters, and resume optimization."
        }
      />
    </>
  );
}
