"use client";

import React from "react";
import { X, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationStatus, JobApplicantDTO } from "@/types/api";

interface ApplicantScreeningModalProps {
  applicant: JobApplicantDTO | null;
  isRerunning: boolean;
  onClose: () => void;
  onRerunScreening: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
}

export function ApplicantScreeningModal({
  applicant,
  isRerunning,
  onClose,
  onRerunScreening,
  onUpdateStatus,
}: ApplicantScreeningModalProps) {
  if (!applicant) return null;

  const candidateDisplayName = applicant.candidateName || applicant.candidate?.name || "Candidate Evaluation";
  const candidateEmail = applicant.candidateEmail || applicant.candidate?.email;
  const score = applicant.screeningResult?.score || 0;
  const recommendation = applicant.screeningResult?.recommendation || "RECOMMEND";

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AI Screening Report
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Model: {applicant.screeningResult?.modelUsed || "gpt-4o-mini"}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">{candidateDisplayName}</h2>
            <p className="text-xs text-slate-400">{candidateEmail}</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score & Recommendation Banner */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl ${
                score >= 80
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : score >= 60
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              {score}%
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Overall ATS Alignment</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Recommendation:{" "}
                <strong className="text-indigo-400 uppercase font-semibold">
                  {recommendation}
                </strong>
              </p>
            </div>
          </div>

          <Button
            size="sm"
            disabled={isRerunning}
            onClick={() => onRerunScreening(applicant.id || "")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 rounded-xl font-semibold shadow-md cursor-pointer"
          >
            {isRerunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            )}
            Re-evaluate
          </Button>
        </div>

        {/* AI Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Evaluation Executive Summary</h4>
          <p className="text-xs text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            {applicant.screeningResult?.summary || "No executive summary provided."}
          </p>
        </div>

        {/* Category Score Breakdown */}
        {applicant.screeningResult?.rawAiResponse?.scoreBreakdown && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Category Score Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(
                applicant.screeningResult.rawAiResponse.scoreBreakdown
              ).map(([cat, val]) => (
                <div key={cat} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="text-lg font-bold text-indigo-400">{val}%</div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    {cat.replace(/([A-Z])/g, " $1")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths & Gaps Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="space-y-2 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Core Candidate Strengths
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              {applicant.screeningResult?.strengths?.length ? (
                applicant.screeningResult.strengths.map((str, i) => (
                  <li key={i} className="leading-tight">{str}</li>
                ))
              ) : (
                <li className="text-slate-500 italic list-none">No specific strengths highlighted</li>
              )}
            </ul>
          </div>

          {/* Gaps / Areas to Probe */}
          <div className="space-y-2 p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Areas to Probe in Interview
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              {applicant.screeningResult?.gaps?.length ? (
                applicant.screeningResult.gaps.map((gap, i) => (
                  <li key={i} className="leading-tight">{gap}</li>
                ))
              ) : (
                <li className="text-slate-500 italic list-none">No major gaps identified</li>
              )}
            </ul>
          </div>
        </div>

        {/* Quick Status Action Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800 gap-3 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Quick Status Transition:</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(applicant.id || "", "SHORTLISTED")}
              className="border-emerald-700/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 text-xs h-8 rounded-lg cursor-pointer"
            >
              Shortlist Candidate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(applicant.id || "", "INTERVIEWING")}
              className="border-sky-700/60 bg-sky-950/40 text-sky-300 hover:bg-sky-900/60 text-xs h-8 rounded-lg cursor-pointer"
            >
              Invite to Interview
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(applicant.id || "", "REJECTED")}
              className="border-rose-700/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs h-8 rounded-lg cursor-pointer"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
