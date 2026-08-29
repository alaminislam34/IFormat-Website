"use client";

import React from "react";
import { Mail, Calendar, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationStatus, JobApplicantDTO } from "@/types/api";

interface ApplicantCardRowProps {
  app: JobApplicantDTO;
  isRerunning: boolean;
  isUpdating: boolean;
  onOpenDrawer: (app: JobApplicantDTO) => void;
  onRerunScreening: (id: string, e?: React.MouseEvent) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus, e?: React.MouseEvent) => void;
}

export function ApplicantCardRow({
  app,
  isRerunning,
  isUpdating,
  onOpenDrawer,
  onRerunScreening,
  onUpdateStatus,
}: ApplicantCardRowProps) {
  const name = app.candidateName || app.candidate?.name || "Candidate";
  const email = app.candidateEmail || app.candidate?.email || "No email available";
  const score = app.screeningResult?.score;
  const hasScreening = typeof score === "number";
  const recommendation = app.screeningResult?.recommendation || "RECOMMEND";
  const appId = app.id || "";

  return (
    <div
      onClick={() => hasScreening && onOpenDrawer(app)}
      className={`bg-slate-900/80 border rounded-3xl p-5 sm:p-6 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
        hasScreening
          ? "hover:border-slate-700 cursor-pointer border-slate-800/90"
          : "border-slate-800/80"
      }`}
    >
      {/* Left: Candidate Info */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-base shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-bold text-white">{name}</h3>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                app.status === "SHORTLISTED"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : app.status === "SCREENED"
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                  : app.status === "INTERVIEWING"
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                  : app.status === "OFFERED" || app.status === "HIRED"
                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                  : app.status === "REJECTED"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {app.status || "SUBMITTED"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" /> {email}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Applied {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recently"}
            </span>
          </div>
          {app.coverNote && (
            <p className="text-xs text-slate-400/90 line-clamp-1 italic mt-1 max-w-xl">
              &ldquo;{app.coverNote}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Middle: AI Screening Score Badge */}
      <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
        {hasScreening ? (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                score! >= 80
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : score! >= 60
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              {score}%
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-white">
                  {recommendation === "RECOMMEND" || recommendation === "STRONG_MATCH"
                    ? "Strong Fit"
                    : recommendation === "CONSIDER"
                    ? "Moderate Match"
                    : "Low Alignment"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-50">
                {app.screeningResult?.summary || "Screening score calculated by AI engine."}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Not screened yet</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {hasScreening ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenDrawer(app)}
              className="border-slate-800 bg-slate-950/40 hover:bg-slate-800 text-slate-300 text-xs h-9 rounded-xl font-medium cursor-pointer"
            >
              View Evaluation
            </Button>
          ) : null}

          <Button
            size="sm"
            disabled={isRerunning}
            onClick={(e) => onRerunScreening(appId, e)}
            className={`text-xs h-9 rounded-xl font-semibold transition-all cursor-pointer ${
              hasScreening
                ? "border border-slate-800 bg-slate-950/40 hover:bg-slate-800 text-slate-300"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
            }`}
          >
            {isRerunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Screening...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                {hasScreening ? "Re-run" : "Run AI Screen"}
              </>
            )}
          </Button>

          {/* Status Dropdown */}
          <select
            value={app.status || "SUBMITTED"}
            disabled={isUpdating}
            onChange={(e) =>
              onUpdateStatus(appId, e.target.value as ApplicationStatus)
            }
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="SUBMITTED">Submitted</option>
            <option value="SCREENED">Screened</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFERED">Offered</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>
    </div>
  );
}
