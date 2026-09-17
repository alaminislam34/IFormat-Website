"use client";

import React from "react";
import { X, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationStatus, JobApplicantDTO, isInsufficientResumeScreening } from "@/types/api";

interface ApplicantScreeningModalProps {
  applicant: JobApplicantDTO | null;
  isRerunning?: boolean;
  onClose: () => void;
  onRerunScreening?: (id: string) => void;
  onUpdateStatus?: (id: string, newStatus: ApplicationStatus) => void;
}

export function ApplicantScreeningModal({
  applicant,
  isRerunning = false,
  onClose,
  onRerunScreening,
  onUpdateStatus,
}: ApplicantScreeningModalProps) {
  if (!applicant) return null;

  const candidateDisplayName = applicant.candidateName || applicant.candidate?.name || "Candidate Evaluation";
  const candidateEmail = applicant.candidateEmail || applicant.candidate?.email;
  const score = applicant.screeningResult?.score || 0;
  const insufficient = isInsufficientResumeScreening(applicant.screeningResult);
  const recommendation = applicant.screeningResult?.recommendation || "RECOMMEND";

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0A54B1] border border-blue-200/60">
                AI Screening Report
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Model: {applicant.screeningResult?.modelUsed || "gpt-4o-mini"}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">{candidateDisplayName}</h2>
            <p className="text-xs text-slate-500">{candidateEmail}</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ATS Alignment Purpose Clarification */}
        <div className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs ${
          insufficient
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : "bg-blue-50 border-blue-200 text-blue-900"
        }`}>
          <Sparkles className={`w-4 h-4 shrink-0 ${insufficient ? "text-amber-600" : "text-[#0A54B1]"}`} />
          <span>
            {insufficient
              ? "Screening did not run on this application because no readable resume text was found. This is not a capability score. Ask the candidate to upload their actual PDF, then re-evaluate."
              : "This report evaluates how closely the candidate's CV matches the requirements of this specific job posting. A low score indicates role mismatch, not general candidate capability."}
          </span>
        </div>

        {/* Score & Recommendation Banner */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl ${
                insufficient
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : score >= 80
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : score >= 60
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {insufficient ? "—" : `${score}%`}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {insufficient ? "Screening skipped" : "Overall ATS Alignment"}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {insufficient ? (
                  "Waiting for a readable candidate resume"
                ) : (
                  <>
                    Recommendation:{" "}
                    <strong className="text-[#0A54B1] uppercase font-bold">
                      {recommendation}
                    </strong>
                  </>
                )}
              </p>
            </div>
          </div>

          {onRerunScreening && (
            <Button
              size="sm"
              disabled={isRerunning}
              onClick={() => onRerunScreening(applicant.id || "")}
              className="bg-[#0A54B1] hover:bg-[#08448f] text-white text-xs h-9 rounded-xl font-semibold shadow-xs cursor-pointer"
            >
              {isRerunning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              )}
              Re-evaluate
            </Button>
          )}
        </div>

        {/* AI Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Evaluation Executive Summary</h4>
          <p className="text-xs text-slate-700 leading-relaxed p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            {applicant.screeningResult?.summary || "No executive summary provided."}
          </p>
        </div>

        {/* Category Score Breakdown */}
        {applicant.screeningResult?.rawAiResponse?.scoreBreakdown && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Category Score Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(
                applicant.screeningResult.rawAiResponse.scoreBreakdown
              ).map(([cat, val]) => (
                <div key={cat} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-lg font-bold text-[#0A54B1]">{val}%</div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
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
          <div className="space-y-2 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Core Candidate Strengths
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
              {applicant.screeningResult?.strengths?.length ? (
                applicant.screeningResult.strengths.map((str, i) => (
                  <li key={i} className="leading-tight">{str}</li>
                ))
              ) : (
                <li className="text-slate-400 italic list-none">No specific strengths highlighted</li>
              )}
            </ul>
          </div>

          {/* Gaps / Areas to Probe */}
          <div className="space-y-2 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Areas to Probe in Interview
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
              {applicant.screeningResult?.gaps?.length ? (
                applicant.screeningResult.gaps.map((gap, i) => (
                  <li key={i} className="leading-tight">{gap}</li>
                ))
              ) : (
                <li className="text-slate-400 italic list-none">No major gaps identified</li>
              )}
            </ul>
          </div>
        </div>

        {/* Quick Status Action Footer (Employer Only) */}
        {onUpdateStatus && (
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 gap-3 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Quick Status Transition:</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(applicant.id || "", "SHORTLISTED")}
                className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs h-8 rounded-lg cursor-pointer"
              >
                Shortlist Candidate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(applicant.id || "", "INTERVIEWING")}
                className="border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs h-8 rounded-lg cursor-pointer"
              >
                Invite to Interview
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(applicant.id || "", "REJECTED")}
                className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs h-8 rounded-lg cursor-pointer"
              >
                Decline
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
